// console.log("✅ app.js connected!");

// const API_BASE = "https://fakestoreapi.com";

// const trendingGrid = document.getElementById("trendingGrid");
// const categoryButtons = document.getElementById("categoryButtons");
// const productsGrid = document.getElementById("productsGrid");
// const productsTitle = document.getElementById("productsTitle");
// const countText = document.getElementById("countText");

// const modalBackdrop = document.getElementById("modalBackdrop");
// const modalBody = document.getElementById("modalBody");
// const modalClose = document.getElementById("modalClose");

// let allProducts = [];
// let cart = [];

// // ---------- helpers ----------
// const truncate = (text, max = 45) => (text.length > max ? text.slice(0, max) + "..." : text);

// function ratingStars(rate) {
//     // 0-5 => stars
//     const full = Math.floor(rate);
//     const half = rate - full >= 0.5 ? 1 : 0;
//     const empty = 5 - full - half;

//     const fullStar = "★".repeat(full);
//     const halfStar = half ? "⯨" : ""; // optional half indicator
//     const emptyStar = "☆".repeat(empty);

//     return `<span class="text-yellow-500">${fullStar}${halfStar}</span><span class="text-gray-300">${emptyStar}</span>`;
// }

// function productCard(product) {
//     return `
//     <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
//       <div class="bg-gray-100 p-6 flex justify-center">
//         <img class="h-44 object-contain" src="${product.image}" alt="${product.title}" />
//       </div>

//       <div class="p-4">
//         <div class="flex items-center justify-between mb-2">
//           <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
//             ${product.category}
//           </span>

//           <div class="flex items-center gap-2 text-sm text-gray-600">
//             <span>${ratingStars(product.rating?.rate ?? 0)}</span>
//             <span class="font-medium">${product.rating?.rate ?? 0}</span>
//             <span class="text-gray-400">(${product.rating?.count ?? 0})</span>
//           </div>
//         </div>

//         <h3 class="font-semibold text-gray-900 leading-snug">
//           ${truncate(product.title, 50)}
//         </h3>

//         <p class="text-lg font-bold mt-2">$${product.price}</p>

//         <div class="flex items-center gap-3 mt-4">
//           <button
//             class="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
//             onclick="openDetails(${product.id})"
//           >
//             👁️ Details
//           </button>

//           <button
//             class="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
//             onclick="addToCart(${product.id})"
//           >
//             🛒 Add
//           </button>
//         </div>
//       </div>
//     </div>
//   `;
// }

// function renderGrid(target, products) {
//     if (!target) return;
//     if (!products || products.length === 0) {
//         target.innerHTML = `<p class="text-gray-500">No products found.</p>`;
//         return;
//     }

//     target.innerHTML = products.map(productCard).join("");
// }

// // ---------- API ----------
// async function fetchAllProducts() {
//     try {
//         const res = await fetch(`${API_BASE}/products`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         console.log(data)
//         allProducts = data;
//         return data;
//     } catch (err) {
//         console.error("Failed to fetch products:", err);
//         // Fallback minimal product so UI can render locally
//         allProducts = [
//             { id: 1, title: "Sample Product", price: 19.99, image: "https://via.placeholder.com/150", category: "sample", rating: { rate: 4.2, count: 10 }, description: "Fallback product." }
//         ];
//         return allProducts;
//     }
// }

// async function fetchCategories() {
//     const res = await fetch(`${API_BASE}/products/categories`);
//     return await res.json();
// }

// async function fetchProductsByCategory(category) {
//     const res = await fetch(`${API_BASE}/products/category/${category}`);
//     return await res.json();
// }

// // ---------- Trending ----------
// function renderTrendingTop3() {
//     // Sort by rating descending
//     if (!allProducts || allProducts.length === 0) {
//         renderGrid(trendingGrid, []);
//         return;
//     }

//     const top3 = allProducts.slice().sort((a, b) => {
//         const rateA = (a.rating && a.rating.rate) ? a.rating.rate : 0;
//         const rateB = (b.rating && b.rating.rate) ? b.rating.rate : 0;
//         return rateB - rateA;
//     }).slice(0, 3);

//     renderGrid(trendingGrid, top3);
// }

// // ---------- Categories UI ----------
// function setActiveCategoryButton(activeValue) {
//     const buttons = categoryButtons.querySelectorAll("button[data-cat]");
//     buttons.forEach(btn => {
//         btn.classList.remove("bg-indigo-600", "text-white");
//         btn.classList.add("bg-white", "text-gray-700", "border");
//         if (btn.dataset.cat === activeValue) {
//             btn.classList.add("bg-indigo-600", "text-white");
//             btn.classList.remove("bg-white", "text-gray-700", "border");
//         }
//     });
// }

