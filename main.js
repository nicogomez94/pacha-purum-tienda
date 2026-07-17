const products = [
  {
    id: "tomate",
    name: "Tomate",
    subtitle: "Intensas, suaves y con mucho color.",
    description: "Láminas flexibles hechas a base de tomate. Tienen un sabor suave y un color increíble: ideales para wraps, canelones, rolls o lo que se te ocurra.",
    price: 8900,
    oldPrice: 9900,
    category: "laminas",
    badge: "Más vendido",
    color: "#e56f5b",
    ink: "#7a273d",
    tilt: "-4deg"
  },
  {
    id: "espinaca",
    name: "Espinaca",
    subtitle: "Frescas, versátiles y bien verdes.",
    description: "Láminas vegetales de espinaca, delicadas y resistentes a la vez. Combinan con rellenos frescos, quesos, hongos y todo tipo de vegetales.",
    price: 8900,
    category: "laminas",
    color: "#9ab360",
    ink: "#244431",
    tilt: "3deg"
  },
  {
    id: "zanahoria",
    name: "Zanahoria",
    subtitle: "Un toque dulce para crear distinto.",
    description: "Suaves láminas de zanahoria de color cálido y sabor sutilmente dulce. Perfectas para cocinar algo diferente sin complicarte.",
    price: 8900,
    category: "laminas",
    badge: "Nuevo",
    color: "#efad54",
    ink: "#7c4326",
    tilt: "-2deg"
  },
  {
    id: "remolacha",
    name: "Remolacha",
    subtitle: "Color potente, sabor delicado.",
    description: "Una edición especial de remolacha con un color que transforma cualquier plato. Rica, flexible y naturalmente libre de gluten.",
    price: 9400,
    category: "especiales",
    badge: "Edición limitada",
    color: "#b24b69",
    ink: "#5f1f39",
    tilt: "4deg"
  },
  {
    id: "combo-raiz",
    name: "Combo Raíz",
    subtitle: "Tomate + Espinaca + Zanahoria.",
    description: "El combo perfecto para conocer Pacha Purum: tres paquetes, tres colores y un montón de posibilidades para crear en la cocina.",
    price: 23900,
    oldPrice: 26700,
    category: "combos",
    badge: "Ahorrás $2.800",
    combo: true,
    color: "#efad54",
    ink: "#7c4326",
    tilt: "0deg"
  },
  {
    id: "combo-creativo",
    name: "Combo Creativo",
    subtitle: "Seis packs para llenar el freezer.",
    description: "Dos packs de cada sabor clásico para tener siempre una comida fácil a mano. Rinde un montón y te llega con envío gratis.",
    price: 44900,
    oldPrice: 53400,
    category: "combos",
    badge: "Envío gratis",
    combo: true,
    color: "#9ab360",
    ink: "#244431",
    tilt: "0deg"
  },
  {
    id: "tomate-picante",
    name: "Tomate Picante",
    subtitle: "Suave al principio. Pícara al final.",
    description: "Nuestra lámina de tomate con un toque de ají ahumado. Para tacos, rolls dorados y platos con un poco más de carácter.",
    price: 9600,
    category: "especiales",
    badge: "Edición especial",
    color: "#d84931",
    ink: "#681f1c",
    tilt: "-5deg"
  }
];

const money = value => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
}).format(value);

const productById = id => products.find(product => product.id === id) || products[0];

const getCart = () => {
  const stored = localStorage.getItem("pacha-cart");
  if (stored) return JSON.parse(stored);
  const demoCart = [{ id: "tomate", qty: 2 }, { id: "combo-raiz", qty: 1 }];
  localStorage.setItem("pacha-cart", JSON.stringify(demoCart));
  return demoCart;
};

let cart = getCart();
let currentProduct = products[0];
let detailQuantity = 1;
let couponApplied = false;

