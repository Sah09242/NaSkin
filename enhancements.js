// NaSkin product expansion and interaction layer
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const products = [
    { id: '5', category: 'cleanser', tag: 'Daily cleanser', name: 'Oat Milk Cloud Cleanser', description: 'A soft, fragrance-free cream cleanser for calm, comfortable skin.', price: 1399, usd: 17, image: 'assets/oat-cleanser.svg', alt: 'NaSkin Oat Milk Cloud Cleanser' },
    { id: '6', category: 'treatment', tag: 'Brightening treatment', name: 'Vitamin C Glow Drops', description: 'A lightweight antioxidant serum for a visibly brighter, more even-looking complexion.', price: 2199, usd: 26, image: 'assets/vitamin-c.svg', alt: 'NaSkin Vitamin C Glow Drops' },
    { id: '7', category: 'treatment', tag: 'Lip treatment', name: 'Botanical Lip Balm', description: 'A nourishing botanical balm with shea butter and calendula for soft lips.', price: 699, usd: 9, image: 'assets/lip-balm.svg', alt: 'NaSkin Botanical Lip Balm' },
    { id: '8', category: 'sun-care', tag: 'Daily protection', name: 'Mineral Shield SPF 40', description: 'A comfortable mineral sunscreen designed for everyday broad-spectrum protection.', price: 1799, usd: 22, image: 'assets/sunscreen.svg', alt: 'NaSkin Mineral Shield SPF 40' }
  ];
  const grid = $('.product-grid');
  if (!grid) return;
  const filters = $('.filters');
  const extraFilters = [{ key: 'treatment', label: 'Treatments' }, { key: 'sun-care', label: 'Sun care' }];
  extraFilters.forEach(({ key, label }) => {
    if (!filters || filters.querySelector(`[data-filter="${key}"]`)) return;
    const button = document.createElement('button'); button.className = 'filter'; button.dataset.filter = key; button.textContent = label; filters.append(button);
  });
  products.forEach(product => {
    const card = document.createElement('article'); card.className = 'product-card'; card.dataset.category = product.category;
    card.innerHTML = `<button class="product-image" type="button" data-gallery="${product.id}" aria-label="View ${product.name} images"><img src="${product.image}" alt="${product.alt}" loading="lazy"><span>View gallery</span></button><p class="eyebrow">${product.tag}</p><h3>${product.name}</h3><p>${product.description}</p><div class="product-footer"><strong>₹${product.price.toLocaleString('en-IN')} <small>($${product.usd})</small></strong><button class="add-button" data-id="${product.id}" data-name="${product.name}" data-inr="${product.price}" data-usd="${product.usd}">Add to bag</button></div>`;
    grid.append(card);
  });
  const allProducts = products;
  const allCards = () => $$('.product-card');
  function applyFilter(key) { $$('.filter').forEach(b => b.classList.toggle('active', b.dataset.filter === key)); allCards().forEach(card => { card.hidden = key !== 'all' && card.dataset.category !== key; }); }
  $$('.filter').forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
  const existingGallery = { cleanser: 'Gentle Botanical Cleanser', serum: 'Niacinamide & Zinc Serum', moisturizer: 'Ceramide Moisture Lock', hydra: 'Hyaluronic Hydra Dew' };
  const galleryImages = {}; products.forEach(product => { galleryImages[product.id] = [product.image, product.image, product.image]; });
  const modal = $('#galleryModal'), galleryImage = $('#galleryImage'), galleryTitle = $('#galleryTitle'), thumbs = $('#galleryThumbs');
  let currentKey = null, currentIndex = 0;
  function renderGallery() { const images = galleryImages[currentKey]; galleryImage.src = images[currentIndex]; galleryImage.alt = galleryTitle.textContent; thumbs.replaceChildren(); images.forEach((src, index) => { const b = document.createElement('button'); b.type = 'button'; b.className = index === currentIndex ? 'active' : ''; b.innerHTML = `<img src="${src}" alt="">`; b.onclick = () => { currentIndex = index; renderGallery(); }; thumbs.append(b); }); }
  function openGallery(key, title) { currentKey = key; currentIndex = 0; galleryTitle.textContent = title; renderGallery(); modal.hidden = false; document.body.classList.add('no-scroll'); $('#galleryClose')?.focus(); }
  function closeGallery() { if (!modal) return; modal.hidden = true; document.body.classList.remove('no-scroll'); }
  $$('.product-image').forEach(button => button.addEventListener('click', () => { const card = button.closest('.product-card'); openGallery(button.dataset.gallery, $('h3', card).textContent); }));
  $('#galleryClose')?.addEventListener('click', closeGallery); $('#galleryPrevious')?.addEventListener('click', () => { const images = galleryImages[currentKey]; currentIndex = (currentIndex + images.length - 1) % images.length; renderGallery(); }); $('#galleryNext')?.addEventListener('click', () => { const images = galleryImages[currentKey]; currentIndex = (currentIndex + 1) % images.length; renderGallery(); }); modal?.addEventListener('click', e => { if (e.target === modal) closeGallery(); });
  const CART_KEY = 'naskin-cart'; let cart = (() => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } })();
  const cartButton = $('#cartButton'), cartPopover = $('#cartPopover'), cartBadge = $('#cartBadge'), cartItems = $('#cartItems'), cartEmpty = $('#cartEmpty'), cartTotal = $('#cartTotal'), cartTotalValue = $('#cartTotalValue'), checkout = $('#checkoutButton');
  const toast = message => { const t = $('#toast'); if (!t) return; t.textContent = message; t.classList.add('show'); clearTimeout(t.timer); t.timer = setTimeout(() => t.classList.remove('show'), 2400); };
  function renderCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); const count = cart.reduce((sum, i) => sum + i.qty, 0); cartBadge.textContent = count; cartBadge.style.display = count ? 'grid' : 'none'; cartEmpty.hidden = !!count; cartTotal.hidden = !count; checkout.hidden = !count; cartItems.replaceChildren(); let inr = 0, usd = 0; cart.forEach((item, index) => { inr += item.inr * item.qty; usd += item.usd * item.qty; const row = document.createElement('div'); row.className = 'cart-item'; row.innerHTML = `<span>${item.name} × ${item.qty}<br><small>₹${(item.inr * item.qty).toLocaleString('en-IN')} / $${item.usd * item.qty}</small></span><button class="remove-item" type="button" aria-label="Remove ${item.name}">×</button>`; row.querySelector('button').onclick = () => { cart.splice(index, 1); renderCart(); }; cartItems.append(row); }); cartTotalValue.textContent = `₹${inr.toLocaleString('en-IN')} / $${usd}`; }
  $$('.add-button').forEach(button => button.addEventListener('click', () => { const item = { id: button.dataset.id, name: button.dataset.name, inr: Number(button.dataset.inr), usd: Number(button.dataset.usd), qty: 1 }; const found = cart.find(i => i.id === item.id); found ? found.qty++ : cart.push(item); renderCart(); toast(`${item.name} added to your bag`); }));
  cartButton?.addEventListener('click', () => { const open = cartPopover.hidden; cartPopover.hidden = !open; cartButton.setAttribute('aria-expanded', String(open)); }); checkout?.addEventListener('click', () => toast('Checkout is ready to connect to your payment provider')); document.addEventListener('click', e => { if (!e.target.closest('#cartButton') && !e.target.closest('#cartPopover')) { cartPopover.hidden = true; cartButton?.setAttribute('aria-expanded', 'false'); } });
  const style = document.createElement('style'); style.textContent = `.product-grid{grid-template-columns:repeat(4,1fr)}.product-image img{background:#f2ede0}.product-card[hidden]{display:none!important}@media(max-width:899px){.product-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.product-grid{grid-template-columns:1fr}}`; document.head.append(style);
  renderCart();
})();
