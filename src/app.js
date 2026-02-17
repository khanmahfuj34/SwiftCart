console.log("app.js connected!");

const trendingGrid = document.getElementById("trendingGrid");



// https://fakestoreapi.com/products
const API_BASE = "https://fakestoreapi.com";
const countText = document.getElementById("countText");
async function loadAllProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        // console.log(data);
        countText.innerText = `${data.length} items loaded`
    } catch (error) {
        // console.log("Failed to load products:", error);
    }
}
loadAllProducts();

const productsGrid = document.getElementById("productsGrid");

function shortTitle(title, max = 45) {
    if (title.length <= max) return title;
    return title.slice(0, max) + "...";
}


function createProductCard(product) {
    return `
    <div class="card bg-base-100 shadow-md border border-gray-200 rounded-2xl hover:shadow-lg transition duration-300 h-full">
      
      <!-- Image -->
      <figure class="bg-base-200 p-6 flex items-center justify-center">
        <img 
          class="h-40 w-full object-contain" 
          src="${product.image}" 
          alt="${product.title}" 
        />
      </figure>

      <!-- Card Body -->
      <div class="card-body p-5 flex flex-col justify-between">

        <!-- Top Section -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="badge badge-outline capitalize text-xs">
              ${product.category}
            </span>

            <span class="text-sm text-gray-500 flex items-center gap-1">
              <i class="fa-solid fa-star text-yellow-500"></i>
              ${product.rating.rate} (${product.rating.count})
            </span>
          </div>

          <h2 class="card-title text-base leading-snug min-h-[48px]">
            ${shortTitle(product.title)}
          </h2>

          <p class="text-xl font-bold text-blue-700 mt-2">
            $${product.price}
          </p>
        </div>

        <!-- Buttons Section (FIXED ALIGNMENT) -->
        <div class="card-actions mt-4 gap-3">
          <button 
            class="btn btn-sm btn-outline flex-1"
            onclick="openDetails(${product.id})"><i class="fa-solid fa-circle-info"></i> 
            Details
          </button>

          <button 
            class="btn btn-sm bg-blue-700 hover:bg-blue-800 text-white border-0 flex-1"
            onclick="addToCart(${product.id})"><i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>

        </div>

      </div>
    </div>
  `;
}

const modalBackdrop = document.getElementById("modalBackdrop");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");
let allProducts = [];
// ✅ Cart State
let cart = [];

// ✅ Cart UI elements
const cartCount = document.getElementById("cartCount");
const cartItemsText = document.getElementById("cartItemsText");
const cartSubtotalText = document.getElementById("cartSubtotalText");
const cartList = document.getElementById("cartList");


// ✅ LocalStorage key
const CART_KEY = "swiftcart_cart";

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Load cart from localStorage (page reload হলেও data থাকবে)
function loadCart() {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function renderCartList() {
    if (!cartList) return;

    // empty cart UI
    if (cart.length === 0) {
        cartList.innerHTML = `<p class="text-sm text-gray-500">Cart is empty.</p>`;
        return;
    }

    cartList.innerHTML = cart.map(item => `
    <div class="flex items-center gap-3 p-2 rounded-lg border bg-base-100">
      <img src="${item.image}" class="w-10 h-10 object-contain bg-base-200 rounded" />
      <div class="flex-1">
        <p class="text-sm font-medium">${item.title.slice(0, 20)}...</p>
        <p class="text-xs text-gray-500">$${item.price}</p>
      </div>

      <button class="btn btn-xs btn-error bg-red-500 px-2 text-white" data-remove-id="${item.id}">
        Remove
      </button>
    </div>
  `).join("");
}

function removeFromCartById(id) {
    // remove 1 item (first match)
    const index = cart.findIndex(p => p.id === id);
    if (index === -1) return;

    cart.splice(index, 1);

    // optional: if you're using localStorage
    if (typeof saveCart === "function") saveCart();

    updateCartUI(); // ✅ instantly update count + subtotal + list
}

cartList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-remove-id]");
    if (!btn) return;
    e.stopPropagation();


    const id = Number(btn.dataset.removeId);
    removeFromCartById(id);
});



function updateCartUI() {
    // Count update
    cartCount.innerText = cart.length;
    cartItemsText.innerText = `${cart.length} Items`;

    // Subtotal calculate
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    cartSubtotalText.innerText = `Subtotal: $${subtotal.toFixed(2)}`;
    renderCartList();

}
window.addToCart = function(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    cart.push(product); // ✅ add product to array
    saveCart(); // ✅ persist (optional but included)
    updateCartUI(); // ✅ update navbar count & subtotal
};



window.openDetails = function(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    modalBody.innerHTML = `
    <div class="grid sm:grid-cols-2 gap-6">
      <div class="bg-base-200 rounded-xl p-6 flex justify-center">
        <img class="h-56 object-contain" src="${product.image}" alt="${product.title}" />
      </div>

      <div>
        <span class="badge badge-outline capitalize">${product.category}</span>

        <h2 class="text-xl font-bold mt-2">${product.title}</h2>

        <p class="mt-2 text-gray-600 text-sm">${product.description}</p>

        <p class="text-2xl font-bold text-blue-700 mt-4">$${product.price}</p>

        <p class="text-sm text-gray-500 mt-2">
          <i class="fa-solid fa-star"></i>${product.rating.rate} (${product.rating.count})
        </p>

        <button 
            class="btn btn-primary bg-blue-700 hover:bg-blue-800 border-0 mt-4 w-full font-semibold text-white" onclick="addToCart(${product.id}); closeModal();">
            Add to Cart
        </button>

      </div>
    </div>
    `;
    modalBackdrop.classList.remove("hidden");
    modalBackdrop.classList.add("flex")
};

