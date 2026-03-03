// =====================
// SWIFTCART PRO CONFIG
// =====================
const API_BASE = "https://fakestoreapi.com";
const CART_KEY = "swiftcart_cart_pro";
const WISHLIST_KEY = "swiftcart_wishlist";
const USER_KEY = "swiftcart_user";
const ORDERS_KEY = "swiftcart_orders";

// =====================
// STATE MANAGEMENT
// =====================
const State = {
    allProducts: [],
    cart: [], // [{id, title, price, image, category, qty}]
    wishlist: [],
    user: null,
    orders: [],
    filteredProducts: [],
    searchQuery: "",
    sortBy: "default",
    isLoading: true,

    init() {
        this.loadFromStorage();
    },

    loadFromStorage() {
        const savedCart = localStorage.getItem(CART_KEY);
        const savedWishlist = localStorage.getItem(WISHLIST_KEY);
        const savedUser = localStorage.getItem(USER_KEY);
        const savedOrders = localStorage.getItem(ORDERS_KEY);

        this.cart = savedCart ? JSON.parse(savedCart) : [];
        this.wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
        this.user = savedUser ? JSON.parse(savedUser) : null;
        this.orders = savedOrders ? JSON.parse(savedOrders) : [];
    },

    saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
    },

    saveWishlist() {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.wishlist));
    },

    saveUser() {
        if (this.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(this.user));
        } else {
            localStorage.removeItem(USER_KEY);
        }
    },

    saveOrders() {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
    },

    addToCart(product, qty = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category,
                rating: product.rating,
                qty: qty
            });
        }
        this.saveCart();
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    },

    updateCartQty(productId, qty) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (qty <= 0) {
                this.removeFromCart(productId);
            } else {
                item.qty = qty;
                this.saveCart();
            }
        }
    },

    toggleWishlist(productId) {
        const idx = this.wishlist.indexOf(productId);
        if (idx > -1) {
            this.wishlist.splice(idx, 1);
        } else {
            this.wishlist.push(productId);
        }
        this.saveWishlist();
    },

    isInWishlist(productId) {
        return this.wishlist.includes(productId);
    },

    getCartSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    getDeliveryFee() {
        const subtotal = this.getCartSubtotal();
        return subtotal >= 50 ? 0 : 5;
    },

    getCartTotal() {
        return this.getCartSubtotal() + this.getDeliveryFee();
    },

    getCartItemCount() {
        return this.cart.reduce((sum, item) => sum + item.qty, 0);
    },

    login(name, email) {
        this.user = { name, email, loginTime: new Date().toISOString() };
        this.saveUser();
    },

    logout() {
        this.user = null;
        this.saveUser();
    },

    addOrder(order) {
        this.orders.unshift(order);
        this.saveOrders();
    },

    clearCart() {
        this.cart = [];
        this.saveCart();
    }
};

