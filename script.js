/* ============================================================
   NaSkin — interactions (single page, catalog-driven shop)
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const PRODUCTS = window.NASKIN_PRODUCTS || [];
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  /* Currency: dual $ / ₹ display */
  const USD_TO_INR = 87;
  const fmtINR = (n) => "₹" + Math.round(n * USD_TO_INR).toLocaleString("en-IN");
  const fmt = (n) => "$" + n.toFixed(2).replace(/\.00$/, "") + " · " + fmtINR(n);
  const thumb = (p) => p.img.replace("w=800", "w=200");

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Sticky header ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const navToggle = $("#nav-toggle");
  const nav = $("#primary-nav");

  function closeNav() {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  nav.addEventListener("click", (e) => { if (e.target.matches("a")) closeNav(); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeNav(); closeCart(); }
  });

  /* ---------- Toasts ---------- */
  const toastRegion = $("#toast-region");

  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastRegion.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 320);
    }, 2600);
  }

  /* ---------- Cart ---------- */
  const CART_KEY = "naskin-cart-v1";
  const drawer = $("#cart-drawer");
  const overlay = $("#cart-overlay");
  const itemsEl = $("#cart-items");
  const emptyEl = $("#cart-empty");
  const countEl = $("#cart-count");
  const subtotalEl = $("#cart-subtotal");

  const loadCart = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY)) || {};
      return Object.fromEntries(
        Object.entries(parsed).filter(([id, qty]) => byId[id] && Number.isInteger(qty) && qty > 0)
      );
    } catch { return {}; }
  };
  let cart = loadCart();

  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  function renderCart() {
    const ids = Object.keys(cart);
    itemsEl.innerHTML = "";
    countEl.textContent = ids.reduce((s, id) => s + cart[id], 0);

    if (ids.length === 0) {
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      ids.forEach((id) => {
        const p = byId[id];
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
          <img src="${thumb(p)}" alt="${p.name}" />
          <div>
            <h4>${p.name}</h4>
            <span class="item-price">${fmt(p.price)}</span>
            <div class="qty-controls">
              <button data-action="dec" data-id="${id}" aria-label="Decrease quantity of ${p.name}">−</button>
              <span class="qty" aria-live="polite">${cart[id]}</span>
              <button data-action="inc" data-id="${id}" aria-label="Increase quantity of ${p.name}">+</button>
            </div>
          </div>
          <button class="remove-item" data-action="remove" data-id="${id}">Remove</button>
        `;
        itemsEl.appendChild(li);
      });
    }

    subtotalEl.textContent = fmt(ids.reduce((s, id) => s + byId[id].price * cart[id], 0));
    saveCart();
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    countEl.classList.remove("bump");
    void countEl.offsetWidth;
    countEl.classList.add("bump");
    toast(`${byId[id].name} added to cart`);
  }

  function openCart() {
    drawer.classList.add("open");
    overlay.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    $(".cart-close").focus();
  }

  function closeCart() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  $("#cart-open").addEventListener("click", openCart);
  $("#cart-close").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  itemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === "inc") cart[id]++;
    if (action === "dec") { cart[id]--; if (cart[id] <= 0) delete cart[id]; }
    if (action === "remove") delete cart[id];
    renderCart();
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (btn && byId[btn.dataset.id]) addToCart(btn.dataset.id);
  });

  $("#checkout").addEventListener("click", () => {
    toast(Object.keys(cart).length === 0 ? "Your cart is empty." : "Checkout is a demo — connect a payment provider to go live.");
  });

  renderCart();

  /* ---------- Shop: filter & sort ---------- */
  const PRICE_RANGES = {
    all: () => true,
    under40: (p) => p < 40,
    m40to60: (p) => p >= 40 && p <= 60,
    over60: (p) => p > 60
  };
  const SORTS = {
    featured: (a, b) => a.order - b.order,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating
  };
  const CATEGORY_LABELS = {
    serums: "Serums & Oils", moisturizers: "Moisturizers",
    cleansers: "Cleansers", treatments: "Treatments & Masks"
  };

  const grid = $("#shop-grid");
  const emptyState = $("#empty-state");
  const countLabel = $("#result-count");
  const priceFilter = $("#price-filter");
  const sortSelect = $("#sort-select");
  const pills = $$("#category-pills .pill");

  const state = { cat: "all", price: "all", sort: "featured" };

  const starString = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

  function renderGrid() {
    const list = PRODUCTS.filter(
      (p) =>
        (state.cat === "all" || p.category === state.cat) &&
        PRICE_RANGES[state.price](p.price)
    ).sort(SORTS[state.sort]);

    if (list.length === PRODUCTS.length) {
      countLabel.textContent = `Showing all ${PRODUCTS.length} products`;
    } else if (state.cat !== "all") {
      countLabel.textContent = `${list.length} product${list.length === 1 ? "" : "s"} in ${CATEGORY_LABELS[state.cat]}`;
    } else {
      countLabel.textContent = `${list.length} of ${PRODUCTS.length} products`;
    }

    emptyState.hidden = list.length !== 0;
    grid.innerHTML = "";

    list.forEach((p) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-media">
          <img src="${p.img}" alt="NaSkin ${p.name}" loading="lazy" />
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        </div>
        <div class="product-body">
          <div class="stars" role="img" aria-label="Rated ${p.rating} out of 5 stars from ${p.reviews} reviews">${starString(p.rating)}</div>
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="product-foot">
            <span class="price">${fmt(p.price)}</span>
            <button class="btn btn-secondary add-to-cart" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function syncPills() {
    pills.forEach((pill) => {
      const active = pill.dataset.cat === state.cat;
      pill.classList.toggle("active", active);
      pill.setAttribute("aria-pressed", String(active));
    });
  }

  /* category counts (totals) */
  pills.forEach((pill) => {
    const cat = pill.dataset.cat;
    if (cat === "all") return;
    const span = document.createElement("span");
    span.className = "pill-count";
    span.textContent = PRODUCTS.filter((p) => p.category === cat).length;
    span.setAttribute("aria-hidden", "true");
    pill.appendChild(span);
  });

  pills.forEach((pill) =>
    pill.addEventListener("click", () => { state.cat = pill.dataset.cat; syncPills(); renderGrid(); })
  );
  priceFilter.addEventListener("change", () => { state.price = priceFilter.value; renderGrid(); });
  sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; renderGrid(); });
  $("#clear-filters").addEventListener("click", () => {
    state.cat = "all"; state.price = "all";
    priceFilter.value = "all";
    syncPills(); renderGrid();
  });

  syncPills();
  renderGrid();

  /* ---------- Scroll reveal ---------- */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Newsletter ---------- */
  const form = $("#newsletter-form");
  const email = $("#newsletter-email");
  const status = $("#form-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = email.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    if (!valid) {
      email.classList.add("invalid");
      status.textContent = "Please enter a valid email address.";
      status.className = "form-status err";
      email.focus();
      return;
    }

    email.classList.remove("invalid");
    status.textContent = "Welcome to the NaSkin Letter — check your inbox to confirm.";
    status.className = "form-status ok";
    toast("Subscribed successfully");
    form.reset();
  });

  email.addEventListener("input", () => {
    email.classList.remove("invalid");
    if (status.classList.contains("err")) {
      status.textContent = "";
      status.className = "form-status";
    }
  });

  /* ---------- Contact form ---------- */
  const cForm = $("#contact-form");
  if (cForm) {
    cForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const statusEl = $("#contact-status");
      if (!cForm.checkValidity()) {
        statusEl.textContent = "Please fill in all fields with a valid email.";
        statusEl.className = "form-status err";
        return;
      }
      statusEl.textContent = "Thank you — we'll reply within one business day.";
      statusEl.className = "form-status ok";
      cForm.reset();
    });
  }
  /* ---------- Active nav highlight (standalone) ---------- */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(".primary-nav a[href^='#']"));
  if (!links.length || !("IntersectionObserver" in window)) return;

  var map = [];
  links.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute("href"));
    if (sec) map.push({ link: a, section: sec });
  });

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      map.forEach(function (item) {
        item.link.classList.toggle("active", item.section === entry.target);
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  map.forEach(function (item) { spy.observe(item.section); });
})();

})();
