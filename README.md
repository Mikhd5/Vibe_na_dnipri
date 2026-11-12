# VIBE на Дніпрі — responsive website

Static responsive website based on the two approved VIBE homepage compositions: full-screen video hero, transparent navigation, oversized editorial typography, floating booking selector, wave divider, forest-green sections, asymmetrical photo layouts, and gold booking controls.

## Run locally

Open `index.html`, or run a local server in this directory:

```bash
python -m http.server 4173
```

Open `http://localhost:4173`.

## Media delivery

- The hero uses the exact 4K ambience clip supplied in the conversation. The deploy bundle contains optimized derivatives rather than loading the 4K master on every device.
- Desktop hero: `assets/video/optimized/hero-desktop.mp4` (1920×1012, 24 fps, H.264 + AAC, about 1.6 MB).
- Mobile hero: `assets/video/optimized/hero-mobile.mp4` (960×506, 24 fps, H.264, about 0.42 MB).
- Hero poster/fallback: `assets/images/hero-window-poster.jpg` (about 27 KB).
- The property tour is `assets/video/house-tour.mp4` (720×1280, 24 fps) and is only played when opened.
- Hero video starts with `preload=none`, switches to the mobile encode on narrow viewports, and falls back to the poster when reduced motion or Save-Data is enabled.
- Images below the fold use lazy loading, async decoding, and intrinsic dimensions.
- `assets/brand/vibe-horizontal.svg` is the logo used in the header and preloader.

The original 4K ambience master is supplied separately from this deployment package to avoid shipping an unused 19 MB source file to the production site.

## Booking behavior

The form validates the selected date range and calculates an estimate using the supplied prices: 7,500 UAH per night; hot tub +3,000 UAH per night with the house; hot tub separately 1,000 UAH/hour. It produces a copyable booking request. It does **not** check live availability, send the request to Telegram, or take payment; the owner must confirm dates and final price.

Some supporting visuals are conceptual AI images. Confirm every depicted amenity against the actual property or replace it with approved real-property photos before commercial launch.