// =====================
// UTILITY FUNCTIONS
// =====================
const Utils = {
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    showToast(message, type = "info", duration = 3000) {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const bgColor = type === "error" ? "alert-error" :
            type === "success" ? "alert-success" :
            type === "warning" ? "alert-warning" :
            "alert-info";

        const toast = document.createElement("div");
        toast.className = `alert ${bgColor} shadow-lg rounded-lg animate-fade-in pointer-events-auto`;
        toast.innerHTML = `
      <div>
        <span>${message}</span>
      </div>
    `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    },

    shortTitle(title, max = 45) {
        if (title.length <= max) return title;
        return title.slice(0, max) + "...";
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
};

// =====================
// DOM SELECTORS
// =====================
const DOM = {
    // Modals
    detailsModal: document.getElementById("modalBackdrop"),
    detailsBody: document.getElementById("modalBody"),
    detailsClose: document.getElementById("modalClose"),
    cartModal: document.getElementById("cartModal"),
    checkoutModal: document.getElementById("checkoutModal"),
    loginModal: document.getElementById("loginModal"),
    wishlistModal: document.getElementById("wishlistModal"),
    ordersModal: document.getElementById("ordersModal"),

    // Cart related
    cartCount: document.getElementById("cartCount"),
    cartItemsText: document.getElementById("cartItemsText"),
    cartSubtotalText: document.getElementById("cartSubtotalText"),
    cartDeliveryText: document.getElementById("cartDeliveryText"),
    cartList: document.getElementById("cartList"),
    modalCartList: document.getElementById("modalCartList"),
    modalItemsCount: document.getElementById("modalItemsCount"),
    modalSubtotalText: document.getElementById("modalSubtotalText"),
    modalDeliveryText: document.getElementById("modalDeliveryText"),
    modalTotalText: document.getElementById("modalTotalText"),
    emptyCartModal: document.getElementById("emptyCartModal"),
    modalCartContainer: document.getElementById("modalCartContainer"),

    // Products
    productsGrid: document.getElementById("productsGrid"),
    skeletonLoader: document.getElementById("skeletonLoader"),
    noProductsState: document.getElementById("noProductsState"),
    countText: document.getElementById("countText"),
    productsTitle: document.getElementById("productsTitle"),

    // Search & Sort
    searchInput: document.getElementById("searchInput"),
    sortDropdown: document.getElementById("sortDropdown"),

    // Wishlist
    wishlistBtn: document.getElementById("wishlistBtn"),
    wishlistCount: document.getElementById("wishlistCount"),
    wishlistModalContent: document.getElementById("wishlistModalContent"),
    emptyWishlistState: document.getElementById("emptyWishlistState"),

    // User & Auth
    userMenuBtn: document.getElementById("userMenuBtn"),
    userDropdownMenu: document.getElementById("userDropdownMenu"),
    loginLink: document.getElementById("loginLink"),
    logoutLink: document.getElementById("logoutLink"),
    ordersLink: document.getElementById("ordersLink"),
    loginForm: document.getElementById("loginForm"),

    // Orders
    ordersListContent: document.getElementById("ordersListContent"),
    emptyOrdersState: document.getElementById("emptyOrdersState"),

    // Checkout
    checkoutForm: document.getElementById("checkoutForm"),
    checkoutMessage: document.getElementById("checkoutMessage"),
    checkoutName: document.getElementById("checkoutName"),
    checkoutEmail: document.getElementById("checkoutEmail"),
    checkoutPhone: document.getElementById("checkoutPhone"),
    checkoutAddress: document.getElementById("checkoutAddress"),
    checkoutItemsText: document.getElementById("checkoutItemsText"),
    checkoutSubtotalText: document.getElementById("checkoutSubtotalText"),
    checkoutDeliveryText: document.getElementById("checkoutDeliveryText"),
    checkoutTotalText: document.getElementById("checkoutTotalText"),
    confirmOrderBtn: document.getElementById("confirmOrderBtn"),
    checkoutBtn: document.getElementById("checkoutBtn"),
    modalClearCartBtn: document.getElementById("modalClearCartBtn"),

    // Categories
    categoryButtons: document.getElementById("categoryButtons"),

    // Other
    trending: document.getElementById("trendingGrid"),
    viewCartBtn: document.getElementById("viewCartBtn"),
    mobileNavLinks: document.getElementById("mobileNavLinks"),
    navLinks: document.getElementById("navLinks")
};

// =====================
// UI RENDERERS
// =====================
const Renderers = {
        createProductCard(product) {
            const inWishlist = State.isInWishlist(product.id);
            const wishlistClass = inWishlist ? "text-red-500 fill-red-500" : "text-gray-300";

            return `
      <div class="card bg-base-100 shadow-md border border-gray-200 rounded-2xl hover:shadow-lg transition duration-300 h-full relative">
        
        <!-- Wishlist Heart Icon -->
        <button class="btn btn-ghost btn-sm btn-circle absolute top-2 right-2 z-10" data-wishlist-id="${product.id}">
          <i class="fa-solid fa-heart text-lg ${wishlistClass}"></i>
        </button>

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
              ${Utils.shortTitle(product.title)}
            </h2>

            <p class="text-xl font-bold text-blue-700 mt-2">
              $${product.price.toFixed(2)}
            </p>
          </div>

          <!-- Buttons Section -->
          <div class="card-actions mt-4 gap-3">
            <button 
              class="btn btn-sm btn-outline flex-1"
              data-details-id="${product.id}"><i class="fa-solid fa-circle-info"></i> 
              Details
            </button>

            <button 
              class="btn btn-sm bg-blue-700 hover:bg-blue-800 text-white border-0 flex-1"
              data-add-to-cart="${product.id}"><i class="fa-solid fa-cart-plus"></i> Add
            </button>
          </div>

        </div>
      </div>
    `;
        },

        renderProducts(products) {
            DOM.skeletonLoader.style.display = "none";

            if (products.length === 0) {
                DOM.productsGrid.innerHTML = "";
                DOM.noProductsState.classList.remove("hidden");
                DOM.countText.innerText = "0 items found";
                return;
            }

            DOM.noProductsState.classList.add("hidden");
            DOM.productsGrid.innerHTML = products.map(p => this.createProductCard(p)).join("");
            DOM.countText.innerText = `${products.length} items found`;
        },

        renderCartDropdown() {
            const itemCount = State.getCartItemCount();
            const subtotal = State.getCartSubtotal();
            const delivery = State.getDeliveryFee();

            DOM.cartCount.innerText = itemCount;
            DOM.cartItemsText.innerText = `${itemCount} Items`;
            DOM.cartSubtotalText.innerText = `Subtotal: $${subtotal.toFixed(2)}`;
            DOM.cartDeliveryText.innerText = `Delivery: $${delivery.toFixed(2)}`;

            if (State.cart.length === 0) {
                DOM.cartList.innerHTML = `<p class="text-sm text-gray-500">Cart is empty.</p>`;
                return;
            }

            DOM.cartList.innerHTML = State.cart.map((item, idx) => `
      <div class="flex items-center gap-2 p-2 rounded-lg border bg-base-100 text-sm">
        <img src="${item.image}" class="w-10 h-10 object-contain bg-base-200 rounded" />
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">${item.title.slice(0, 20)}...</p>
          <p class="text-xs text-gray-500">$${item.price.toFixed(2)} x ${item.qty}</p>
        </div>
        <div class="flex items-center gap-1 bg-gray-100 rounded">
          <button class="btn btn-xs btn-ghost" data-cart-minus="${item.id}">-</button>
          <span class="w-6 text-center text-sm">${item.qty}</span>
          <button class="btn btn-xs btn-ghost" data-cart-plus="${item.id}">+</button>
        </div>
      </div>
    `).join("");
        },

        renderCartModal() {
            const itemCount = State.getCartItemCount();
            const subtotal = State.getCartSubtotal();
            const delivery = State.getDeliveryFee();
            const total = subtotal + delivery;

            if (State.cart.length === 0) {
                DOM.modalCartContainer.classList.add("hidden");
                DOM.emptyCartModal.classList.remove("hidden");
                return;
            }

            DOM.modalCartContainer.classList.remove("hidden");
            DOM.emptyCartModal.classList.add("hidden");

            DOM.modalCartList.innerHTML = State.cart.map((item) => `
      <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
        <img src="${item.image}" class="w-20 h-20 object-contain bg-white rounded p-2" />
        
        <div class="flex-1">
          <h3 class="font-semibold text-base">${item.title}</h3>
          <p class="text-sm text-gray-500">${item.category}</p>
          <p class="text-lg font-bold text-blue-700 mt-1">$${item.price.toFixed(2)}</p>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-outline" data-modal-qty-minus="${item.id}">
            <i class="fa-solid fa-minus text-xs"></i>
          </button>
          <span class="w-8 text-center font-semibold">${item.qty}</span>
          <button class="btn btn-sm btn-outline" data-modal-qty-plus="${item.id}">
            <i class="fa-solid fa-plus text-xs"></i>
          </button>
        </div>

        <button class="btn btn-sm btn-error bg-red-500 text-white border-0" data-modal-remove-id="${item.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join("");

            DOM.modalItemsCount.innerText = itemCount;
            DOM.modalSubtotalText.innerText = `$${subtotal.toFixed(2)}`;
            DOM.modalDeliveryText.innerText = `$${delivery.toFixed(2)}`;
            DOM.modalTotalText.innerText = `$${total.toFixed(2)}`;
        },

        renderWishlist() {
            const wishlistProducts = State.allProducts.filter(p => State.isInWishlist(p.id));

            if (wishlistProducts.length === 0) {
                DOM.wishlistModalContent.innerHTML = "";
                DOM.emptyWishlistState.classList.remove("hidden");
                return;
            }

            DOM.emptyWishlistState.classList.add("hidden");
            DOM.wishlistModalContent.innerHTML = wishlistProducts.map(product => `
      <div class="card bg-base-100 shadow-md border border-gray-200 rounded-xl">
        <figure class="bg-base-200 p-4 flex items-center justify-center">
          <img class="h-32 w-full object-contain" src="${product.image}" alt="${product.title}" />
        </figure>
        <div class="card-body p-4">
          <h2 class="card-title text-base">${Utils.shortTitle(product.title)}</h2>
          <p class="text-lg font-bold text-blue-700">$${product.price.toFixed(2)}</p>
          <div class="card-actions mt-4 gap-2">
            <button class="btn btn-sm btn-outline flex-1" data-details-id="${product.id}" onclick="document.getElementById('wishlistModal').close()">
              View
            </button>
            <button class="btn btn-sm btn-error text-white border-0 flex-1" data-wishlist-remove="${product.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");
        },

        renderOrders() {
            if (State.orders.length === 0) {
                DOM.ordersListContent.innerHTML = "";
                DOM.emptyOrdersState.classList.remove("hidden");
                return;
            }

            DOM.emptyOrdersState.classList.add("hidden");
            DOM.ordersListContent.innerHTML = State.orders.map(order => `
      <div class="bg-base-100 rounded-lg p-6 border border-gray-200 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-4 pb-4 border-b">
          <div>
            <p class="font-bold text-lg">${order.id}</p>
            <p class="text-sm text-gray-500">${Utils.formatDate(order.createdAt)}</p>
          </div>
          <div class="badge ${order.status === 'PLACED' ? 'badge-warning' : 'badge-success'}">
            ${order.status}
          </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500">Items</p>
            <p class="font-bold">${order.itemsCount}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Subtotal</p>
            <p class="font-bold">$${order.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Delivery</p>
            <p class="font-bold">$${order.deliveryFee.toFixed(2)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Total</p>
            <p class="font-bold text-blue-700">$${order.total.toFixed(2)}</p>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-500 mb-2">Ordered by: ${order.customer.name}</p>
          <p class="text-xs text-gray-500">Items: ${order.items.map(i => i.title).slice(0, 2).join(", ")}${order.items.length > 2 ? `...` : ""}</p>
        </div>
      </div>
    `).join("");
    },

    updateUserMenu() {
        DOM.wishlistCount.innerText = State.wishlist.length;

        if (State.user) {
            DOM.loginLink.classList.add("hidden");
            DOM.logoutLink.classList.remove("hidden");
            DOM.userMenuBtn.innerHTML = `<i class="fa-solid fa-user-circle text-lg"></i>`;
            DOM.userMenuBtn.title = `${State.user.name}`;
        } else {
            DOM.loginLink.classList.remove("hidden");
            DOM.logoutLink.classList.add("hidden");
            DOM.userMenuBtn.innerHTML = `<i class="fa-solid fa-user text-lg"></i>`;
            DOM.userMenuBtn.title = "Login";
        }
    },

    updateCheckoutSummary() {
        const itemCount = State.getCartItemCount();
        const subtotal = State.getCartSubtotal();
        const delivery = State.getDeliveryFee();
        const total = subtotal + delivery;

        DOM.checkoutItemsText.innerText = itemCount;
        DOM.checkoutSubtotalText.innerText = `$${subtotal.toFixed(2)}`;
        DOM.checkoutDeliveryText.innerText = `$${delivery.toFixed(2)}`;
        DOM.checkoutTotalText.innerText = `$${total.toFixed(2)}`;
    }
};

// =====================
// EVENT HANDLERS
// =====================
const Handlers = {
    setupCartEvents() {
        document.addEventListener("click", (e) => {
            const plusBtn = e.target.closest("[data-cart-plus]");
            if (plusBtn) {
                const id = Number(plusBtn.dataset.cartPlus);
                const item = State.cart.find(i => i.id === id);
                if (item) {
                    State.updateCartQty(id, item.qty + 1);
                    Renderers.renderCartDropdown();
                    Renderers.renderCartModal();
                }
            }

            const minusBtn = e.target.closest("[data-cart-minus]");
            if (minusBtn) {
                const id = Number(minusBtn.dataset.cartMinus);
                const item = State.cart.find(i => i.id === id);
                if (item) {
                    State.updateCartQty(id, item.qty - 1);
                    Renderers.renderCartDropdown();
                    Renderers.renderCartModal();
                }
            }

            const modalPlusBtn = e.target.closest("[data-modal-qty-plus]");
            if (modalPlusBtn) {
                const id = Number(modalPlusBtn.dataset.modalQtyPlus);
                const item = State.cart.find(i => i.id === id);
                if (item) {
                    State.updateCartQty(id, item.qty + 1);
                    Renderers.renderCartDropdown();
                    Renderers.renderCartModal();
                }
            }

            const modalMinusBtn = e.target.closest("[data-modal-qty-minus]");
            if (modalMinusBtn) {
                const id = Number(modalMinusBtn.dataset.modalQtyMinus);
                const item = State.cart.find(i => i.id === id);
                if (item) {
                    State.updateCartQty(id, item.qty - 1);
                    Renderers.renderCartDropdown();
                    Renderers.renderCartModal();
                }
            }

            const removeBtn = e.target.closest("[data-modal-remove-id]");
            if (removeBtn) {
                const id = Number(removeBtn.dataset.modalRemoveId);
                State.removeFromCart(id);
                Utils.showToast("Item removed from cart", "info");
                Renderers.renderCartDropdown();
                Renderers.renderCartModal();
            }
        });

        if (DOM.viewCartBtn) {
            DOM.viewCartBtn.addEventListener("click", () => {
                const trigger = document.querySelector(".dropdown-end .btn-circle");
                if (trigger) trigger.blur();
                DOM.cartModal?.showModal();
            });
        }

        if (DOM.modalClearCartBtn) {
            DOM.modalClearCartBtn.addEventListener("click", () => {
                if (confirm("Are you sure you want to clear your cart?")) {
                    State.clearCart();
                    Utils.showToast("Cart cleared", "success");
                    Renderers.renderCartDropdown();
                    Renderers.renderCartModal();
                }
            });
        }
    },

    setupProductEvents() {
        document.addEventListener("click", (e) => {
            const detailsBtn = e.target.closest("[data-details-id]");
            if (detailsBtn) {
                const id = Number(detailsBtn.dataset.detailsId);
                Handlers.openProductDetails(id);
            }

            const addBtn = e.target.closest("[data-add-to-cart]");
            if (addBtn) {
                const id = Number(addBtn.dataset.addToCart);
                const product = State.allProducts.find(p => p.id === id);
                if (product) {
                    State.addToCart(product, 1);
                    Utils.showToast(`${Utils.shortTitle(product.title)} added to cart`, "success");
                    Renderers.renderCartDropdown();
                    Renderers.renderCartModal();
                }
            }

            const wishlistBtn = e.target.closest("[data-wishlist-id]");
            if (wishlistBtn) {
                const id = Number(wishlistBtn.dataset.wishlistId);
                State.toggleWishlist(id);
                const inWishlist = State.isInWishlist(id);
                const icon = wishlistBtn.querySelector("i");
                icon.classList.toggle("text-red-500");
                icon.classList.toggle("text-gray-300");
                icon.classList.toggle("fill-red-500");
                Utils.showToast(inWishlist ? "Added to wishlist" : "Removed from wishlist", "success");
                Renderers.updateUserMenu();
            }

            const removeWishlistBtn = e.target.closest("[data-wishlist-remove]");
            if (removeWishlistBtn) {
                const id = Number(removeWishlistBtn.dataset.wishlistRemove);
                State.toggleWishlist(id);
                Renderers.renderWishlist();
                Renderers.updateUserMenu();
                Utils.showToast("Removed from wishlist", "info");
            }
        });
    },

    openProductDetails(id) {
        const product = State.allProducts.find(p => p.id === id);
        if (!product) return;

        let qtyValue = 1;
        const inWishlist = State.isInWishlist(product.id);

        DOM.detailsBody.innerHTML = `
      <div class="grid sm:grid-cols-2 gap-6">
        <div class="bg-base-200 rounded-xl p-6 flex justify-center">
          <img class="h-56 object-contain" src="${product.image}" alt="${product.title}" />
        </div>

        <div>
          <span class="badge badge-outline capitalize">${product.category}</span>

          <h2 class="text-2xl font-bold mt-3">${product.title}</h2>

          <p class="mt-3 text-gray-600 text-sm leading-relaxed">${product.description}</p>

          <p class="text-3xl font-bold text-blue-700 mt-5">$${product.price.toFixed(2)}</p>

          <p class="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <i class="fa-solid fa-star text-yellow-500"></i>
            ${product.rating.rate} / 5 (${product.rating.count} reviews)
          </p>

          <div class="mt-5 flex items-center gap-3">
            <span class="font-semibold">Quantity:</span>
            <div class="flex items-center gap-2 border rounded-lg">
              <button class="btn btn-xs btn-ghost qty-decrease">-</button>
              <input type="number" class="input input-xs input-bordered w-12 text-center qty-input" value="1" min="1" max="999" />
              <button class="btn btn-xs btn-ghost qty-increase">+</button>
            </div>
          </div>

          <div class="flex gap-2 mt-6">
            <button class="btn btn-lg btn-primary bg-blue-700 hover:bg-blue-800 border-0 flex-1 add-to-cart-btn">
              <i class="fa-solid fa-cart-plus text-lg"></i> Add to Cart
            </button>
            <button class="btn btn-lg btn-outline wishlist-detail-btn px-4" title="Add to wishlist">
              <i class="fa-solid fa-heart fa-xl ${inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'}"></i>
            </button>
          </div>
        </div>
      </div>
    `;

        const qtyInput = DOM.detailsBody.querySelector(".qty-input");
        const qtyIncrease = DOM.detailsBody.querySelector(".qty-increase");
        const qtyDecrease = DOM.detailsBody.querySelector(".qty-decrease");
        const addBtn = DOM.detailsBody.querySelector(".add-to-cart-btn");
        const wishlistDetailBtn = DOM.detailsBody.querySelector(".wishlist-detail-btn");

        qtyIncrease.addEventListener("click", () => {
            qtyValue = Math.min(999, qtyValue + 1);
            qtyInput.value = qtyValue;
        });

        qtyDecrease.addEventListener("click", () => {
            qtyValue = Math.max(1, qtyValue - 1);
            qtyInput.value = qtyValue;
        });

        qtyInput.addEventListener("change", () => {
            qtyValue = Math.max(1, Math.min(999, parseInt(qtyInput.value) || 1));
            qtyInput.value = qtyValue;
        });

        addBtn.addEventListener("click", () => {
            State.addToCart(product, qtyValue);
            Utils.showToast(`${qtyValue} x ${Utils.shortTitle(product.title)} added to cart`, "success");
            Renderers.renderCartDropdown();
            Renderers.renderCartModal();
            DOM.detailsModal.classList.add("hidden");
        });

        wishlistDetailBtn.addEventListener("click", () => {
            State.toggleWishlist(product.id);
            const inWishlist = State.isInWishlist(product.id);
            const icon = wishlistDetailBtn.querySelector("i");
            if (inWishlist) {
                icon.classList.add("text-red-500", "fill-red-500");
                icon.classList.remove("text-gray-400");
            } else {
                icon.classList.remove("text-red-500", "fill-red-500");
                icon.classList.add("text-gray-400");
            }
            Utils.showToast(inWishlist ? "Added to wishlist" : "Removed from wishlist", "success");
            Renderers.updateUserMenu();
        });

        DOM.detailsModal.classList.remove("hidden");
        DOM.detailsModal.classList.add("flex");
    },

    setupSearchAndSort() {
        if (DOM.searchInput) {
            const debouncedSearch = Utils.debounce(() => {
                const query = DOM.searchInput.value.toLowerCase().trim();
                State.searchQuery = query;
                Handlers.filterProducts();
            }, 300);

            DOM.searchInput.addEventListener("input", debouncedSearch);
        }

        if (DOM.sortDropdown) {
            DOM.sortDropdown.addEventListener("change", () => {
                State.sortBy = DOM.sortDropdown.value;
                Handlers.filterProducts();
            });
        }
    },

    filterProducts() {
        let results = [...State.allProducts];

        if (State.searchQuery) {
            results = results.filter(p =>
                p.title.toLowerCase().includes(State.searchQuery) ||
                p.category.toLowerCase().includes(State.searchQuery)
            );
        }

        if (State.sortBy === "price-low") {
            results.sort((a, b) => a.price - b.price);
        } else if (State.sortBy === "price-high") {
            results.sort((a, b) => b.price - a.price);
        } else if (State.sortBy === "rating") {
            results.sort((a, b) => b.rating.rate - a.rating.rate);
        }

        State.filteredProducts = results;
        Renderers.renderProducts(results);
    },

    setupWishlistButton() {
        if (DOM.wishlistBtn) {
            DOM.wishlistBtn.addEventListener("click", () => {
                Renderers.renderWishlist();
                DOM.wishlistModal?.showModal();
            });
        }
    },

    setupCheckout() {
        if (DOM.checkoutBtn) {
            DOM.checkoutBtn.addEventListener("click", () => {
                if (State.cart.length === 0) {
                    Utils.showToast("Cart is empty", "warning");
                    return;
                }

                if (!State.user) {
                    DOM.cartModal?.close();
                    DOM.loginModal?.showModal();
                    Utils.showToast("Please login to proceed with checkout", "info");
                    return;
                }

                if (State.user) {
                    DOM.checkoutName.value = State.user.name;
                    DOM.checkoutEmail.value = State.user.email;
                }

                Renderers.updateCheckoutSummary();
                DOM.cartModal?.close();
                DOM.checkoutModal?.showModal();
            });
        }

        if (DOM.confirmOrderBtn) {
            DOM.confirmOrderBtn.addEventListener("click", () => {
                Handlers.processCheckout();
            });
        }
    },

    processCheckout() {
        const name = DOM.checkoutName?.value?.trim() || "";
        const email = DOM.checkoutEmail?.value?.trim() || "";
        const phone = DOM.checkoutPhone?.value?.trim() || "";
        const address = DOM.checkoutAddress?.value?.trim() || "";
        const paymentMethod = document.querySelector("input[name='paymentMethod']:checked")?.value || "";

        if (!name || !email || !phone || !address || !paymentMethod) {
            Handlers.showCheckoutMessage("Please complete all required fields", "error");
            return;
        }

        const subtotal = State.getCartSubtotal();
        const delivery = State.getDeliveryFee();
        const total = subtotal + delivery;

        const order = {
            id: "SC-" + Date.now(),
            createdAt: new Date().toISOString(),
            items: State.cart.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                qty: item.qty,
                category: item.category
            })),
            itemsCount: State.getCartItemCount(),
            subtotal: subtotal,
            deliveryFee: delivery,
            total: total,
            customer: {
                name: name,
                email: email,
                phone: phone,
                address: address
            },
            paymentMethod: paymentMethod,
            status: "PLACED"
        };

        State.addOrder(order);
        State.clearCart();
        Renderers.renderCartDropdown();

        Handlers.showCheckoutMessage(`✓ Order placed successfully! Order ID: ${order.id}`, "success");

        setTimeout(() => {
            DOM.checkoutModal?.close();
            DOM.checkoutForm?.reset();
            Utils.showToast("Order placed successfully!", "success");
        }, 1500);
    },

    showCheckoutMessage(message, type = "info") {
        const bgColor = type === "error" ? "alert-error" :
            type === "success" ? "alert-success" :
            "alert-info";

        DOM.checkoutMessage.innerHTML = `
      <div class="alert ${bgColor} shadow-lg">
        <span>${message}</span>
      </div>
    `;
        DOM.checkoutMessage.classList.remove("hidden");
    },

    setupAuth() {
        if (DOM.loginLink) {
            DOM.loginLink.addEventListener("click", (e) => {
                e.preventDefault();
                DOM.loginModal?.showModal();
            });
        }

        if (DOM.logoutLink) {
            DOM.logoutLink.addEventListener("click", (e) => {
                e.preventDefault();
                State.logout();
                Renderers.updateUserMenu();
                Utils.showToast("Logged out successfully", "success");
            });
        }

        if (DOM.ordersLink) {
            DOM.ordersLink.addEventListener("click", (e) => {
                e.preventDefault();
                if (!State.user) {
                    Utils.showToast("Please login to view your orders", "warning");
                    DOM.loginModal?.showModal();
                    return;
                }
                Renderers.renderOrders();
                DOM.ordersModal?.showModal();
            });
        }

        if (DOM.loginForm) {
            DOM.loginForm.addEventListener("submit", (e) => {
                e.preventDefault();

                const name = document.getElementById("loginName")?.value?.trim() || "";
                const email = document.getElementById("loginEmail")?.value?.trim() || "";

                if (!name || !email) {
                    Utils.showToast("Please fill in all fields", "warning");
                    return;
                }

                State.login(name, email);
                Renderers.updateUserMenu();
                DOM.loginForm.reset();
                DOM.loginModal?.close();
                Utils.showToast(`Welcome, ${name}!`, "success");
            });
        }
    },

    setupNavbar() {
        if (!DOM.navLinks && !DOM.mobileNavLinks) return;

        const navItems = [
            { label: "Home", id: "navHome" },
            { label: "About", id: "navAbout" },
            { label: "Products", id: "navProducts" },
            { label: "Contact", id: "navContact" }
        ];

        const setActiveNav = (label) => {
            // Update desktop nav
            if (DOM.navLinks) {
                Array.from(DOM.navLinks.querySelectorAll("a")).forEach(link => {
                    if (link.textContent.trim() === label) {
                        link.classList.add("active", "font-bold", "text-blue-600");
                    } else {
                        link.classList.remove("active", "font-bold", "text-blue-600");
                    }
                });
            }
            // Update mobile nav
            if (DOM.mobileNavLinks) {
                Array.from(DOM.mobileNavLinks.querySelectorAll("a")).forEach(link => {
                    if (link.textContent.trim() === label) {
                        link.classList.add("active", "font-bold", "text-blue-600");
                    } else {
                        link.classList.remove("active", "font-bold", "text-blue-600");
                    }
                });
            }
        };

        // Scroll to products on Products click
        const scrollToProducts = () => {
            const productsSection = document.getElementById("productsGrid");
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            setActiveNav("Products");
        };

        // Generic scroll helper used by Shop Now button in index.html
        window.scrollToSection = function(id) {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        };

        // Add click handlers to desktop nav
        if (DOM.navLinks) {
            Array.from(DOM.navLinks.querySelectorAll("a")).forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const text = link.textContent.trim();
                    if (text === "Products") {
                        scrollToProducts();
                    } else {
                        setActiveNav(text);
                        Utils.showToast(`Navigated to ${text}`, "info");
                    }
                });
            });
        }

        // Add click handlers to mobile nav
        if (DOM.mobileNavLinks) {
            Array.from(DOM.mobileNavLinks.querySelectorAll("a")).forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const text = link.textContent.trim();
                    if (text === "Products") {
                        scrollToProducts();
                    } else {
                        setActiveNav(text);
                        Utils.showToast(`Navigated to ${text}`, "info");
                    }
                    // Close mobile menu
                    const dropdown = DOM.mobileNavLinks?.parentElement;
                    if (dropdown) {
                        dropdown.removeAttribute("open");
                    }
                });
            });
        }

        // Set Home as active by default
        setActiveNav("Home");
    },

    setupModalClose() {
        if (DOM.detailsClose) {
            DOM.detailsClose.addEventListener("click", () => {
                DOM.detailsModal.classList.add("hidden");
            });
            DOM.detailsModal?.addEventListener("click", (e) => {
                if (e.target === DOM.detailsModal) {
                    DOM.detailsModal.classList.add("hidden");
                }
            });
        }
    }
};