function packMarkup(product, small = false) {
  if (product.combo) {
    const comboProducts = [products[0], products[1], products[2]];
    return `<div class="combo-stack">${comboProducts.map(item => packMarkup(item, true)).join("")}</div>`;
  }

  return `<div class="product-pack${small ? " small-pack" : ""}" style="--pack-color:${product.color};--pack-ink:${product.ink};--tilt:${product.tilt}">
    <i class="fa-solid fa-seedling"></i>
    <strong>${product.name}</strong>
    <small>origen vegetal · forma nueva</small>
  </div>`;
}

function productCard(product) {
  return `<article class="product-card" data-product="${product.id}" tabindex="0" aria-label="Ver ${product.name}">
    <div class="product-visual">
      ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
      ${packMarkup(product)}
      <button class="quick-add" data-add="${product.id}" aria-label="Agregar ${product.name} al carrito"><i class="fa-solid fa-plus"></i></button>
    </div>
    <div class="product-meta">
      <h3>${product.name}</h3>
      <p>${product.subtitle}</p>
      <div class="product-price"><b>${money(product.price)}</b>${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : ""}</div>
    </div>
  </article>`;
}

function renderProducts() {
  document.querySelector("#featuredProducts").innerHTML = products.slice(0, 4).map(productCard).join("");
  document.querySelector("#relatedProducts").innerHTML = products.slice(1, 5).map(productCard).join("");
  renderCatalog();
}

function renderCatalog(filter = "all", sort = "featured") {
  let list = filter === "all" ? [...products] : products.filter(product => product.category === filter);
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  document.querySelector("#catalogProducts").innerHTML = list.map(productCard).join("");
}

function saveCart() {
  localStorage.setItem("pacha-cart", JSON.stringify(cart));
  updateCartUI();
}

function cartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

function cartSubtotal() {
  return cart.reduce((total, item) => total + productById(item.id).price * item.qty, 0);
}

function addToCart(id, quantity = 1, goToCart = false) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += quantity;
  else cart.push({ id, qty: quantity });
  saveCart();
  showToast(`${productById(id).name} se agregó al carrito`);
  if (goToCart) setTimeout(() => navigate("cart"), 250);
}

function updateCartQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) cart = cart.filter(entry => entry.id !== id);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function updateCartUI() {
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = cartCount());
  document.querySelector("#cartTitleCount").textContent = `(${cartCount()})`;
  const cartList = document.querySelector("#cartList");

  if (!cart.length) {
    cartList.innerHTML = `<div class="empty-cart"><i class="fa-solid fa-basket-shopping"></i><h3>Tu carrito está esperando.</h3><p>Hay un mundo vegetal listo para conocer.</p><button class="button button-primary" data-route="catalog">Explorar la tienda</button></div>`;
  } else {
    cartList.innerHTML = cart.map(item => {
      const product = productById(item.id);
      return `<article class="cart-item">
        <div class="cart-thumb">${packMarkup(product)}</div>
        <div class="cart-item-info">
          <h3>${product.name}</h3><span>${product.subtitle}</span>
          <div class="cart-item-controls"><div class="quantity-control"><button data-cart-minus="${product.id}" aria-label="Restar">−</button><b>${item.qty}</b><button data-cart-plus="${product.id}" aria-label="Sumar">+</button></div><button class="remove-item" data-remove="${product.id}">Eliminar</button></div>
        </div>
        <b class="cart-item-price">${money(product.price * item.qty)}</b>
      </article>`;
    }).join("");
  }

  const subtotal = cartSubtotal();
  const discount = couponApplied ? Math.round(subtotal * .1) : 0;
  document.querySelector("#cartSubtotal").textContent = money(subtotal);
  document.querySelector("#cartTotal").textContent = money(subtotal - discount);
  document.querySelector(".checkout-button").disabled = cart.length === 0;
  renderCheckout();
}

