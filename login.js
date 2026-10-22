document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const root = document.documentElement;

  const themeToggle = document.getElementById("themeToggle");
  const directionToggle = document.getElementById("directionToggle");

  const form = document.getElementById("authForm");
  const status = document.getElementById("formStatus");

  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  const systemTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

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
      // Controls still work when storage is unavailable.
    }
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
    const next = root.dataset.theme === "dark"
      ? "light"
      : "dark";

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

  /* PASSWORD VISIBILITY */

  document.querySelectorAll("[data-password]").forEach((button) => {
    const input = document.getElementById(button.dataset.password);

    if (!input) return;

    button.addEventListener("click", () => {
      const showPassword = input.type === "password";

      input.type = showPassword ? "text" : "password";

      const label = showPassword
        ? "Hide password"
        : "Show password";

      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      button.setAttribute("aria-pressed", String(showPassword));
    });
  });

  /* SIGN-UP VALIDATION */

  function validatePasswords() {
    if (!password || !confirmPassword) return;

    const mismatch =
      confirmPassword.value !== "" &&
      confirmPassword.value !== password.value;

    confirmPassword.setCustomValidity(
      mismatch ? "Your passwords do not match." : ""
    );
  }

  password?.addEventListener("input", validatePasswords);
  confirmPassword?.addEventListener("input", validatePasswords);

  const fullName = document.getElementById("fullName");

  fullName?.addEventListener("input", () => {
    fullName.setCustomValidity(
      fullName.value.trim()
        ? ""
        : "Please enter your full name."
    );
  });

  /* FORM SUBMISSION */

  form?.addEventListener("input", () => {
    status.textContent = "";
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (fullName) {
      fullName.setCustomValidity(
        fullName.value.trim()
          ? ""
          : "Please enter your full name."
      );
    }

    validatePasswords();

    if (!form.reportValidity()) return;

    // Replace this message with your authentication API request.
    // Never save passwords in localStorage.

    status.textContent = form.hasAttribute("data-signup")
      ? "Sign-up is not connected yet. No account has been created."
      : "Sign-in is not connected yet. Please connect your authentication service.";
  });

  /* GOOGLE / APPLE */

  document.querySelectorAll("[data-provider]").forEach((button) => {
    button.addEventListener("click", () => {
      const provider = button.dataset.provider;

      // Connect your provider's OAuth flow here.

      status.textContent =
        `${provider} authentication is not connected yet.`;
    });
  });

  /* PASSWORD RECOVERY */

  document.getElementById("forgotPassword")?.addEventListener(
    "click",
    () => {
      status.textContent =
        "Password recovery is not connected yet. Please contact the academy for help.";
    }
  );
});