// =====================
// LOADERS
// =====================
const Loaders = {
    async loadAllProducts() {
        try {
            State.isLoading = true;
            DOM.skeletonLoader.style.display = "grid";
            const res = await fetch(`${API_BASE}/products`);
            const data = await res.json();
            State.allProducts = data;
            State.filteredProducts = data;
            Renderers.renderProducts(data);
            Handlers.renderTrending();
            return data;
        } catch (error) {
            console.error("Error loading products:", error);
            Utils.showToast("Failed to load products", "error");
            return [];
        } finally {
            State.isLoading = false;
        }
    },

    renderTrending() {
        if (!DOM.trending) return;
        const sorted = [...State.allProducts]
            .sort((a, b) => b.rating.rate - a.rating.rate)
            .slice(0, 3);
        DOM.trending.innerHTML = sorted.map(p => Renderers.createProductCard(p)).join("");
    },

    async loadCategories() {
        try {
            const res = await fetch(`${API_BASE}/products/categories`);
            const categories = await res.json();
            Handlers.renderCategories(categories);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }
};

// Additional handler methods
Handlers.renderTrending = Loaders.renderTrending;
Handlers.renderCategories = function(categories) {
    if (!DOM.categoryButtons) return;
        DOM.categoryButtons.innerHTML = `
        <button type="button" class="btn btn-sm rounded-full px-5 bg-blue-700 text-white border-0 shadow-sm" data-cat="all">All</button>
        ${categories.map(cat => `
            <button type="button" class="btn btn-sm btn-outline rounded-full px-5 capitalize" data-cat="${cat}">
                ${cat}
            </button>
        `).join("")}
    `;

        // Use delegated click handler and log for debugging
        DOM.categoryButtons.addEventListener("click", (e) => {
                const btn = e.target.closest("button[data-cat]");
                if (!btn) return;
                const category = btn.dataset.cat;
                console.log("Category clicked:", category);
                Handlers.filterByCategory(category);
                Handlers.setActiveCategory(category);
        });

    Handlers.setActiveCategory("all");
};

Handlers.filterByCategory = function(category) {
    if (category === "all") {
        State.filteredProducts = State.allProducts;
        DOM.sortDropdown.value = "default";
        State.sortBy = "default";
    } else {
        State.filteredProducts = State.allProducts.filter(p => p.category === category);
    }
    Handlers.filterProducts();
};

Handlers.setActiveCategory = function(activeCat) {
    const buttons = DOM.categoryButtons?.querySelectorAll("button[data-cat]");
    buttons?.forEach((btn) => {
        btn.classList.remove("bg-blue-700", "text-white", "border-0");
        btn.classList.add("btn-outline");
        if (btn.dataset.cat === activeCat) {
            btn.classList.add("bg-blue-700", "text-white", "border-0");
            btn.classList.remove("btn-outline");
        }
    });
};

// =====================
// INITIALIZATION
// =====================
async function init() {
    State.init();
    Renderers.updateUserMenu();
    await Loaders.loadAllProducts();
    await Loaders.loadCategories();
    
    Handlers.setupNavbar();
    Handlers.setupCartEvents();
    Handlers.setupProductEvents();
    Handlers.setupSearchAndSort();
    Handlers.setupWishlistButton();
    Handlers.setupCheckout();
    Handlers.setupAuth();
    Handlers.setupModalClose();
}

// Start the app
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}