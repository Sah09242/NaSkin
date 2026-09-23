# NaSkin launch assets

- `assets/favicon.svg` is the browser and bookmark icon.
- `assets/social-card.svg` is the Open Graph preview artwork.
- `analytics.js` contains optional Plausible interaction events and is intentionally not enabled until the analytics provider and privacy notice are confirmed.

## Enable social sharing metadata

Add these tags inside `index.html` `<head>`:

```html
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="NaSkin">
<meta property="og:title" content="NaSkin | Skincare with fewer, better ingredients">
<meta property="og:description" content="Clean botanical skincare made in small batches in Pune.">
<meta property="og:url" content="https://naskin.netlify.app/">
<meta property="og:image" content="https://naskin.netlify.app/assets/social-card.svg">
<meta name="twitter:card" content="summary_large_image">
```

## Enable Plausible analytics after launch

1. Create a Plausible site for `naskin.netlify.app`.
2. Add the provider script before `</head>`:

```html
<script defer data-domain="naskin.netlify.app" src="https://plausible.io/js/script.js"></script>
```

3. Load `analytics.js` after the provider script:

```html
<script defer src="analytics.js"></script>
```

Use original, licensed NaSkin product photos when available. The current remote lifestyle images are placeholders and should be replaced with owned product photography before commercial launch.
