/* ==================================================
   CONCERN SELECTOR — Filter Products
   ================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const concernPills = document.querySelectorAll(".concern-pill");
  const productCards = document.querySelectorAll(".product-card");

  // Agar page pe concern selector nahi hai to skip
  if (concernPills.length === 0) return;

  let selectedConcern = "all";

  /* ==================================================
     PILL CLICK
     ================================================== */
  concernPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      // Active toggle
      concernPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");

      // Concern update
      selectedConcern = pill.dataset.concern;
      console.log("🎯 Selected concern:", selectedConcern);

      // Filter products
      filterProducts();
    });
  });

  /* ==================================================
     FILTER FUNCTION
     ================================================== */
  function filterProducts() {
    let visibleCount = 0;

    productCards.forEach((card) => {
      const cardConcern = card.dataset.concern || "";

      let show = true;

      // "all" ho to sab dikhao
      if (selectedConcern !== "all" && cardConcern !== selectedConcern) {
        show = false;
      }

      if (show) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Result count update
    const resultCount = document.getElementById("resultCount");
    if (resultCount) {
      resultCount.textContent = `Showing ${visibleCount} product${visibleCount !== 1 ? "s" : ""}`;
    }

    console.log("✅ Visible:", visibleCount);
  }
});

function getSkincareCart() {
  try {
    return JSON.parse(localStorage.getItem("glowmuse_cart")) || [];
  } catch (error) {
    return [];
  }
}

