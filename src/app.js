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


    if (typeof saveCart === "function") saveCart();

    updateCartUI();
}

cartList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-remove-id]");
    if (!btn) return;
    e.stopPropagation();


    const id = Number(btn.dataset.removeId);
    removeFromCartById(id);
});



function updateCartUI() {

    cartCount.innerText = cart.length;
    cartItemsText.innerText = `${cart.length} Items`;


    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    cartSubtotalText.innerText = `Subtotal: $${subtotal.toFixed(2)}`;
    renderCartList();
    renderCartModal();

}

// ✅ Render cart inside the modal
function renderCartModal() {
    const modalCartList = document.getElementById("modalCartList");
    const modalItemsCount = document.getElementById("modalItemsCount");
    const modalSubtotalText = document.getElementById("modalSubtotalText");
    const emptyCartModal = document.getElementById("emptyCartModal");
    const modalCartContainer = document.getElementById("modalCartContainer");

    if (!modalCartList) return;

    // Show/hide empty state
    if (cart.length === 0) {
        modalCartContainer.classList.add("hidden");
        emptyCartModal.classList.remove("hidden");
        return;
    }

    modalCartContainer.classList.remove("hidden");
    emptyCartModal.classList.add("hidden");

    // Render cart items with remove button
    modalCartList.innerHTML = cart.map((item, index) => `
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
            <img src="${item.image}" class="w-20 h-20 object-contain bg-white rounded p-2" />
            
            <div class="flex-1">
                <h3 class="font-semibold text-base">${item.title}</h3>
                <p class="text-sm text-gray-500">${item.category}</p>
                <p class="text-lg font-bold text-blue-700 mt-1">$${item.price.toFixed(2)}</p>
            </div>

            <button class="btn btn-sm btn-error bg-red-500 text-white border-0" data-modal-remove-id="${index}">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join("");

    // Update order summary
    modalItemsCount.innerText = cart.length;
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    modalSubtotalText.innerText = `$${subtotal.toFixed(2)}`;
}

// ✅ Event delegation: Remove items from modal
document.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("button[data-modal-remove-id]");
    if (!removeBtn) return;

    const index = Number(removeBtn.dataset.modalRemoveId);
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }
});

// ✅ Event delegation: Clear cart button in modal
document.addEventListener("click", (e) => {
    if (e.target.closest("#modalClearCartBtn")) {
        if (confirm("Are you sure you want to clear your cart?")) {
            cart = [];
            saveCart();
            updateCartUI();
        }
    }
});

// ✅ Event listener for View Cart button - Open Modal
document.addEventListener("click", (e) => {
    if (e.target.closest("#viewCartBtn")) {
        // Close the dropdown by blurring the trigger
        const cartDropdownTrigger = document.querySelector(".dropdown-end .btn-circle");
        if (cartDropdownTrigger) cartDropdownTrigger.blur();

        // Open the modal
        const cartModal = document.getElementById("cartModal");
        if (cartModal) {
            cartModal.showModal();
        }
    }
});

// ===== CHECKOUT FLOW =====

const DELIVERY_FEE = 5.00;
const ORDERS_KEY = "swiftcart_orders";

// Checkout modal elements
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const confirmOrderBtn = document.getElementById("confirmOrderBtn");
const cancelOrderBtn = document.getElementById("cancelOrderBtn");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");
const checkoutName = document.getElementById("checkoutName");
const checkoutPhone = document.getElementById("checkoutPhone");
const checkoutAddress = document.getElementById("checkoutAddress");
const checkoutItemsText = document.getElementById("checkoutItemsText");
const checkoutSubtotalText = document.getElementById("checkoutSubtotalText");
const checkoutDeliveryText = document.getElementById("checkoutDeliveryText");
const checkoutTotalText = document.getElementById("checkoutTotalText");

// ✅ Event listener for Proceed to Checkout button
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", openCheckout);
}

// ✅ Event listener for Confirm Order button
if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener("click", handleConfirmOrder);
}

// ✅ Open Checkout Modal
function openCheckout() {
    // Validate cart is not empty
    if (cart.length === 0) {
        showCheckoutMessage("Cart is empty. Add items before checkout.", "error");
        return;
    }

    // Close cart modal if open
    const cartModal = document.getElementById("cartModal");
    if (cartModal && cartModal.open) {
        cartModal.close();
    }

    // Render checkout summary
    renderCheckoutSummary();

    // Reset form
    if (checkoutForm) {
        checkoutForm.reset();
    }

    // Clear previous messages
    clearCheckoutMessage();

    // Open checkout modal
    if (checkoutModal) {
        checkoutModal.showModal();
    }
}

// ✅ Render order summary into checkout modal
function renderCheckoutSummary() {
    const itemsCount = cart.length;
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal + DELIVERY_FEE;

    if (checkoutItemsText) checkoutItemsText.innerText = itemsCount;
    if (checkoutSubtotalText) checkoutSubtotalText.innerText = `$${subtotal.toFixed(2)}`;
    if (checkoutDeliveryText) checkoutDeliveryText.innerText = `$${DELIVERY_FEE.toFixed(2)}`;
    if (checkoutTotalText) checkoutTotalText.innerText = `$${total.toFixed(2)}`;
}

// ✅ Validate checkout form
function validateCheckoutForm() {
    const name = checkoutName ?.value ?.trim() || "";
    const phone = checkoutPhone ?.value ?.trim() || "";
    const address = checkoutAddress ?.value ?.trim() || "";
    const paymentMethod = document.querySelector("input[name='paymentMethod']:checked") ?.value || "";

    // Validation
    if (!name) {
        showCheckoutMessage("Please enter your name.", "error");
        return false;
    }

    if (!phone || phone.length < 10) {
        showCheckoutMessage("Please enter a valid phone number (minimum 10 digits).", "error");
        return false;
    }

    if (!address) {
        showCheckoutMessage("Please enter your address.", "error");
        return false;
    }

    if (!paymentMethod) {
        showCheckoutMessage("Please select a payment method.", "error");
        return false;
    }

    return { name, phone, address, paymentMethod };
}

// ✅ Handle Confirm Order button click
function handleConfirmOrder() {
    const validation = validateCheckoutForm();
    if (!validation) return;

    // Create order object
    const order = createOrder(validation);

    // Save order to localStorage
    saveOrder(order);

    // Show success message
    showCheckoutMessage(`✓ Order placed successfully! Order ID: ${order.id}`, "success");

    // Clear cart after a short delay
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCartUI();

        // Close checkout modal
        if (checkoutModal) {
            checkoutModal.close();
        }

        // Also close cart modal if open
        const cartModal = document.getElementById("cartModal");
        if (cartModal && cartModal.open) {
            cartModal.close();
        }
    }, 1500);
}

// ✅ Create order object
function createOrder(formData) {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal + DELIVERY_FEE;

    return {
        id: "SC-" + Date.now(),
        createdAt: new Date().toISOString(),
        items: cart.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            category: item.category
        })),
        itemsCount: cart.length,
        subtotal: subtotal,
        deliveryFee: DELIVERY_FEE,
        total: total,
        customer: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address
        },
        paymentMethod: formData.paymentMethod,
        status: "PLACED"
    };
}

// ✅ Save order to localStorage
function saveOrder(order) {
    let orders = getOrders();
    orders.unshift(order); // Add to beginning (newest first)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// ✅ Get all orders from localStorage
function getOrders() {
    const ordersData = localStorage.getItem(ORDERS_KEY);
    return ordersData ? JSON.parse(ordersData) : [];
}

// ✅ Show message in checkout modal
function showCheckoutMessage(message, type = "info") {
    if (!checkoutMessage) return;

    const bgColor = type === "error" ? "bg-error text-white" :
        type === "success" ? "bg-success text-white" :
        "bg-info text-white";

    checkoutMessage.innerHTML = `
        <div class="alert ${bgColor} shadow-lg rounded-lg">
            <div>
                <span>${message}</span>
            </div>
        </div>
    `;

    checkoutMessage.classList.remove("hidden");
}

// ✅ Clear message area
function clearCheckoutMessage() {
    if (checkoutMessage) {
        checkoutMessage.innerHTML = "";
        checkoutMessage.classList.add("hidden");
    }
}

// ===== END CHECKOUT FLOW =====

window.addToCart = function(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    cart.push(product);
    saveCart();
    updateCartUI();
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
      
        const cards = allProducts.map(createProductCard).join("");
        productsGrid.innerHTML = cards;
        countText.innerText = `${allProducts.length} items found`;
        return;
    }

    
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


window.addEventListener("scroll", () => {
  
  const contact = document.getElementById("contact");
  if (!contact) return;

  const scrollPosition = window.scrollY + window.innerHeight;

  
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