// async function renderCategoryButtons() {
//     const cats = await fetchCategories();

//     categoryButtons.innerHTML = `
//     <button data-cat="all"
//       class="px-4 py-2 rounded-lg border bg-indigo-600 text-white text-sm font-medium"
//       onclick="loadCategory('all')">
//       All
//     </button>
//     ${cats
//       .map(
//         (c) => `
//         <button data-cat="${c}"
//           class="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 capitalize"
//           onclick="loadCategory('${c}')">
//           ${c}
//         </button>
//       `
//       )
//       .join("")}
//   `;
// }

// // ---------- Product loading by category ----------
// window.loadCategory = async function (category) {
//   if (category === "all") {
//     productsTitle.textContent = "All Products";
//     setActiveCategoryButton("all");
//     renderGrid(productsGrid, allProducts);
//     countText.textContent = `${allProducts.length} items`;
//     return;
//   }

//   productsTitle.textContent = `Category: ${category}`;
//   setActiveCategoryButton(category);

//   const products = await fetchProductsByCategory(category);
//   renderGrid(productsGrid, products);
//   countText.textContent = `${products.length} items`;
// };

// // ---------- Modal ----------
// window.openDetails = function (id) {
//   const product = allProducts.find(p => p.id === id);
//   if (!product) return;

//   modalBody.innerHTML = `
//     <div class="grid md:grid-cols-2 gap-6">
//       <div class="bg-gray-100 rounded-xl p-6 flex justify-center">
//         <img class="h-60 object-contain" src="${product.image}" alt="${product.title}" />
//       </div>

//       <div>
//         <p class="text-sm text-blue-700 bg-blue-100 inline-block px-2 py-1 rounded-full capitalize mb-2">
//           ${product.category}
//         </p>

//         <h2 class="text-xl font-semibold text-gray-900">${product.title}</h2>

//         <div class="flex items-center gap-2 mt-2 text-sm text-gray-600">
//           <span>${ratingStars(product.rating?.rate ?? 0)}</span>
//           <span class="font-medium">${product.rating?.rate ?? 0}</span>
//           <span class="text-gray-400">(${product.rating?.count ?? 0})</span>
//         </div>

//         <p class="text-2xl font-bold mt-3">$${product.price}</p>

//         <p class="text-gray-600 mt-4 leading-relaxed">
//           ${product.description}
//         </p>

//         <div class="flex gap-3 mt-6">
//           <button
//             class="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700"
//             onclick="addToCart(${product.id}); closeModal();"
//           >
//             Add to Cart
//           </button>
//           <button
//             class="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//             onclick="buyNow(${product.id})"
//           >
//             Buy Now
//           </button>
//         </div>
//       </div>
//     </div>
//   `;

//   modalBackdrop.classList.remove("hidden");
//   modalBackdrop.classList.add("flex");
// };

// function closeModal() {
//   modalBackdrop.classList.add("hidden");
//   modalBackdrop.classList.remove("flex");
// }
// window.closeModal = closeModal;

// modalClose.addEventListener("click", closeModal);
// modalBackdrop.addEventListener("click", (e) => {
//   if (e.target === modalBackdrop) closeModal();
// });

// // ---------- Cart ----------
// window.addToCart = function (id) {
//   const product = allProducts.find(p => p.id === id);
//   if (!product) return;

//   cart.push(product);
//   alert(`Added: ${truncate(product.title, 30)}\nCart items: ${cart.length}`);
// };

// window.buyNow = function (id) {
//   const product = allProducts.find(p => p.id === id);
//   if (!product) return;
//   alert(`Buy Now: ${product.title}\n(Here you can go to checkout page)`);
// };

// // ---------- init ----------
// (async function init() {
//   await fetchAllProducts();
//   renderTrendingTop3();
//   await renderCategoryButtons();

//   // default load all
//   renderGrid(productsGrid, allProducts);
//   countText.textContent = `${allProducts.length} items`;
// })();







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
            onclick="openDetails(${product.id})">
            Details
          </button>

          <button 
            class="btn btn-sm bg-blue-700 hover:bg-blue-800 text-white border-0 flex-1"
            onclick="addToCart(${product.id})">Add to Cart
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

function updateCartUI() {
    // Count update
    cartCount.innerText = cart.length;
    cartItemsText.innerText = `${cart.length} Items`;

    // Subtotal calculate
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    cartSubtotalText.innerText = `Subtotal: $${subtotal.toFixed(2)}`;
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

        <button class="btn btn-primary bg-blue-700 hover:bg-blue-800 border-0 mt-4 w-full">
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