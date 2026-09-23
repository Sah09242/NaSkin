/* Optional privacy-friendly analytics.
   To enable after launch, add this before </head> in index.html:
   <script defer data-domain="naskin.netlify.app" src="https://plausible.io/js/script.js"></script>
   Then replace the domain with your custom domain if you add one.

   This file provides lightweight interaction events if your analytics provider
   supports Plausible custom events. It is intentionally not loaded by default
   until analytics consent/provider configuration is confirmed.
*/
(() => {
  const track = (event, props = {}) => {
    if (typeof window.plausible === 'function') window.plausible(event, { props });
  };
  document.addEventListener('click', (event) => {
    const product = event.target.closest('.add-button');
    if (product) track('Add to bag', { product: product.dataset.name || '' });
    const gallery = event.target.closest('.product-image');
    if (gallery) track('Open gallery', { product: gallery.dataset.gallery || '' });
  });
})();
