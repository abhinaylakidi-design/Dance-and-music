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
      // Controls remain usable without storage.
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
    const saved = readStorage(storageKeys.theme);

    if (!["light", "dark"].includes(saved)) {
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

  /* HOME DROPDOWN */

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
    setDropdown(
      homeToggle.getAttribute("aria-expanded") !== "true"
    );
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
    setMenu(
      menuToggle.getAttribute("aria-expanded") !== "true"
    );
  });

  navigation?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
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
        !element.disabled &&
        element.tabIndex >= 0
      );
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

  /* ACTIVE NAVIGATION */

  function pageName(url) {
    return (
      new URL(url, window.location.href)
        .pathname.split("/")
        .filter(Boolean)
        .pop() || "index.html"
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

  if (["index.html", "home2.html"].includes(currentPage)) {
    homeGroup?.querySelector(".nav-link")?.classList.add("active");
  }

  /* SECTION REVEALS */

  const reveals = document.querySelectorAll(".reveal");
  let revealObserver;

  if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
  ) {
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
    }
  });

  /* ACCESSIBLE DISCOVERY TABS */

  const tabList = document.querySelector(".discovery-tabs");
  const tabs = [...document.querySelectorAll(".discovery-tab")];

  function activateTab(selectedTab, focus = false) {
    tabs.forEach((tab) => {
      const active = tab === selectedTab;
      const panel = document.getElementById(
        tab.getAttribute("aria-controls")
      );

      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;

      if (panel) {
        panel.hidden = !active;
      }
    });

    if (focus) {
      selectedTab.focus();
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(tab);
    });
  });

  tabList?.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(document.activeElement);

    if (index === -1) {
      return;
    }

    let nextIndex = index;
    const forward = root.dir === "rtl" ? -1 : 1;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + forward + tabs.length) % tabs.length;
        break;

      case "ArrowLeft":
        nextIndex = (index - forward + tabs.length) % tabs.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = tabs.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();
    activateTab(tabs[nextIndex], true);
  });

  /* RHYTHM PLAYGROUND */

  let audioContext;
  const padTimers = new WeakMap();
  const soundStatus = document.getElementById("soundStatus");

  const toneSettings = {
    clap: {
      frequency: 900,
      endFrequency: 180,
      duration: 0.08,
      type: "triangle",
      label: "Clap"
    },
    tap: {
      frequency: 150,
      endFrequency: 65,
      duration: 0.15,
      type: "sine",
      label: "Tap"
    },
    pop: {
      frequency: 520,
      endFrequency: 200,
      duration: 0.1,
      type: "sine",
      label: "Pop"
    },
    chime: {
      frequency: 1046.5,
      endFrequency: 1046.5,
      duration: 0.65,
      type: "sine",
      label: "Chime"
    }
  };

  async function playTone(name) {
    const settings = toneSettings[name];
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!settings || !AudioContextClass) {
      throw new Error("Audio unavailable");
    }

    if (!audioContext || audioContext.state === "closed") {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (audioContext.state !== "running") {
      throw new Error("Audio unavailable");
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = settings.type;
    oscillator.frequency.setValueAtTime(settings.frequency, now);

    oscillator.frequency.exponentialRampToValueAtTime(
      settings.endFrequency,
      now + settings.duration
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + settings.duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      gain.disconnect();
    });

    oscillator.start(now);
    oscillator.stop(now + settings.duration + 0.03);
  }

  document.querySelectorAll(".rhythm-pad").forEach((pad) => {
    pad.addEventListener("click", async () => {
      const tone = pad.dataset.tone;
      const label = toneSettings[tone]?.label || "Sound";

      window.clearTimeout(padTimers.get(pad));
      pad.classList.add("is-playing");

      padTimers.set(
        pad,
        window.setTimeout(() => {
          pad.classList.remove("is-playing");
        }, 180)
      );

      try {
        await playTone(tone);

        if (soundStatus) {
          soundStatus.textContent = `${label}! What comes next?`;
        }
      } catch {
        if (soundStatus) {
          soundStatus.textContent =
            "Sound is unavailable in this browser. Try clapping the pattern together.";
        }
      }
    });
  });

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
          font-family="Georgia,serif"
        >♫</text>
      </svg>
    `);

  document.querySelectorAll("img[data-fallback]").forEach((image) => {
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

    image.addEventListener("error", replaceImage, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      replaceImage();
    }
  });

  /* FOOTER YEAR */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
});