const categoryButtons = document.getElementById("categoryButtons");
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/products/categories`);
        const categories = await res.json();
        console.log("catagories", categories);
        renderCategoryButtons(categories);
    } catch (error) {
        console.log("cataError", error)
    }
}

function renderCategoryButtons(categories) {
    categoryButtons.innerHTML = `
    <button class="btn btn-sm rounded-full px-5 bg-blue-700 text-white border-0 shadow-sm" data-cat="all">All</button>
    ${categories.map(cat => `
      <button class="btn btn-sm btn-outline rounded-full px-5 over:bg-blue-100 capitalize" data-cat="${cat}">
        ${cat}
      </button>
    `).join("")}
  `;
}


function renderTrendingTop3() {
    const sorted = [...allProducts].sort(
        (a, b) => b.rating.rate - a.rating.rate);

    const top3 = sorted.slice(0, 3);

    trendingGrid.innerHTML = top3.map(createProductCard).join("");
}

categoryButtons.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cat]");
    if (!btn) return;

    const category = btn.dataset.cat;
    setActiveCategory(category);

    filterByCategory(category);
});

function setActiveCategory(activeCat) {
    const buttons = categoryButtons.querySelectorAll("button[data-cat]");

    buttons.forEach((btn) => {
        // reset all buttons
        btn.classList.remove("bg-blue-700", "text-white", "border-0");
        btn.classList.add("btn-outline");

        // active one
        if (btn.dataset.cat === activeCat) {
            btn.classList.add("bg-blue-700", "text-white", "border-0");
            btn.classList.remove("btn-outline");
        }
    });
}





window.filterByCategory = function(category) {

    if (category === "all") {
        // Show all products
        const cards = allProducts.map(createProductCard).join("");
        productsGrid.innerHTML = cards;
        countText.innerText = `${allProducts.length} items found`;
        return;
    }

    // Filter products by category
    const filtered = allProducts.filter(p => p.category === category);

    const cards = filtered.map(createProductCard).join("");
    productsGrid.innerHTML = cards;
    countText.innerText = `${filtered.length} items in ${category}`;
};

function trandingTop() {
    const sorted = [...allProducts].sort((a, b) => b.rating.rate - a.rating.rate);
    const top3 = sorted.slice(0, 3);
    trandingTop.innerHTML = top3.map(createProductCard).join("");

}



function closeModal() {
    modalBackdrop.classList.add("hidden");
    modalBackdrop.classList.remove("flex")
}
modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
});
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        allProducts = data;
        renderTrendingTop3();
        // console.log("data", data)
        countText.innerHTML = `
        ${data.length}item foun`;
        const cards = data.map(createProductCard).join("");
        productsGrid.innerHTML = cards;
    } catch (error) {
        // console.log("no data", data)
    }
}
loadCart();
updateCartUI();

loadProducts();
loadCategories();
setTimeout(() => setActiveCategory("all"), 0);

// ================= NAVBAR DYNAMIC =================
const navLinks = document.getElementById("navLinks");
const mobileNavLinks = document.getElementById("mobileNavLinks");

const NAV_ITEMS = [
  { label: "Home", targetId: "home" },
  
  { label: "About", targetId: "about" },
  { label: "Products", targetId: "products" },
  { label: "Contact", targetId: "contact" },
];

let activeNav = "Home";

function navBtnClass(isActive) {
  // DaisyUI + Tailwind (same vibe as category active)
  return isActive
    ? "btn btn-sm bg-blue-700 text-white border-0 rounded-full px-5"
    : "btn btn-sm btn-ghost rounded-full px-5";
}

function renderNavbar() {
  const makeList = () =>
    NAV_ITEMS.map((item) => `
      <li>
        <button class="${navBtnClass(item.label === activeNav)}" data-nav="${item.label}">
          ${item.label}
        </button>
      </li>
    `).join("");

  if (navLinks) navLinks.innerHTML = makeList();
  if (mobileNavLinks) mobileNavLinks.innerHTML = makeList();
}

function setActiveNav(label) {
  activeNav = label;
  renderNavbar();
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const header = document.querySelector("header");
  const navHeight = header ? header.offsetHeight : 0;

  const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 12;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
}



// Click handler (Desktop + Mobile)
function handleNavClick(e) {
  const btn = e.target.closest("button[data-nav]");
  if (!btn) return;

  const label = btn.dataset.nav;
  setActiveNav(label);

  if (label === "Home") {
    scrollToSection("home");
    return;
  }

  

  if (label === "About") {
    scrollToSection("about");
    return;
  }
  if (label === "Products") {
    // ✅ Products click করলে All products show
    if (typeof filterByCategory === "function") filterByCategory("all");
    scrollToSection("products");
    return;
  }

  if (label === "Contact") {
    setActiveNav("Contact");
    scrollToSection("contact");
    return;
  }
}

if (navLinks) navLinks.addEventListener("click", handleNavClick);
if (mobileNavLinks) mobileNavLinks.addEventListener("click", handleNavClick);

// Initial render
renderNavbar();
// ==================================================

window.addEventListener("scroll", () => {
  // 👇 যদি user already Contact এ থাকে, force overwrite করো না
  const contact = document.getElementById("contact");
  if (!contact) return;

  const scrollPosition = window.scrollY + window.innerHeight;

  // যদি footer visible হয় → Contact active
  if (scrollPosition >= contact.offsetTop) {
    setActiveNav("Contact");
    return;
  }

  const products = document.getElementById("products");
  const about = document.getElementById("about");

  if (products && window.scrollY + 150 >= products.offsetTop) {
    setActiveNav("Products");
  } 
  else if (about && window.scrollY + 150 >= about.offsetTop) {
    setActiveNav("About");
  } 
  else {
    setActiveNav("Home");
  }
});