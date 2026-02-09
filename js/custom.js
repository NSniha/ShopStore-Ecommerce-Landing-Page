(function () {
  const body = document.body;
  const openBtn = document.getElementById("ssOpenMenu");
  const closeBtn = document.getElementById("ssCloseMenu");
  const overlay = document.getElementById("ssOverlay");

  const setExpanded = (val) => {
    if (openBtn) openBtn.setAttribute("aria-expanded", String(val));
  };

  const openMenu = () => {
    body.classList.add("ss-menuOpen");
    setExpanded(true);
  };

  const closeMenu = () => {
    body.classList.remove("ss-menuOpen");
    setExpanded(false);
  };

  if (openBtn) openBtn.addEventListener("click", () => {
    const isOpen = body.classList.contains("ss-menuOpen");
    isOpen ? closeMenu() : openMenu();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();

// Second section: category row smoother horizontal scroll (mouse wheel -> horizontal)
(function () {
  const cats = document.getElementById("ss2Cats");
  if (!cats) return;

  cats.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        cats.scrollLeft += e.deltaY * 1.1;
      }
    },
    { passive: false }
  );
})();

(function () {
  // ====== Helpers ======
  const pad2 = (n) => String(n).padStart(2, "0");

  // Header badges (your header markup)
  const wishlistBadge = document.querySelector(
    '.ss-actions a[aria-label="Wishlist"] .ss-badge'
  );
  const cartBadge = document.querySelector(
    '.ss-actions a[aria-label="Your Cart"] .ss-badge'
  );

  const getCount = (el) => (el ? parseInt(el.textContent || "0", 10) || 0 : 0);
  const setCount = (el, val) => {
    if (!el) return;
    el.textContent = String(Math.max(0, val));
  };

  let wishlistCount = getCount(wishlistBadge);
  let cartCount = getCount(cartBadge);

  // ====== Timer (DD HH MM : SS) for section 3 timers ======
  const timers = document.querySelectorAll(".ep3-timer");

  function parseEndDate(endStr) {
    if (!endStr) return null;

    // "YYYY-MM-DD" -> end of day local
    if (/^\d{4}-\d{2}-\d{2}$/.test(endStr)) {
      return new Date(endStr + "T23:59:59");
    }

    const d = new Date(endStr);
    if (!isNaN(d.getTime())) return d;

    const d2 = new Date(endStr.replace(" ", "T"));
    if (!isNaN(d2.getTime())) return d2;

    return null;
  }

  function updateTimer(timerEl) {
    const endStr = timerEl.getAttribute("data-end");
    const end = parseEndDate(endStr);
    if (!end) return;

    const now = new Date();
    let diffMs = end.getTime() - now.getTime();
    if (diffMs < 0) diffMs = 0;

    const totalSec = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600); // 0-23
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const dEl = timerEl.querySelector('[data-t="d"]');
    const hEl = timerEl.querySelector('[data-t="h"]');
    const mEl = timerEl.querySelector('[data-t="m"]');
    const sEl = timerEl.querySelector('[data-t="s"]');

    if (dEl) dEl.textContent = String(days).padStart(2, "0");
    if (hEl) hEl.textContent = pad2(hours);
    if (mEl) mEl.textContent = pad2(mins);
    if (sEl) sEl.textContent = pad2(secs);
  }

  function tickTimers() {
    timers.forEach(updateTimer);
  }
  tickTimers();
  setInterval(tickTimers, 1000);

  // ====== GLOBAL Wishlist + Cart click handling (Section 3 + Section 5 + future) ======
  // Wishlist buttons supported:
  // - .ep3-wish (section 3)
  // - .ss5-wish (section 5)
  //
  // Add-to-cart supported:
  // - .ep3-cartBtn (section 3)
  // - .ep3-fab (section 3)
  // - .ss5-fab (section 5)
  //
  // Optional: if later you add .add-to-cart class, it will work too.
  const WISH_SELECTORS = [".ep3-wish", ".ss5-wish", ".js-wishlist"];
  const CART_SELECTORS = [".ep3-cartBtn", ".ep3-fab", ".ss5-fab", ".js-addcart"];

  function closestBySelectors(target, selectors) {
    for (const sel of selectors) {
      const found = target.closest(sel);
      if (found) return found;
    }
    return null;
  }

  function setHeartIcon(btn, active) {
    const icon = btn.querySelector("ion-icon");
    if (!icon) return;
    icon.setAttribute("name", active ? "heart" : "heart-outline");
  }

  document.addEventListener("click", function (e) {
    const wishBtn = closestBySelectors(e.target, WISH_SELECTORS);
    const cartBtn = closestBySelectors(e.target, CART_SELECTORS);

    // ✅ Wishlist toggle (works everywhere)
    if (wishBtn) {
      e.preventDefault();

      const isActive = wishBtn.classList.toggle("is-active");
      setHeartIcon(wishBtn, isActive);

      wishlistCount += isActive ? 1 : -1;
      wishlistCount = Math.max(0, wishlistCount);
      setCount(wishlistBadge, wishlistCount);
      return;
    }

    // ✅ Add to cart (works everywhere)
    if (cartBtn) {
      e.preventDefault();

      cartCount += 1;
      setCount(cartBadge, cartCount);

      cartBtn.classList.add("is-added");
      setTimeout(() => cartBtn.classList.remove("is-added"), 300);
      return;
    }
  });
})();



(function () {
  const form = document.getElementById("ssfSubscribeForm");
  const input = document.getElementById("ssfEmail");
  const msg = document.getElementById("ssfMsg");

  if (!form || !input || !msg) return;

  const setMsg = (text, type) => {
    msg.textContent = text;
    msg.classList.remove("is-ok", "is-bad");
    if (type) msg.classList.add(type);
  };

  const isValidEmail = (email) => {
    // simple, safe validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = input.value.trim();

    if (!email) {
      setMsg("Please enter your email address.", "is-bad");
      input.focus();
      return;
    }

    if (!isValidEmail(email)) {
      setMsg("Please enter a valid email address.", "is-bad");
      input.focus();
      return;
    }

    // Demo success (you can replace with API call)
    setMsg("Thanks! You’ve been subscribed successfully.", "is-ok");
    form.reset();

    // auto clear message
    setTimeout(() => setMsg("", ""), 3000);
  });
})();
