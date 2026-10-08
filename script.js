/* ==================================================
   1. CART BADGE — GLOBAL (Har page pe chalega)
   ================================================== */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("glowmuse_cart")) || [];
  } catch (e) {
    return [];
  }
}

function updateCartBadge() {
  const el = document.getElementById("cartCount");
  if (!el) return;

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  console.log("🛒 Cart badge update →", total, "items");

  if (total > 0) {
    el.textContent = total;
    el.classList.add("show");
  } else {
    el.textContent = "0";
    el.classList.remove("show");
  }
}

/* ⭐ Ye 3 calls — refresh pe bhi kaam karega */
updateCartBadge();
document.addEventListener("DOMContentLoaded", updateCartBadge);
window.addEventListener("load", updateCartBadge);

/* ==================================================
   2. WISHLIST BADGE — Same tarika
   ================================================== */
function getWishlist() {
  try {
    const wishlist =
      JSON.parse(localStorage.getItem("glowmuse_wishlist")) || [];
    return wishlist.map((item) =>
      typeof item === "string"
        ? { name: item, desc: "", price: "", image: "", qty: 1 }
        : item,
    );
  } catch (e) {
    return [];
  }
}

function updateWishlistBadge() {
  const el = document.getElementById("wishlistCount");
  if (!el) return;

  const wishlist = getWishlist();
  const total = wishlist.length;

  if (total > 0) {
    el.textContent = total;
    el.classList.add("show");
  } else {
    el.textContent = "0";
    el.classList.remove("show");
  }
}

updateWishlistBadge();
document.addEventListener("DOMContentLoaded", updateWishlistBadge);
window.addEventListener("load", updateWishlistBadge);

