document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const root = document.documentElement;

  const themeToggle = document.getElementById("themeToggle");
  const directionToggle = document.getElementById("directionToggle");
  const menuToggle = document.getElementById("menuToggle");

  const navigation = document.getElementById("navigation");
  const homeToggle = document.getElementById("homeToggle");
  const homeDropdown = document.getElementById("homeDropdown");
  const homeGroup = document.querySelector(".home-group");

  const systemTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  const desktopMedia = window.matchMedia(
    "(min-width: 1251px)"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const storageKeys = {
    theme: "little-rhythm-theme",
    direction: "little-rhythm-direction"
  };

  /* STORAGE */

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Preferences still work when browser storage is unavailable.
    }
  }

  function setIcon(button, name) {
    button
      ?.querySelector("use")
      ?.setAttribute("href", `#${name}`);
  }

  /* LIGHT / DARK MODE */

  function applyTheme(theme) {
    const isDark = theme === "dark";

    root.dataset.theme = isDark ? "dark" : "light";

    const label = isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

    themeToggle?.setAttribute("aria-label", label);
    themeToggle?.setAttribute("title", label);

    setIcon(themeToggle, isDark ? "sun" : "moon");
  }

  const savedTheme = readStorage(storageKeys.theme);

  applyTheme(
    ["light", "dark"].includes(savedTheme)
      ? savedTheme
      : systemTheme.matches
        ? "dark"
        : "light"
  );

  themeToggle?.addEventListener("click", () => {
    const next =
      root.dataset.theme === "dark" ? "light" : "dark";

    applyTheme(next);
    writeStorage(storageKeys.theme, next);
  });

  systemTheme.addEventListener("change", (event) => {
    const preference = readStorage(storageKeys.theme);

    if (!["light", "dark"].includes(preference)) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  /* RTL / LTR */

  function applyDirection(direction) {
    const isRTL = direction === "rtl";

    root.dir = isRTL ? "rtl" : "ltr";

    const label = isRTL
      ? "Switch to left-to-right layout"
      : "Switch to right-to-left layout";

    directionToggle?.setAttribute("aria-label", label);
    directionToggle?.setAttribute("title", label);
    directionToggle?.setAttribute(
      "aria-pressed",
      String(isRTL)
    );
  }

  applyDirection(
    readStorage(storageKeys.direction) === "rtl"
      ? "rtl"
      : "ltr"
  );

  directionToggle?.addEventListener("click", () => {
    const next = root.dir === "rtl" ? "ltr" : "rtl";

    applyDirection(next);
    writeStorage(storageKeys.direction, next);
  });

  /* HOME DROPDOWN */

  function setDropdown(open, restoreFocus = false) {
    homeToggle?.setAttribute(
      "aria-expanded",
      String(open)
    );

    homeToggle?.setAttribute(
      "aria-label",
      open ? "Hide home pages" : "Show home pages"
    );

    if (homeDropdown) {
      homeDropdown.hidden = !open;
    }

    if (restoreFocus) {
      homeToggle?.focus();
    }
  }

  setDropdown(false);

  homeToggle?.addEventListener("click", () => {
    const open =
      homeToggle.getAttribute("aria-expanded") === "true";

    setDropdown(!open);
  });

  homeToggle?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setDropdown(true);
      homeDropdown?.querySelector("a")?.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!homeGroup?.contains(event.target)) {
      setDropdown(false);
    }
  });

  homeGroup?.addEventListener("focusout", (event) => {
    if (!homeGroup.contains(event.relatedTarget)) {
      setDropdown(false);
    }
  });

  /* MOBILE NAVIGATION */

  function setMenu(open, restoreFocus = false) {
    navigation?.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    menuToggle?.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuToggle?.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    setIcon(menuToggle, open ? "close" : "menu");

    if (open) {
      navigation?.querySelector("a")?.focus();
    } else {
      setDropdown(false);

      if (restoreFocus) {
        menuToggle?.focus();
      }
    }
  }

  menuToggle?.addEventListener("click", () => {
    const open =
      menuToggle.getAttribute("aria-expanded") === "true";

    setMenu(!open);
  });

  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenu(false);
    }
  });

  desktopMedia.addEventListener("change", (event) => {
    if (event.matches) {
      setMenu(false);
    }
  });

  /* ESCAPE & FOCUS MANAGEMENT */

  document.addEventListener("keydown", (event) => {
    const dropdownOpen =
      homeToggle?.getAttribute("aria-expanded") === "true";

    const menuOpen =
      menuToggle?.getAttribute("aria-expanded") === "true";

    if (event.key === "Escape") {
      if (dropdownOpen) {
        setDropdown(false, true);
      } else if (menuOpen) {
        setMenu(false, true);
      }

      return;
    }

    if (event.key !== "Tab" || !menuOpen) {
      return;
    }

    const focusable = [
      ...document.querySelectorAll(
        ".header-inner a, .header-inner button"
      )
    ].filter((element) => {
      return (
        element.getClientRects().length > 0 &&
        !element.disabled
      );
    });

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first?.focus();
    }
  });

  /* ACTIVE NAVIGATION */

  function pageName(url) {
    const path = new URL(
      url,
      window.location.href
    ).pathname;

    return (
      path.split("/").filter(Boolean).pop() ||
      "index.html"
    );
  }

  const currentPage = pageName(window.location.href);

  navigation?.querySelectorAll("a").forEach((link) => {
    const active = pageName(link.href) === currentPage;

    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (
    ["index.html", "home2.html"].includes(currentPage)
  ) {
    homeGroup
      ?.querySelector(".nav-link")
      ?.classList.add("active");
  }

  /* SECTION REVEAL ANIMATIONS */

  const reveals = document.querySelectorAll(".reveal");

  if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08
      }
    );

    root.classList.add("reveal-enabled");

    reveals.forEach((element) => {
      observer.observe(element);
    });

    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) {
        root.classList.remove("reveal-enabled");
        observer.disconnect();
      }
    });
  }

  /* IMAGE FALLBACK */

  const fallbackImage =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="800"
        height="600"
        viewBox="0 0 800 600"
      >
        <rect width="800" height="600" fill="#f0ebf8"/>
        <circle
          cx="400"
          cy="280"
          r="130"
          fill="none"
          stroke="#7350b5"
          stroke-width="2"
          opacity=".2"
        />
        <text
          x="400"
          y="330"
          text-anchor="middle"
          font-size="150"
          fill="#7350b5"
          font-family="Georgia, serif"
        >♫</text>
      </svg>
    `);

  document
    .querySelectorAll("img[data-fallback]")
    .forEach((image) => {
      let replaced = false;

      function replaceImage() {
        if (replaced) {
          return;
        }

        replaced = true;

        image.classList.add("asset-fallback");
        image.removeAttribute("srcset");
        image.src = fallbackImage;
      }

      image.addEventListener(
        "error",
        replaceImage,
        { once: true }
      );

      if (
        image.complete &&
        image.naturalWidth === 0
      ) {
        replaceImage();
      }
    });

  /* FOOTER YEAR */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
});