function getSkincareWishlist() {
  try {
    const wishlist =
      JSON.parse(localStorage.getItem("glowmuse_wishlist")) || [];
    return wishlist.map((item) =>
      typeof item === "string"
        ? { name: item, desc: "", price: "", image: "", qty: 1 }
        : item,
    );
  } catch (error) {
    return [];
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const cartBadge = document.getElementById("cartCount");
  const wishlistBadge = document.getElementById("wishlistCount");
  const overlay = document.createElement("div");
  overlay.className = "commerce-drawer-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="commerce-drawer" role="dialog" aria-modal="true" aria-labelledby="skincareDrawerTitle">
      <header class="commerce-drawer-header">
        <div>
          <p class="commerce-drawer-eyebrow">GLOWMUSE</p>
          <h2 id="skincareDrawerTitle"></h2>
        </div>
        <button class="commerce-drawer-close" type="button" aria-label="Close">&times;</button>
      </header>
      <div class="commerce-drawer-items"></div>
      <div class="commerce-profile-view" hidden></div>
      <footer class="commerce-drawer-footer"></footer>
    </section>`;
  document.body.appendChild(overlay);

  const title = overlay.querySelector("#skincareDrawerTitle");
  const itemsContainer = overlay.querySelector(".commerce-drawer-items");
  const profileView = overlay.querySelector(".commerce-profile-view");
  const footer = overlay.querySelector(".commerce-drawer-footer");
  let activeView = "cart";

  function updateBadges() {
    const cartTotal = getSkincareCart().reduce(
      (sum, item) => sum + (item.qty || 1),
      0,
    );
    const wishlistTotal = getSkincareWishlist().length;
    if (cartBadge) {
      cartBadge.textContent = String(cartTotal);
      cartBadge.classList.toggle("show", cartTotal > 0);
    }
    if (wishlistBadge) {
      wishlistBadge.textContent = String(wishlistTotal);
      wishlistBadge.classList.toggle("show", wishlistTotal > 0);
    }
  }

  function getProduct(card) {
    return {
      name: card.querySelector(".p-name")?.textContent.trim() || "Product",
      desc: card.querySelector(".p-desc")?.textContent.trim() || "",
      price: card.querySelector(".price")?.textContent.trim() || "₹0",
      mrp: card.querySelector(".mrp")?.textContent.trim() || "",
      image: card.querySelector(".card-img img")?.src || "",
      qty: 1,
    };
  }

  function renderProfile() {
    let profile = {};
    try {
      profile = JSON.parse(localStorage.getItem("glowmuse_profile")) || {};
    } catch (error) {
      profile = {};
    }
    profileView.innerHTML = `
      <div class="profile-intro">
        <div class="profile-avatar" aria-hidden="true"></div>
        <div><h3 class="profile-greeting"></h3><p>Personal details</p></div>
      </div>
      <form class="profile-form">
        <label for="skincareProfileName">Full name</label>
        <input id="skincareProfileName" name="name" type="text" autocomplete="name" required>
        <label for="skincareProfileEmail">Email address</label>
        <input id="skincareProfileEmail" name="email" type="email" autocomplete="email" required>
        <label for="skincareProfilePhone">Phone number</label>
        <input id="skincareProfilePhone" name="phone" type="tel" autocomplete="tel">
        <p class="profile-save-status" aria-live="polite"></p>
        <button class="profile-save-button" type="submit">Save Profile</button>
      </form>`;
    profileView.querySelector('[name="name"]').value = profile.name || "";
    profileView.querySelector('[name="email"]').value = profile.email || "";
    profileView.querySelector('[name="phone"]').value = profile.phone || "";
    profileView.querySelector(".profile-greeting").textContent = profile.name
      ? `Welcome, ${profile.name}`
      : "Welcome to GlowMuse";
    profileView.querySelector(".profile-avatar").textContent = profile.name
      ? profile.name.trim().charAt(0).toUpperCase()
      : "G";
  }

  function renderDrawer() {
    title.textContent =
      activeView === "cart"
        ? "Your Cart"
        : activeView === "wishlist"
          ? "Your Wishlist"
          : "Your Profile";
    itemsContainer.hidden = activeView === "profile";
    profileView.hidden = activeView !== "profile";
    footer.hidden = activeView === "profile";
    itemsContainer.replaceChildren();
    footer.replaceChildren();

    if (activeView === "profile") {
      renderProfile();
      return;
    }

    const products =
      activeView === "cart" ? getSkincareCart() : getSkincareWishlist();
    if (!products.length) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "commerce-empty-state";
      emptyMessage.textContent =
        activeView === "cart"
          ? "Your cart is empty. Add a product to see it here."
          : "Your wishlist is empty. Save a product with the heart button.";
      itemsContainer.appendChild(emptyMessage);
    }

    products.forEach((product) => {
      const row = document.createElement("article");
      row.className = "commerce-item";
      const image = document.createElement("img");
      image.className = "commerce-item-image";
      image.src = product.image || "";
      image.alt = product.name;
      const info = document.createElement("div");
      info.className = "commerce-item-info";
      const name = document.createElement("h3");
      name.textContent = product.name;
      const description = document.createElement("p");
      description.textContent = product.desc || "";
      const price = document.createElement("strong");
      price.textContent = product.price || "";
      info.append(name, description, price);
      const actions = document.createElement("div");
      actions.className = "commerce-item-actions";

      if (activeView === "cart") {
        ["decrease", "increase"].forEach((action) => {
          const control = document.createElement("button");
          control.type = "button";
          control.dataset.action = action;
          control.dataset.name = product.name;
          control.textContent = action === "increase" ? "+" : "−";
          control.setAttribute(
            "aria-label",
            `${action === "increase" ? "Increase" : "Decrease"} ${product.name} quantity`,
          );
          if (action === "increase") {
            const quantity = document.createElement("span");
            quantity.textContent = String(product.qty || 1);
            actions.append(actions.firstChild, quantity, control);
          } else {
            actions.appendChild(control);
          }
        });
      }

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "commerce-item-remove";
      remove.dataset.action = "remove";
      remove.dataset.name = product.name;
      remove.textContent = "Remove";
      actions.appendChild(remove);
      row.append(image, info, actions);
      itemsContainer.appendChild(row);
    });

    if (activeView === "cart" && products.length) {
      const subtotal = products.reduce((sum, product) => {
        const amount =
          Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 0;
        return sum + amount * (product.qty || 1);
      }, 0);
      const label = document.createElement("span");
      label.textContent = "Subtotal";
      const amount = document.createElement("strong");
      amount.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
      footer.append(label, amount);
    }
  }

  function openDrawer(view) {
    activeView = view;
    renderDrawer();
    overlay.hidden = false;
    document.body.classList.add("commerce-drawer-open");
    overlay.querySelector(".commerce-drawer-close").focus();
  }

  function closeDrawer() {
    overlay.hidden = true;
    document.body.classList.remove("commerce-drawer-open");
  }

  document.querySelectorAll(".add-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      if (!card) return;
      const product = getProduct(card);
      const cart = getSkincareCart();
      const existing = cart.find((item) => item.name === product.name);
      if (existing) existing.qty = (existing.qty || 1) + 1;
      else cart.push(product);
      localStorage.setItem("glowmuse_cart", JSON.stringify(cart));
      updateBadges();
      if (!overlay.hidden && activeView === "cart") renderDrawer();
      const originalText = button.textContent;
      button.textContent = "✓ Added!";
      setTimeout(() => (button.textContent = originalText), 1500);
    });
  });

  document.querySelectorAll(".wishlist").forEach((button) => {
    const card = button.closest(".product-card");
    if (!card) return;
    const product = getProduct(card);
    const updateHeart = () => {
      const saved = getSkincareWishlist().some(
        (item) => item.name === product.name,
      );
      button.classList.toggle("active", saved);
      button.innerHTML = saved
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';
    };
    updateHeart();
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const wishlist = getSkincareWishlist();
      const index = wishlist.findIndex((item) => item.name === product.name);
      if (index >= 0) wishlist.splice(index, 1);
      else wishlist.push(product);
      localStorage.setItem("glowmuse_wishlist", JSON.stringify(wishlist));
      updateBadges();
      updateHeart();
      if (!overlay.hidden && activeView === "wishlist") renderDrawer();
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
  overlay
    .querySelector(".commerce-drawer-close")
    .addEventListener("click", closeDrawer);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeDrawer();
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const name = button.dataset.name;
    if (activeView === "cart") {
      const cart = getSkincareCart();
      const index = cart.findIndex((item) => item.name === name);
      if (index < 0) return;
      if (button.dataset.action === "remove") cart.splice(index, 1);
      if (button.dataset.action === "increase")
        cart[index].qty = (cart[index].qty || 1) + 1;
      if (button.dataset.action === "decrease") {
        cart[index].qty = (cart[index].qty || 1) - 1;
        if (cart[index].qty <= 0) cart.splice(index, 1);
      }
      localStorage.setItem("glowmuse_cart", JSON.stringify(cart));
    } else {
      const wishlist = getSkincareWishlist().filter(
        (item) => item.name !== name,
      );
      localStorage.setItem("glowmuse_wishlist", JSON.stringify(wishlist));
      document.querySelectorAll(".wishlist").forEach((heart) => {
        if (
          heart
            .closest(".product-card")
            ?.querySelector(".p-name")
            ?.textContent.trim() === name
        ) {
          heart.classList.remove("active");
          heart.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }
      });
    }
    updateBadges();
    renderDrawer();
  });

  overlay.addEventListener("submit", (event) => {
    if (!event.target.matches(".profile-form")) return;
    event.preventDefault();
    const formData = new FormData(event.target);
    const profile = {
      name: String(formData.get("name")).trim(),
      email: String(formData.get("email")).trim(),
      phone: String(formData.get("phone")).trim(),
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
    if (event.key === "Escape" && !overlay.hidden) closeDrawer();
  });
  updateBadges();
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
