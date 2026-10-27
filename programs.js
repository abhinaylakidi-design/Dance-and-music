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

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const desktopMedia = window.matchMedia("(min-width: 1251px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const storageKeys = {
    theme: "little-rhythm-theme",
    direction: "little-rhythm-direction"
  };



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

    }
  }

  function setIcon(button, name) {
    button?.querySelector("use")?.setAttribute("href", `#${name}`);
  }



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
  let explicitTheme = ["light", "dark"].includes(savedTheme)
    ? savedTheme
    : null;

  applyTheme(explicitTheme || (systemTheme.matches ? "dark" : "light"));

  themeToggle?.addEventListener("click", () => {
    explicitTheme = root.dataset.theme === "dark" ? "light" : "dark";

    applyTheme(explicitTheme);
    writeStorage(storageKeys.theme, explicitTheme);
  });

  systemTheme.addEventListener("change", (event) => {
    if (!explicitTheme) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });



  function applyDirection(direction) {
    const isRTL = direction === "rtl";

    root.dir = isRTL ? "rtl" : "ltr";

    const label = isRTL
      ? "Switch to left-to-right layout"
      : "Switch to right-to-left layout";

    directionToggle?.setAttribute("aria-label", label);
    directionToggle?.setAttribute("title", label);
    directionToggle?.setAttribute("aria-pressed", String(isRTL));
  }

  applyDirection(
    readStorage(storageKeys.direction) === "rtl" ? "rtl" : "ltr"
  );

  directionToggle?.addEventListener("click", () => {
    const next = root.dir === "rtl" ? "ltr" : "rtl";

    applyDirection(next);
    writeStorage(storageKeys.direction, next);
  });



  function setDropdown(open, restoreFocus = false) {
    homeToggle?.setAttribute("aria-expanded", String(open));
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
    const open = homeToggle.getAttribute("aria-expanded") === "true";
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



  function setMenu(open, restoreFocus = false) {
    navigation?.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    menuToggle?.setAttribute("aria-expanded", String(open));
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

  setMenu(false);

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    setMenu(!open);
  });

  navigation?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenu(false);
    }
  });

  desktopMedia.addEventListener("change", (event) => {
    if (event.matches) {
      const focusWasInNavigation = navigation?.contains(document.activeElement);
      setMenu(false);

      if (focusWasInNavigation) {
        navigation?.querySelector('[aria-current="page"]')?.focus();
      }
    }
  });



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
      return element.getClientRects().length > 0 && !element.disabled;
    });

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });



  function pageName(url) {
    const path = new URL(url, window.location.href).pathname;
    return path.split("/").filter(Boolean).pop() || "index.html";
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

  if (["index.html", "home2.html"].includes(currentPage)) {
    homeGroup?.querySelector(".nav-link")?.classList.add("active");
  }



  const reveals = document.querySelectorAll(".reveal");
  let revealObserver = null;

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    root.classList.add("reveal-enabled");

    reveals.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      root.classList.remove("reveal-enabled");
      revealObserver?.disconnect();

      reveals.forEach((element) => {
        element.classList.add("is-visible");
      });
    }
  });



  const finder = document.getElementById("programFinder");
  const interestSelect = document.getElementById("interest");
  const ageSelect = document.getElementById("age");
  const finderResult = document.getElementById("finderResult");

  const programCards = [
    ...document.querySelectorAll("[data-category][data-min][data-max]")
  ];

  function filterPrograms() {
    const interest = interestSelect?.value || "all";
    const age = ageSelect?.value || "all";

    let lowerAge = 3;
    let upperAge = 16;

    if (age !== "all") {
      [lowerAge, upperAge] = age.split("-").map(Number);
    }

    let danceCount = 0;
    let musicCount = 0;

    programCards.forEach((card) => {
      const minAge = Number(card.dataset.min);
      const maxAge = Number(card.dataset.max);

      const categoryMatches =
        interest === "all" || card.dataset.category === interest;


      const ageMatches = minAge <= upperAge && maxAge >= lowerAge;
      const visible = categoryMatches && ageMatches;

      card.hidden = !visible;

      if (visible) {
        card.classList.add("is-visible");

        if (card.dataset.category === "dance") {
          danceCount += 1;
        } else {
          musicCount += 1;
        }
      }
    });

    const danceEmpty = document.getElementById("danceEmpty");
    const musicEmpty = document.getElementById("musicEmpty");

    if (danceEmpty) danceEmpty.hidden = danceCount > 0;
    if (musicEmpty) musicEmpty.hidden = musicCount > 0;

    const total = danceCount + musicCount;
    const ageDescription = age === "all"
      ? "ages 3–16"
      : `ages ${lowerAge}–${upperAge}`;

    if (finderResult) {
      finderResult.textContent =
        `${total} program${total === 1 ? "" : "s"} match ${ageDescription}: ` +
        `${danceCount} dance and ${musicCount} music. ` +
        "Some programs cover part of the selected age range; check each age label.";
    }
  }

  finder?.addEventListener("submit", (event) => {
    event.preventDefault();
    filterPrograms();
  });

  finder?.addEventListener("reset", () => {

    requestAnimationFrame(filterPrograms);
  });

  document.querySelectorAll(".age-shortcut").forEach((link) => {
    link.addEventListener("click", () => {
      if (ageSelect && interestSelect) {
        ageSelect.value = link.dataset.age;
        interestSelect.value = "all";
        filterPrograms();
      }
    });
  });



  function revealHashTarget() {
    if (!window.location.hash) return;

    let targetId;

    try {
      targetId = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }

    const target = document.getElementById(targetId);

    if (target?.matches("[data-category]") && target.hidden) {
      if (interestSelect) interestSelect.value = "all";
      if (ageSelect) ageSelect.value = "all";

      filterPrograms();
      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start"
      });
    }

    if (target?.classList.contains("reveal")) {
      target.classList.add("is-visible");
    }
  }

  window.addEventListener("hashchange", revealHashTarget);
  revealHashTarget();



  const fallbackImage =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg"
           width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#f0ebf8"/>
        <circle cx="400" cy="280" r="130"
                fill="none" stroke="#7350b5"
                stroke-width="2" opacity=".2"/>
        <text x="400" y="330" text-anchor="middle"
              font-size="150" fill="#7350b5"
              font-family="Georgia, serif">♫</text>
      </svg>
    `);

  document.querySelectorAll("img[data-fallback]").forEach((image) => {
    let replaced = false;

    function replaceImage() {
      if (replaced) return;

      replaced = true;

      image.classList.add("asset-fallback");
      image.removeAttribute("srcset");
      image.src = fallbackImage;
    }

    image.addEventListener("error", replaceImage, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      replaceImage();
    }
  });



  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
});