console.log("✅ app.js connected!");

const API_BASE = "https://fakestoreapi.com";

const trendingGrid = document.getElementById("trendingGrid");
const categoryButtons = document.getElementById("categoryButtons");
const productsGrid = document.getElementById("productsGrid");
const productsTitle = document.getElementById("productsTitle");
const countText = document.getElementById("countText");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

let allProducts = [];
let cart = [];

// ---------- helpers ----------
const truncate = (text, max = 45) => (text.length > max ? text.slice(0, max) + "..." : text);

function ratingStars(rate) {
    // 0-5 => stars
    const full = Math.floor(rate);
    const half = rate - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    const fullStar = "★".repeat(full);
    const halfStar = half ? "⯨" : ""; // optional half indicator
    const emptyStar = "☆".repeat(empty);

    return `<span class="text-yellow-500">${fullStar}${halfStar}</span><span class="text-gray-300">${emptyStar}</span>`;
}

function productCard(product) {
    return `
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div class="bg-gray-100 p-6 flex justify-center">
        <img class="h-44 object-contain" src="${product.image}" alt="${product.title}" />
      </div>

      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
            ${product.category}
          </span>

          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>${ratingStars(product.rating?.rate ?? 0)}</span>
            <span class="font-medium">${product.rating?.rate ?? 0}</span>
            <span class="text-gray-400">(${product.rating?.count ?? 0})</span>
          </div>
        </div>

        <h3 class="font-semibold text-gray-900 leading-snug">
          ${truncate(product.title, 50)}
        </h3>

        <p class="text-lg font-bold mt-2">$${product.price}</p>

        <div class="flex items-center gap-3 mt-4">
          <button
            class="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            onclick="openDetails(${product.id})"
          >
            👁️ Details
          </button>

          <button
            class="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
            onclick="addToCart(${product.id})"
          >
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderGrid(target, products) {
    if (!target) return;
    if (!products || products.length === 0) {
        target.innerHTML = `<p class="text-gray-500">No products found.</p>`;
        return;
    }

    target.innerHTML = products.map(productCard).join("");
}

// ---------- API ----------
async function fetchAllProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        allProducts = data;
        return data;
    } catch (err) {
        console.error("Failed to fetch products:", err);
        // Fallback minimal product so UI can render locally
        allProducts = [
            { id: 1, title: "Sample Product", price: 19.99, image: "https://via.placeholder.com/150", category: "sample", rating: { rate: 4.2, count: 10 }, description: "Fallback product." }
        ];
        return allProducts;
    }
}

async function fetchCategories() {
    const res = await fetch(`${API_BASE}/products/categories`);
    return await res.json();
}

async function fetchProductsByCategory(category) {
    const res = await fetch(`${API_BASE}/products/category/${category}`);
    return await res.json();
}

// ---------- Trending ----------
function renderTrendingTop3() {
    // Sort by rating descending
    if (!allProducts || allProducts.length === 0) {
        renderGrid(trendingGrid, []);
        return;
    }

    const top3 = allProducts.slice().sort((a, b) => {
        const rateA = (a.rating && a.rating.rate) ? a.rating.rate : 0;
        const rateB = (b.rating && b.rating.rate) ? b.rating.rate : 0;
        return rateB - rateA;
    }).slice(0, 3);

    renderGrid(trendingGrid, top3);
}

// ---------- Categories UI ----------
function setActiveCategoryButton(activeValue) {
    const buttons = categoryButtons.querySelectorAll("button[data-cat]");
    buttons.forEach(btn => {
        btn.classList.remove("bg-indigo-600", "text-white");
        btn.classList.add("bg-white", "text-gray-700", "border");
        if (btn.dataset.cat === activeValue) {
            btn.classList.add("bg-indigo-600", "text-white");
            btn.classList.remove("bg-white", "text-gray-700", "border");
        }
    });
}

async function renderCategoryButtons() {
    const cats = await fetchCategories();

    categoryButtons.innerHTML = `
    <button data-cat="all"
      class="px-4 py-2 rounded-lg border bg-indigo-600 text-white text-sm font-medium"
      onclick="loadCategory('all')">
      All
    </button>
    ${cats
      .map(
        (c) => `
        <button data-cat="${c}"
          class="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 capitalize"
          onclick="loadCategory('${c}')">
          ${c}
        </button>
      `
      )
      .join("")}
  `;
}

// ---------- Product loading by category ----------
window.loadCategory = async function (category) {
  if (category === "all") {
    productsTitle.textContent = "All Products";
    setActiveCategoryButton("all");
    renderGrid(productsGrid, allProducts);
    countText.textContent = `${allProducts.length} items`;
    return;
  }

  productsTitle.textContent = `Category: ${category}`;
  setActiveCategoryButton(category);

  const products = await fetchProductsByCategory(category);
  renderGrid(productsGrid, products);
  countText.textContent = `${products.length} items`;
};

// ---------- Modal ----------
window.openDetails = function (id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  modalBody.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gray-100 rounded-xl p-6 flex justify-center">
        <img class="h-60 object-contain" src="${product.image}" alt="${product.title}" />
      </div>

      <div>
        <p class="text-sm text-blue-700 bg-blue-100 inline-block px-2 py-1 rounded-full capitalize mb-2">
          ${product.category}
        </p>

        <h2 class="text-xl font-semibold text-gray-900">${product.title}</h2>

        <div class="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <span>${ratingStars(product.rating?.rate ?? 0)}</span>
          <span class="font-medium">${product.rating?.rate ?? 0}</span>
          <span class="text-gray-400">(${product.rating?.count ?? 0})</span>
        </div>

        <p class="text-2xl font-bold mt-3">$${product.price}</p>

        <p class="text-gray-600 mt-4 leading-relaxed">
          ${product.description}
        </p>

        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700"
            onclick="addToCart(${product.id}); closeModal();"
          >
            Add to Cart
          </button>
          <button
            class="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onclick="buyNow(${product.id})"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  `;

  modalBackdrop.classList.remove("hidden");
  modalBackdrop.classList.add("flex");
};

function closeModal() {
  modalBackdrop.classList.add("hidden");
  modalBackdrop.classList.remove("flex");
}
window.closeModal = closeModal;

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

// ---------- Cart ----------
window.addToCart = function (id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  cart.push(product);
  alert(`Added: ${truncate(product.title, 30)}\nCart items: ${cart.length}`);
};

window.buyNow = function (id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  alert(`Buy Now: ${product.title}\n(Here you can go to checkout page)`);
};

// ---------- init ----------
(async function init() {
  await fetchAllProducts();
  renderTrendingTop3();
  await renderCategoryButtons();

  // default load all
  renderGrid(productsGrid, allProducts);
  countText.textContent = `${allProducts.length} items`;
})();