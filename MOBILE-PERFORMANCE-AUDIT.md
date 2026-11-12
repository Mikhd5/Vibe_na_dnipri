# VIBE — mobile and performance hardening notes

## Changes applied

- Added a dedicated 960×506 / 24 fps mobile hero video; desktop uses 1920×1012 / 24 fps.
- The hero video is not preloaded; JavaScript selects the correct stream after page parsing.
- The 4K master is not served to mobile visitors. A lightweight poster is preloaded and remains visible when video is unsupported, reduced-motion is enabled, or Save-Data is active.
- The hero video pauses when the tab is hidden; parallax is desktop-only.
- Reworked the tablet booking selector into a deliberate two-column layout so the submit button does not fall into an accidental implicit grid row.
- Increased small mobile text, input heights, navigation hit areas, and form control sizes.
- Added mobile menu scroll locking, outside-click close, `aria-controls`, focus-visible styles and a skip link.
- Added intrinsic width/height attributes and async image decoding to the content images.
- Compressed the property-tour video and kept modal playback on demand.
- Added dialog roles/labels and focus restoration for the photo and video modals.

## Verified statically

- `node --check script.js` passes.
- `tinycss2` parses the stylesheet with zero top-level syntax errors.
- Local HTML resource paths, image alt text, intrinsic image dimensions, and in-page anchor targets were checked.
- All required files for the adaptive video sources exist.

## Media weights

| Asset | Resolution | Size |
|---|---:|---:|
| Desktop hero | 1920×1012 | ~1.6 MB |
| Mobile hero | 960×506 | ~0.42 MB |
| Hero poster | 1600×844 | ~27 KB |
| Property tour (on demand) | 720×1280 | ~7.5 MB |

## Not claimed

A formal Lighthouse/PageSpeed 100/100 score is not claimed. Real Core Web Vitals depend on the final Vercel deployment, domain, font delivery, network, device and third-party requests. A real browser-based Lighthouse run on the deployed URL is still required before promising a score.
