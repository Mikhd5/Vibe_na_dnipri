(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Branded intro — wave drawing and a short, non-blocking reveal.
  const loader = $('#preloader');
  const loaderNumber = $('#preloaderNumber');
  let progress = 1;
  const loaderTimer = window.setInterval(() => {
    progress = Math.min(99, progress + Math.ceil(Math.random() * 9));
    if (loaderNumber) loaderNumber.textContent = String(progress).padStart(2, '0');
  }, 95);
  const hideLoader = () => {
    if (!loader || loader.classList.contains('is-hidden')) return;
    window.clearInterval(loaderTimer);
    if (loaderNumber) loaderNumber.textContent = '100';
    window.setTimeout(() => loader.classList.add('is-hidden'), 180);
  };
  window.addEventListener('load', () => window.setTimeout(hideLoader, 750), { once: true });
  window.setTimeout(hideLoader, 2600);

  const header = $('#header');
  const nav = $('#nav');
  const menuToggle = $('#menuToggle');
  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 36);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Відкрити меню');
    document.body.classList.remove('menu-open');
  };
  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Закрити меню' : 'Відкрити меню');
    nav?.classList.toggle('is-open', expanded);
    document.body.classList.toggle('menu-open', expanded);
  });
  $$('.nav__link').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (menuToggle?.getAttribute('aria-expanded') !== 'true') return;
    if (!event.target.closest('.header')) closeMenu();
  });

  // Reveal sections as they enter the viewport.
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    $$('.reveal').forEach(element => revealObserver.observe(element));
  } else {
    $$('.reveal').forEach(element => element.classList.add('is-visible'));
  }

  // Current-section navigation state.
  const navTargets = $$('.nav__link').map(link => ({ link, target: $(link.getAttribute('href')) })).filter(item => item.target);
  if ('IntersectionObserver' in window && navTargets.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navTargets.forEach(item => item.link.classList.toggle('is-active', item.target === entry.target));
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    navTargets.forEach(item => sectionObserver.observe(item.target));
  }

  // Adaptive hero video: use a lightweight 960px stream on phones and a 1080p stream on desktop.
  // Respect reduced-motion and browser data-saver preferences; the poster remains as a premium fallback.
  const hero = $('.hero');
  const heroVideo = $('.hero__video');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileViewport = window.matchMedia('(max-width: 768px)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const dataSaver = Boolean(connection?.saveData);
  let currentHeroSource = '';
  const sourceNode = heroVideo ? $('source', heroVideo) : null;
  const playHeroVideo = () => {
    if (!heroVideo || !sourceNode?.src || document.hidden) return;
    heroVideo.play().then(() => {
      hero?.classList.remove('is-static');
      hero?.classList.add('has-video');
    }).catch(() => {
      hero?.classList.add('is-static');
      hero?.classList.remove('has-video');
    });
  };
  const configureHeroVideo = () => {
    if (!heroVideo || !sourceNode) return;
    if (reduceMotion || dataSaver) {
      heroVideo.pause();
      hero?.classList.add('is-static');
      hero?.classList.remove('has-video');
      return;
    }
    const desiredSource = mobileViewport.matches ? heroVideo.dataset.mobileSrc : heroVideo.dataset.desktopSrc;
    if (!desiredSource) {
      hero?.classList.add('is-static');
      return;
    }
    const resolvedSource = new URL(desiredSource, document.baseURI).href;
    if (currentHeroSource !== resolvedSource) {
      currentHeroSource = resolvedSource;
      heroVideo.pause();
      sourceNode.src = desiredSource;
      heroVideo.load();
    }
    if (heroVideo.readyState >= 2) playHeroVideo();
    else heroVideo.addEventListener('canplay', playHeroVideo, { once: true });
  };
  if (heroVideo) {
    heroVideo.addEventListener('error', () => {
      hero?.classList.add('is-static');
      hero?.classList.remove('has-video');
    });
    configureHeroVideo();
    if (typeof mobileViewport.addEventListener === 'function') mobileViewport.addEventListener('change', configureHeroVideo);
    else mobileViewport.addListener(configureHeroVideo);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) heroVideo.pause();
      else configureHeroVideo();
    });
  }
  // Keep parallax desktop-only: avoid scroll-linked repaints and battery use on mobile.
  if (hero && heroVideo && !reduceMotion && window.matchMedia('(min-width: 901px)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, hero.offsetHeight);
        heroVideo.style.transform = `scale(1.02) translate3d(0, ${y * 0.045}px, 0)`;
        ticking = false;
      });
    }, { passive: true });
  }

  // Booking estimate: availability is always confirmed by the owner, never faked.
  const arrival = $('#arrival');
  const departure = $('#departure');
  const guests = $('#guests');
  const includeTub = $('#includeTub');
  const estimateValue = $('#estimateValue');
  const estimateNote = $('#estimateNote');
  const bookingForm = $('#bookingForm');
  const formResult = $('#formResult');
  const formatISO = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (arrival) arrival.min = formatISO(today);
  if (departure) departure.min = formatISO(today);
  const heroArrival = $('#heroArrival');
  const heroDeparture = $('#heroDeparture');
  if (heroArrival) heroArrival.min = formatISO(today);
  if (heroDeparture) heroDeparture.min = formatISO(today);

  const nightsBetween = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(`${start}T12:00:00`);
    const endDate = new Date(`${end}T12:00:00`);
    return Math.round((endDate - startDate) / 86400000);
  };
  const money = amount => `${new Intl.NumberFormat('uk-UA').format(amount)} грн`;
  const setDepartureMin = () => {
    if (!arrival?.value || !departure) return;
    const nextDay = new Date(`${arrival.value}T12:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    departure.min = formatISO(nextDay);
    if (departure.value && departure.value <= arrival.value) departure.value = '';
  };
  const estimate = () => {
    const nights = nightsBetween(arrival?.value, departure?.value);
    const guestCount = Number(guests?.value || 2);
    const tub = Boolean(includeTub?.checked);
    const total = nights > 0 ? nights * 7500 + (tub ? nights * 3000 : 0) : 0;
    if (estimateValue) estimateValue.textContent = nights > 0 ? money(total) : 'Оберіть дати';
    if (estimateNote) {
      estimateNote.textContent = nights > 0
        ? `${nights} ${nights === 1 ? 'доба' : nights < 5 ? 'доби' : 'діб'} · ${guestCount} ${guestCount === 1 ? 'гість' : guestCount < 5 ? 'гості' : 'гостей'} · попередній розрахунок`
        : 'Доступність та остаточну ціну підтверджує власник.';
    }
    return { nights, guestCount, tub, total };
  };
  arrival?.addEventListener('change', () => { setDepartureMin(); estimate(); });
  departure?.addEventListener('change', estimate);
  guests?.addEventListener('change', estimate);
  includeTub?.addEventListener('change', estimate);

  const heroBooking = $('#heroBooking');
  const setHeroDepartureMin = () => {
    if (!heroArrival?.value || !heroDeparture) return;
    const nextDay = new Date(`${heroArrival.value}T12:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    heroDeparture.min = formatISO(nextDay);
    if (heroDeparture.value && heroDeparture.value <= heroArrival.value) heroDeparture.value = '';
  };
  heroArrival?.addEventListener('change', setHeroDepartureMin);
  heroBooking?.addEventListener('submit', event => {
    event.preventDefault();
    const nights = nightsBetween(heroArrival?.value, heroDeparture?.value);
    if (nights < 1) {
      alert('Оберіть коректні дати: виїзд має бути щонайменше на день пізніше за заїзд.');
      return;
    }
    if (arrival) arrival.value = heroArrival.value;
    if (departure) departure.value = heroDeparture.value;
    if (guests) guests.value = $('#heroGuests')?.value || '2';
    if (includeTub) includeTub.checked = Boolean($('#heroTub')?.checked);
    setDepartureMin();
    estimate();
    $('#booking')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  const dateLabel = value => new Date(`${value}T12:00:00`).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  bookingForm?.addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#guestName')?.value.trim();
    const phone = $('#guestPhone')?.value.trim();
    const booking = estimate();
    if (!name || !phone || booking.nights < 1 || booking.guestCount > 8) {
      if (formResult) formResult.textContent = 'Перевірте ім’я, телефон та обрані дати. Мінімум одна доба, максимум 8 гостей.';
      $('#bookingDelivery')?.setAttribute('hidden', '');
      return;
    }

    const message = [
      'Добрий день! Хочу залишити запит на бронювання VIBE на Дніпрі.',
      '',
      `Ім’я: ${name}`,
      `Телефон гостя: ${phone}`,
      `Заїзд: ${dateLabel(arrival.value)}`,
      `Виїзд: ${dateLabel(departure.value)}`,
      `Кількість гостей: ${booking.guestCount}`,
      `Чан: ${booking.tub ? 'так' : 'ні'}`,
      `Орієнтовна вартість: ${money(booking.total)}`,
      '',
      'Будь ласка, підтвердіть доступність дат та умови бронювання.'
    ].join('\n');

    const encodedMessage = encodeURIComponent(message);
    const telegramLink = $('#sendTelegram');
    const instagramLink = $('#sendInstagram');
    const delivery = $('#bookingDelivery');

    // Telegram supports a pre-filled draft through its official username/phone deep-link syntax.
    if (telegramLink) telegramLink.href = `https://t.me/+380637022513?text=${encodedMessage}`;
    if (instagramLink) instagramLink.href = 'https://ig.me/m/vibe_na_dnipri';

    if (formResult) formResult.textContent = 'Запит сформовано. Оберіть зручний спосіб надсилання:';
    if (delivery) {
      delivery.hidden = false;
      delivery.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  });

  // Image lightbox.
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightboxImage');
  let lastLightboxTrigger = null;
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lightboxImage) lightboxImage.src = '';
    lastLightboxTrigger?.focus();
    lastLightboxTrigger = null;
  };
  $$('.gallery-photo').forEach(button => button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lastLightboxTrigger = button;
    lightboxImage.src = button.dataset.image;
    lightboxImage.alt = button.querySelector('img')?.alt || 'Фотографія VIBE';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('#lightboxClose')?.focus();
  }));
  $('#lightboxClose')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

  // Video modals: the property tour and the supplied 4K ambience clip are separate.
  let activeVideoModal = null;
  let lastVideoTrigger = null;
  const closeVideo = () => {
    if (!activeVideoModal) return;
    const video = $('video', activeVideoModal);
    activeVideoModal.classList.remove('is-open');
    activeVideoModal.setAttribute('aria-hidden', 'true');
    video?.pause();
    if (video) video.currentTime = 0;
    activeVideoModal = null;
    document.body.classList.remove('is-locked');
    lastVideoTrigger?.focus();
    lastVideoTrigger = null;
  };
  $$('[data-open-video]').forEach(trigger => trigger.addEventListener('click', () => {
    closeVideo();
    const targetId = trigger.dataset.openVideo;
    const modal = targetId ? document.getElementById(targetId) : null;
    if (!modal) return;
    lastVideoTrigger = trigger;
    activeVideoModal = modal;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('.video-modal__close', modal)?.focus();
    $('video', modal)?.play().catch(() => {});
  }));
  $$('.video-modal__close').forEach(button => button.addEventListener('click', closeVideo));
  $$('.video-modal').forEach(modal => modal.addEventListener('click', event => { if (event.target === modal) closeVideo(); }));

  // One FAQ row open at a time keeps the section calm and compact.
  $$('.faq__list details').forEach(detail => detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    $$('.faq__list details').forEach(other => { if (other !== detail) other.open = false; });
  }));

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeLightbox(); closeVideo(); closeMenu(); }
    if (event.key === 'Tab') {
      const activeDialog = activeVideoModal || (lightbox?.classList.contains('is-open') ? lightbox : null);
      if (!activeDialog) return;
      const focusable = $$('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])', activeDialog).filter(element => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