function renderCheckout() {
  const container = document.querySelector("#checkoutItems");
  container.innerHTML = cart.map(item => {
    const product = productById(item.id);
    return `<div class="checkout-line"><div class="cart-thumb">${packMarkup(product)}</div><div class="checkout-line-info"><b>${product.name}</b><small>Cantidad: ${item.qty}</small></div><b>${money(product.price * item.qty)}</b></div>`;
  }).join("") || `<p>Tu carrito está vacío.</p>`;
  const subtotal = cartSubtotal();
  const shipping = document.querySelector('input[name="delivery"]:checked')?.value === "pickup" ? 0 : 4200;
  document.querySelector("#checkoutSubtotal").textContent = money(subtotal);
  document.querySelector("#checkoutShipping").textContent = shipping ? money(shipping) : "Gratis";
  document.querySelector("#checkoutTotal").textContent = money(subtotal + shipping);
}

function showProduct(id) {
  currentProduct = productById(id);
  detailQuantity = 1;
  document.querySelector("#productCrumb").textContent = currentProduct.name;
  document.querySelector("#detailCategory").textContent = currentProduct.category === "combos" ? "Combo Pacha" : "Láminas vegetales";
  document.querySelector("#detailName").textContent = currentProduct.name;
  document.querySelector("#detailDescription").textContent = currentProduct.description;
  document.querySelector("#detailPrice").textContent = money(currentProduct.price);
  document.querySelector("#detailVisual").innerHTML = packMarkup(currentProduct);
  updateDetailQuantity();
  navigate("product");
}

function updateDetailQuantity() {
  document.querySelector("#detailQty").textContent = detailQuantity;
  document.querySelector("#detailAddPrice").textContent = money(currentProduct.price * detailQuantity);
}

function navigate(route, updateHash = true) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.dataset.view === route));
  const footer = document.querySelector(".site-footer");
  footer.style.display = route === "checkout" ? "none" : "block";
  document.querySelector(".site-header").style.display = route === "checkout" ? "none" : "flex";
  document.querySelector(".announcement").style.display = route === "checkout" ? "none" : "flex";
  document.querySelector(".mobile-menu").classList.remove("open");
  document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  document.querySelector(".search-panel").classList.remove("open");
  document.querySelector(".search-panel").setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  if (route === "cart") updateCartUI();
  if (route === "checkout") renderCheckout();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (updateHash) history.pushState({ route }, "", `#${route === "home" ? "inicio" : route === "catalog" ? "catalogo" : route}`);
  requestAnimationFrame(() => observeReveals());
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  toast.querySelector("span").textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function observeReveals() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08 });
  document.querySelectorAll(".view.active .fade-in:not(.visible)").forEach(element => observer.observe(element));
}

document.addEventListener("click", event => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    event.preventDefault();
    if (routeButton.dataset.route === "checkout" && !cart.length) return showToast("Agregá un producto antes de continuar");
    navigate(routeButton.dataset.route);
    return;
  }

  const scrollButton = event.target.closest("[data-scroll]");
  if (scrollButton) {
    event.preventDefault();
    navigate("home");
    setTimeout(() => document.querySelector(`#${scrollButton.dataset.scroll}`)?.scrollIntoView({ behavior: "smooth" }), 120);
    return;
  }

  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    event.stopPropagation();
    addToCart(addButton.dataset.add);
    return;
  }

  const productButton = event.target.closest("[data-product]");
  if (productButton) {
    showProduct(productButton.dataset.product);
    return;
  }

  const plus = event.target.closest("[data-cart-plus]");
  if (plus) return updateCartQuantity(plus.dataset.cartPlus, 1);
  const minus = event.target.closest("[data-cart-minus]");
  if (minus) return updateCartQuantity(minus.dataset.cartMinus, -1);
  const remove = event.target.closest("[data-remove]");
  if (remove) return removeFromCart(remove.dataset.remove);
});

document.addEventListener("keydown", event => {
  if (event.key === "Enter" && event.target.matches(".product-card")) showProduct(event.target.dataset.product);
  if (event.key === "Escape") {
    document.querySelector(".search-panel").classList.remove("open");
    document.body.classList.remove("no-scroll");
  }
});