/* ==================================================
   GLOWMUSE — FULL WORKING JAVASCRIPT
   With "All" button support
   ================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const drawer = document.createElement("div");
  drawer.className = "commerce-drawer-overlay";
  drawer.hidden = true;
  drawer.innerHTML = `
    <section class="commerce-drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
      <header class="commerce-drawer-header">
        <div>
          <p class="commerce-drawer-eyebrow">GLOWMUSE</p>
          <h2 id="drawerTitle"></h2>
        </div>
        <button class="commerce-drawer-close" type="button" aria-label="Close">&times;</button>
      </header>
      <div class="commerce-drawer-items"></div>
      <div class="commerce-profile-view" hidden></div>
      <footer class="commerce-drawer-footer"></footer>
    </section>`;
  document.body.appendChild(drawer);

  const drawerTitle = drawer.querySelector("#drawerTitle");
  const drawerItems = drawer.querySelector(".commerce-drawer-items");
  const profileView = drawer.querySelector(".commerce-profile-view");
  const drawerFooter = drawer.querySelector(".commerce-drawer-footer");
  let activeList = "cart";

  function productFromCard(card) {
    return {
      name: card.querySelector(".p-name")?.textContent.trim() || "Product",
      desc: card.querySelector(".p-desc")?.textContent.trim() || "",
      price: card.querySelector(".price")?.textContent.trim() || "₹0",
      mrp: card.querySelector(".mrp")?.textContent.trim() || "",
      image: card.querySelector(".card-img img")?.src || "",
      qty: 1,
    };
  }

  function refreshSavedItems() {
    drawerTitle.textContent = {
      cart: "Your Cart",
      wishlist: "Your Wishlist",
      profile: "Your Profile",
    }[activeList];
    drawerItems.hidden = activeList === "profile";
    profileView.hidden = activeList !== "profile";
    drawerFooter.hidden = activeList === "profile";
    drawerItems.replaceChildren();
    drawerFooter.replaceChildren();

    if (activeList === "profile") {
      let profile = {};
      try {
        profile = JSON.parse(localStorage.getItem("glowmuse_profile")) || {};
      } catch (error) {
        profile = {};
      }
      profileView.innerHTML = `
        <div class="profile-intro">
          <div class="profile-avatar" aria-hidden="true"></div>
          <div>
            <h3 class="profile-greeting"></h3>
            <p>Personal details</p>
          </div>
        </div>
        <form class="profile-form">
          <label for="profileName">Full name</label>
          <input id="profileName" name="name" type="text" autocomplete="name" required>
          <label for="profileEmail">Email address</label>
          <input id="profileEmail" name="email" type="email" autocomplete="email" required>
          <label for="profilePhone">Phone number</label>
          <input id="profilePhone" name="phone" type="tel" autocomplete="tel">
          <p class="profile-save-status" aria-live="polite"></p>
          <button class="profile-save-button" type="submit">Save Profile</button>
        </form>`;
      profileView.querySelector("#profileName").value = profile.name || "";
      profileView.querySelector("#profileEmail").value = profile.email || "";
      profileView.querySelector("#profilePhone").value = profile.phone || "";
      profileView.querySelector(".profile-greeting").textContent = profile.name
        ? `Welcome, ${profile.name}`
        : "Welcome to GlowMuse";
      profileView.querySelector(".profile-avatar").textContent = profile.name
        ? profile.name.trim().charAt(0).toUpperCase()
        : "G";
      return;
    }

    const items = activeList === "cart" ? getCart() : getWishlist();

    if (!items.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "commerce-empty-state";
      emptyState.textContent =
        activeList === "cart"
          ? "Your cart is empty. Add a product to see it here."
          : "Your wishlist is empty. Save a product with the heart button.";
      drawerItems.appendChild(emptyState);
    }

    items.forEach((item) => {
      const row = document.createElement("article");
      row.className = "commerce-item";

      const image = document.createElement("img");
      image.className = "commerce-item-image";
      image.src = item.image || "";
      image.alt = item.name;
      row.appendChild(image);

      const info = document.createElement("div");
      info.className = "commerce-item-info";
      const name = document.createElement("h3");
      name.textContent = item.name;
      const description = document.createElement("p");
      description.textContent = item.desc || "";
      const price = document.createElement("strong");
      price.textContent = item.price || "";
      info.append(name, description, price);
      row.appendChild(info);

      const actions = document.createElement("div");
      actions.className = "commerce-item-actions";
      if (activeList === "cart") {
        const decrease = document.createElement("button");
        decrease.type = "button";
        decrease.dataset.action = "decrease";
        decrease.dataset.name = item.name;
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", `Decrease ${item.name} quantity`);
        const quantity = document.createElement("span");
        quantity.textContent = String(item.qty || 1);
        const increase = document.createElement("button");
        increase.type = "button";
        increase.dataset.action = "increase";
        increase.dataset.name = item.name;
        increase.textContent = "+";
        increase.setAttribute("aria-label", `Increase ${item.name} quantity`);
        actions.append(decrease, quantity, increase);
      }
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "commerce-item-remove";
      remove.dataset.action = "remove";
      remove.dataset.name = item.name;
      remove.textContent = "Remove";
      actions.appendChild(remove);
      row.appendChild(actions);
      drawerItems.appendChild(row);
    });

    if (activeList === "cart" && items.length) {
      const total = items.reduce((sum, item) => {
        const amount =
          Number(String(item.price || "").replace(/[^0-9.]/g, "")) || 0;
        return sum + amount * (item.qty || 1);
      }, 0);
      const totalLabel = document.createElement("span");
      totalLabel.textContent = "Subtotal";
      const totalAmount = document.createElement("strong");
      totalAmount.textContent = `₹${total.toLocaleString("en-IN")}`;
      drawerFooter.append(totalLabel, totalAmount);
    }
  }

  function openDrawer(list) {
    activeList = list;
    refreshSavedItems();
    drawer.hidden = false;
    document.body.classList.add("commerce-drawer-open");
    drawer.querySelector(".commerce-drawer-close").focus();
  }

  function closeDrawer() {
    drawer.hidden = true;
    document.body.classList.remove("commerce-drawer-open");
  }

  function saveCartProduct(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.name === product.name);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.push(product);
    localStorage.setItem("glowmuse_cart", JSON.stringify(cart));
    updateCartBadge();
    if (!drawer.hidden && activeList === "cart") refreshSavedItems();
  }

  document.querySelectorAll(".add-cart").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const card = button.closest(".product-card");
      if (!card) return;
      saveCartProduct(productFromCard(card));

      const originalText = button.textContent;
      button.textContent = "✓ Added!";
      button.classList.add("added");
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("added");
      }, 1500);
    });
  });

  document.querySelectorAll(".wishlist").forEach((button) => {
    const card = button.closest(".product-card");
    const product = card ? productFromCard(card) : null;
    if (!product) return;

    const paintWishlistButton = () => {
      const saved = getWishlist().some((item) => item.name === product.name);
      button.classList.toggle("active", saved);
      button.innerHTML = saved
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';
    };
    paintWishlistButton();

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const wishlist = getWishlist();
      const index = wishlist.findIndex((item) => item.name === product.name);
      if (index >= 0) wishlist.splice(index, 1);
      else wishlist.push(product);
      localStorage.setItem("glowmuse_wishlist", JSON.stringify(wishlist));
      updateWishlistBadge();
      paintWishlistButton();
      if (!drawer.hidden && activeList === "wishlist") refreshSavedItems();
    });
  });

  document
    .querySelector(".cart-icon")
    ?.addEventListener("click", () => openDrawer("cart"));
  document
    .querySelector(".wishlist-icon")
    ?.addEventListener("click", () => openDrawer("wishlist"));
  document
    .querySelector(".user-icon")
    ?.addEventListener("click", () => openDrawer("profile"));
  drawer
    .querySelector(".commerce-drawer-close")
    .addEventListener("click", closeDrawer);
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) closeDrawer();
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const itemName = actionButton.dataset.name;
    const action = actionButton.dataset.action;
    if (activeList === "cart") {
      const cart = getCart();
      const index = cart.findIndex((item) => item.name === itemName);
      if (index < 0) return;
      if (action === "remove") cart.splice(index, 1);
      if (action === "increase") cart[index].qty = (cart[index].qty || 1) + 1;
      if (action === "decrease") {
        cart[index].qty = (cart[index].qty || 1) - 1;
        if (cart[index].qty <= 0) cart.splice(index, 1);
      }
      localStorage.setItem("glowmuse_cart", JSON.stringify(cart));
      updateCartBadge();
    } else {
      const wishlist = getWishlist().filter((item) => item.name !== itemName);
      localStorage.setItem("glowmuse_wishlist", JSON.stringify(wishlist));
      updateWishlistBadge();
      document.querySelectorAll(".wishlist").forEach((button) => {
        if (
          button
            .closest(".product-card")
            ?.querySelector(".p-name")
            ?.textContent.trim() === itemName
        ) {
          button.classList.remove("active");
          button.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }
      });
    }
    refreshSavedItems();
  });
  drawer.addEventListener("submit", (event) => {
    if (!event.target.matches(".profile-form")) return;
    event.preventDefault();
    const formData = new FormData(event.target);
    const profile = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
    };
    localStorage.setItem("glowmuse_profile", JSON.stringify(profile));
    profileView.querySelector(".profile-greeting").textContent =
      `Welcome, ${profile.name}`;
    profileView.querySelector(".profile-avatar").textContent = profile.name
      .charAt(0)
      .toUpperCase();
    profileView.querySelector(".profile-save-status").textContent =
      "Your profile has been saved.";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !drawer.hidden) closeDrawer();
  });

  console.log(
    "%c✨ GlowMuse Loaded",
    "color: #B3415F; font-size: 16px; font-weight: bold;",
  );

  /* ==================================================
     GLOBAL VARIABLES
     ================================================== */
  const pills = document.querySelectorAll(".pill");
  const productCards = document.querySelectorAll(".product-card");
  const grid = document.getElementById("productGrid");
  const resultCount = document.getElementById("resultCount");
  const priceSlider = document.getElementById("priceSlider");
  const priceValue = document.getElementById("priceValue");
  const sortSelect = document.getElementById("sortSelect");

  let selectedSkin = "all"; // Default = "All"
  let maxPrice = 5000;
  let cartCount = 0;

  /* ==================================================
     1. SKIN PILLS — Filter Products (with "All")
     ================================================== */
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      // Sabhi pills se active hatao
      pills.forEach((p) => p.classList.remove("active"));
      // Clicked pill ko active karo
      pill.classList.add("active");

      // Skin value update
      selectedSkin = pill.dataset.skin;
      console.log("Skin selected:", selectedSkin);

      // Products filter karo
      applyFilters();
    });
  });

  /* ==================================================
     3. PRICE SLIDER — Live Update
     ================================================== */
  if (priceSlider && priceValue) {
    priceSlider.addEventListener("input", (e) => {
      maxPrice = parseInt(e.target.value);
      priceValue.textContent = "₹" + maxPrice;
      applyFilters();
    });
  }

  /* ==================================================
     4. SORT DROPDOWN — Actually Sorts
     ================================================== */
  if (sortSelect && grid) {
    sortSelect.addEventListener("change", (e) => {
      const sortBy = e.target.value;
      const cardsArray = Array.from(grid.querySelectorAll(".product-card"));

      cardsArray.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        const ratingA = parseFloat(a.dataset.rating);
        const ratingB = parseFloat(b.dataset.rating);

        if (sortBy === "low") return priceA - priceB;
        if (sortBy === "high") return priceB - priceA;
        if (sortBy === "rating") return ratingB - ratingA;
        return 0; // popular / new — original order
      });

      // Sorted cards ko grid me wapas lagao
      cardsArray.forEach((card) => grid.appendChild(card));
    });
  }

  /* ==================================================
     5. FILTERS — Checkbox / Radio Change
     ================================================== */
  document.querySelectorAll(".filters input").forEach((input) => {
    input.addEventListener("change", () => {
      applyFilters();
    });
  });

  /* ==================================================
     6. APPLY FILTERS — Main Logic
     ================================================== */
  function applyFilters() {
    // --- Selected Categories ---
    const categories = Array.from(
      document.querySelectorAll(
        '.filters input[value="skincare"]:checked, ' +
          '.filters input[value="makeup"]:checked, ' +
          '.filters input[value="haircare"]:checked, ' +
          '.filters input[value="fragrance"]:checked',
      ),
    ).map((i) => i.value);

    // --- Selected Skin Types (sidebar) ---
    const filterSkins = Array.from(
      document.querySelectorAll(
        '.filters input[value="oily"]:checked, ' +
          '.filters input[value="dry"]:checked, ' +
          '.filters input[value="combination"]:checked, ' +
          '.filters input[value="sensitive"]:checked, ' +
          '.filters input[value="normal"]:checked',
      ),
    ).map((i) => i.value);

    // --- Selected Brands ---
    const brands = Array.from(
      document.querySelectorAll(
        '.filters input[value="glowmuse"]:checked, ' +
          '.filters input[value="lakme"]:checked, ' +
          '.filters input[value="nykaa"]:checked, ' +
          '.filters input[value="mamaearth"]:checked',
      ),
    ).map((i) => i.value);

    // --- Rating Filter ---
    const ratingInput = document.querySelector(
      '.filters input[name="rating"]:checked',
    );
    const minRating = ratingInput ? parseFloat(ratingInput.value) : 0;

    // --- Loop through all products ---
    let visibleCount = 0;

    productCards.forEach((card) => {
      const cardCategory = card.dataset.category;
      const cardSkin = card.dataset.skin;
      const cardBrand = card.dataset.brand;
      const cardPrice = parseInt(card.dataset.price);
      const cardRating = parseFloat(card.dataset.rating);

      let show = true;

      // Category filter
      if (categories.length > 0 && !categories.includes(cardCategory)) {
        show = false;
      }

      // Skin filter (sidebar)
      if (filterSkins.length > 0 && !filterSkins.includes(cardSkin)) {
        show = false;
      }

      // Skin filter (pills) — "all" ho to skip
      if (selectedSkin !== "all" && selectedSkin !== cardSkin) {
        show = false;
      }

      // Brand filter
      if (brands.length > 0 && !brands.includes(cardBrand)) {
        show = false;
      }

      // Price filter
      if (cardPrice > maxPrice) {
        show = false;
      }

      // Rating filter
      if (minRating > 0 && cardRating < minRating) {
        show = false;
      }

      // Show or Hide
      if (show) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // --- Update Result Count ---
    if (resultCount) {
      resultCount.textContent = `Showing ${visibleCount} product${visibleCount !== 1 ? "s" : ""}`;
    }

    console.log("Filters applied. Visible:", visibleCount);
  }

  /* ==================================================
     8. INITIAL SETUP — Show All Products
     ================================================== */
  if (resultCount) {
    resultCount.textContent = `Showing ${productCards.length} products`;
  }

  // Default: "All" pill active
  console.log("Ready! Default: All products visible.");
});