document.querySelector(".menu-toggle").addEventListener("click", event => {
  const menu = document.querySelector(".mobile-menu");
  const open = menu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", open);
});

document.querySelector(".search-trigger").addEventListener("click", () => {
  const panel = document.querySelector(".search-panel");
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  setTimeout(() => document.querySelector("#globalSearch").focus(), 300);
});

document.querySelector(".search-close").addEventListener("click", () => {
  const panel = document.querySelector(".search-panel");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
});

document.querySelector("#globalSearch").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  const results = query ? products.filter(product => `${product.name} ${product.subtitle}`.toLowerCase().includes(query)) : [];
  document.querySelector("#searchResults").innerHTML = results.length
    ? results.map(product => `<button class="search-result" data-product="${product.id}"><b>${product.name}</b><span>${money(product.price)} <i class="fa-solid fa-arrow-right"></i></span></button>`).join("")
    : query ? `<p>No encontramos resultados para “${event.target.value}”.</p>` : `<p>Probá con “tomate”, “combo” o “espinaca”.</p>`;
});

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    renderCatalog(button.dataset.filter, document.querySelector("#sortProducts").value);
  });
});

document.querySelector("#sortProducts").addEventListener("change", event => {
  const filter = document.querySelector("[data-filter].active").dataset.filter;
  renderCatalog(filter, event.target.value);
});

document.querySelector(".qty-minus").addEventListener("click", () => {
  detailQuantity = Math.max(1, detailQuantity - 1);
  updateDetailQuantity();
});

document.querySelector(".qty-plus").addEventListener("click", () => {
  detailQuantity = Math.min(10, detailQuantity + 1);
  updateDetailQuantity();
});

document.querySelector(".detail-add").addEventListener("click", () => addToCart(currentProduct.id, detailQuantity));
document.querySelector(".buy-now").addEventListener("click", () => addToCart(currentProduct.id, detailQuantity, true));

document.querySelector("#applyCoupon").addEventListener("click", () => {
  const value = document.querySelector("#coupon").value.trim().toUpperCase();
  const message = document.querySelector("#couponMessage");
  if (value === "PACHA10") {
    couponApplied = true;
    message.textContent = "¡Listo! Aplicamos 10% de descuento.";
    updateCartUI();
  } else {
    message.textContent = "Probá con el código PACHA10";
  }
});

document.querySelectorAll('input[name="delivery"]').forEach(input => input.addEventListener("change", event => {
  const address = document.querySelector(".address-fields");
  const home = event.target.value === "home";
  address.style.display = home ? "grid" : "none";
  address.querySelectorAll("input[required]").forEach(field => field.required = home);
  renderCheckout();
}));

document.querySelector("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  event.currentTarget.reset();
  document.querySelector("#newsletterMessage").textContent = "¡Listo! Ya sos parte de la comunidad Pacha.";
});

document.querySelector("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!cart.length) return showToast("Tu carrito está vacío");
  document.querySelector(".success-modal").classList.add("open");
  document.querySelector(".success-modal").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  cart = [];
  saveCart();
});

document.querySelector(".success-modal [data-route]").addEventListener("click", () => {
  document.querySelector(".success-modal").classList.remove("open");
  document.querySelector(".success-modal").setAttribute("aria-hidden", "true");
});

window.addEventListener("scroll", () => document.querySelector(".site-header").classList.toggle("scrolled", window.scrollY > 30), { passive: true });
window.addEventListener("popstate", () => routeFromHash(false));

function routeFromHash(updateHash = false) {
  const hash = location.hash.replace("#", "");
  const map = { inicio: "home", catalogo: "catalog", product: "product", cart: "cart", checkout: "checkout" };
  navigate(map[hash] || "home", updateHash);
}

renderProducts();
updateCartUI();
routeFromHash(false);
observeReveals();