/* ==================================================
   COUNTDOWN TIMER
   ================================================== */

function startCountdown(elementId, totalSeconds) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let seconds = totalSeconds;
  updateDisplay(element, seconds);

  const interval = setInterval(() => {
    seconds--;
    updateDisplay(element, seconds);

    if (seconds <= 0) {
      clearInterval(interval);
      element.textContent = "00:00:00";
    }
  }, 1000);
}

function updateDisplay(element, seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  element.textContent =
    String(hrs).padStart(2, "0") +
    ":" +
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0");
}

/* ==================================================
   START BOTH TIMERS
   ================================================== */

startCountdown("timer1", 8076); // Card 1
startCountdown("timer2", 8076); // Card 2

document.querySelector(".shop-now")?.addEventListener("click", () => {
  document
    .getElementById("skin-selector")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".navbar");
  const toggle = navbar?.querySelector(".nav-menu-toggle");
  const menu = navbar?.querySelector(".nav-links");
  if (!navbar || !toggle || !menu) return;

  function setMenuOpen(isOpen) {
    navbar.classList.toggle("menu-open", isOpen);
    menu.hidden = !isOpen && window.matchMedia("(max-width: 900px)").matches;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
    toggle.innerHTML = `<i class="fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}" aria-hidden="true"></i>`;
  }

  setMenuOpen(false);
  toggle.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!navbar.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    setMenuOpen(false);
  });
});

/* ==================================================
   PRODUCT IMAGE GALLERY — Thumbnail Click Pe Change
   ================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const mainImg = document.querySelector(".main-img img");
  const thumbnails = document.querySelectorAll(".thumbnail-img .img");

  // Safety check
  if (!mainImg || thumbnails.length === 0) return;

  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      // 1. Sabhi thumbnails se active hatao
      thumbnails.forEach((t) => t.classList.remove("active"));

      // 2. Clicked pe active lagao
      thumb.classList.add("active");

      // 3. Nayi image ka source nikalo
      const newSrc = thumb.querySelector("img").src;

      // 4. Main image change karo (fade effect ke saath)
      mainImg.style.opacity = "0";

      setTimeout(() => {
        mainImg.src = newSrc;
        mainImg.style.opacity = "1";
      }, 200);
    });
  });
});
