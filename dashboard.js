document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const root = document.documentElement;
  const $ = (selector) => document.querySelector(selector);

  const pageContent = $("#pageContent");
  const navigation = $("#sidebarNavigation");
  const sidebar = $("#sidebar");
  const menuToggle = $("#menuToggle");
  const sidebarOverlay = $("#sidebarOverlay");

  const notificationToggle = $("#notificationToggle");
  const notificationPanel = $("#notificationPanel");
  const familyMenuToggle = $("#familyMenuToggle");
  const familyDetailsPanel = $("#familyDetailsPanel");

  const storageKeys = {
    theme: "little-rhythm-theme",
    direction: "little-rhythm-direction",
    profile: "little-rhythm-dashboard-profile",
    practice: "little-rhythm-dashboard-practice",
    notifications: "little-rhythm-dashboard-notifications"
  };

  let sessionEnded = false;
  let toastTimer;

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
      return true;
    } catch {
      return false;
    }
  }

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(readStorage(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }

  /* SAMPLE DATA */

  const defaultProfile = {
    name: "Avery Parker",
    email: "avery@example.com",
    child: "Jamie Parker",
    age: "8"
  };

  const storedProfile = readJSON(storageKeys.profile, null);

  let profile =
    storedProfile &&
    ["name", "email", "child", "age"].every(
      (key) => typeof storedProfile[key] === "string"
    ) &&
    storedProfile.name.trim() &&
    storedProfile.child.trim()
      ? storedProfile
      : { ...defaultProfile };

  const storedPractice = readJSON(storageKeys.practice, []);

  let completedPractice = Array.isArray(storedPractice)
    ? [...new Set(storedPractice)].filter(
        (value) => Number.isInteger(value) && value >= 0 && value < 3
      )
    : [];

  let notificationsUnread =
    readStorage(storageKeys.notifications) !== "read";

  const classes = [
    {
      day: "19",
      month: "OCT",
      date: "October 19, 2026",
      title: "Creative Dance",
      program: "Dance",
      time: "4:00–4:45 PM",
      teacher: "Sofia Bennett",
      location: "Studio A"
    },
    {
      day: "21",
      month: "OCT",
      date: "October 21, 2026",
      title: "Piano Explorers",
      program: "Music",
      time: "5:00–5:45 PM",
      teacher: "Maya Chen",
      location: "Music Room 2"
    },
    {
      day: "24",
      month: "OCT",
      date: "October 24, 2026",
      title: "Creative Dance",
      program: "Dance",
      time: "10:00–10:45 AM",
      teacher: "Sofia Bennett",
      location: "Studio A"
    }
  ];

  const invoices = [
    {
      id: "LR-1026",
      description: "October tuition",
      date: "October 1, 2026",
      amount: 120,
      status: "Paid"
    },
    {
      id: "LR-0926",
      description: "September tuition",
      date: "September 1, 2026",
      amount: 120,
      status: "Paid"
    },
    {
      id: "LR-0826",
      description: "August tuition",
      date: "August 1, 2026",
      amount: 120,
      status: "Paid"
    }
  ];

  const resources = [
    {
      icon: "♫",
      title: "Five-minute piano warm-up",
      description:
        "Explore a gentle warm-up with slow scales and a playful rhythm.",
      instructions: [
        "Sit comfortably with relaxed shoulders.",
        "Play C, D, E, F, G slowly with each hand.",
        "Repeat three times at a comfortable pace.",
        "Clap a rhythm, then play it using one note."
      ]
    },
    {
      icon: "✧",
      title: "Dance & balance game",
      description:
        "Build balance and confidence with a playful movement break.",
      instructions: [
        "Clear a safe space with a parent nearby.",
        "Stand tall and balance for five seconds.",
        "Take four soft steps, then freeze.",
        "Repeat to your favorite music. Stop if uncomfortable."
      ]
    },
    {
      icon: "☆",
      title: "Showcase preparation",
      description:
        "Help your little performer feel comfortable and ready for the stage.",
      instructions: [
        "Confirm rehearsal details with the academy.",
        "Pack water and labeled dance shoes.",
        "Practice a comfortable introduction.",
        "Arrive early and celebrate the effort."
      ]
    }
  ];

  const pages = {
    overview: {
      label: "Overview",
      title: "Parent Dashboard",
      description: ""
    },
    classes: {
      label: "My Classes",
      title: "My Classes",
      description:
        "A happy routine of movement, melody, and growing confidence."
    },
    progress: {
      label: "Learning Progress",
      title: "Learning Progress",
      description:
        "Celebrate the small steps that lead to big possibilities."
    },
    payments: {
      label: "Payments",
      title: "Payments & Invoices",
      description:
        "A clear view of your family’s academy payments."
    },
    resources: {
      label: "Resources",
      title: "Resource Center",
      description:
        "Small activities for a little rhythm at home."
    },
    profile: {
      label: "Family Profile",
      title: "Family Profile",
      description:
        "Keep your parent and learner details up to date."
    }
  };

  /* SHARED RENDER HELPERS */

  function metricCard(label, value, note) {
    return `
      <article class="card">
        <span class="stat-label">${label}</span>
        <strong class="stat-value">${value}</strong>
        <span class="stat-note">${note}</span>
      </article>
    `;
  }

  function upcomingClasses() {
    return classes.map((item) => `
      <article class="class-item">
        <div class="class-date">
          ${item.month}
          <strong>${item.day}</strong>
        </div>

        <div class="class-details">
          <strong>${item.title}</strong>
          <p>${item.time} · ${item.location}</p>
        </div>

        <span class="badge">${item.program}</span>
      </article>
    `).join("");
  }

  function skillProgress() {
    const skills = [
      ["Rhythm & timing", 80],
      ["Creative movement", 72],
      ["Piano foundations", 65]
    ];

    return skills.map(([name, value]) => `
      <div class="progress-item">
        <div class="progress-label">
          <span>${name}</span>
          <strong>${value}%</strong>
        </div>

        <progress
          value="${value}"
          max="100"
          aria-label="${name}: ${value}%"
        >
          ${value}%
        </progress>
      </div>
    `).join("");
  }

  function practiceChart() {
    return `
      <div
        class="practice-chart"
        role="img"
        aria-label="Sample weekly practice: September 28, 35 minutes; October 5, 50 minutes; October 12, 45 minutes; October 19, 60 minutes."
      >
        <div class="chart-column">
          <i style="height: 47%"></i>
          <span>Sep 28</span>
        </div>

        <div class="chart-column">
          <i style="height: 67%"></i>
          <span>Oct 5</span>
        </div>

        <div class="chart-column">
          <i style="height: 60%"></i>
          <span>Oct 12</span>
        </div>

        <div class="chart-column">
          <i style="height: 80%"></i>
          <span>Oct 19</span>
        </div>
      </div>
    `;
  }

  /* OVERVIEW */

  function overviewPage() {
    const practiceMinutes = 60 + completedPractice.length * 5;

    return `
      <div class="stats-grid">
        ${metricCard("Active programs", "2", "Dance + music")}
        ${metricCard("Attendance", "92%", "11 of 12 classes attended")}
        ${metricCard(
          "Practice this week",
          `${practiceMinutes} min`,
          "Keep the little rhythms going"
        )}
        ${metricCard("Next tuition", "$120", "Due November 1, 2026")}
      </div>

      <div class="content-grid">
        <section class="card feature-card">
          <p class="eyebrow">THE NEXT LITTLE MILESTONE</p>

          <h2>Big dreams start with little steps.</h2>

          <p>
            ${escapeHTML(profile.child)} is growing in confidence
            every week. Discover what’s coming up in dance and music.
          </p>

          <button
            class="button-primary"
            type="button"
            data-page="classes"
          >
            View class schedule ↗
          </button>
        </section>

        <section class="card">
          <div class="section-heading">
            <h2>Practice rhythm</h2>
            <span class="badge">Weekly minutes</span>
          </div>

          ${practiceChart()}
        </section>
      </div>

      <div class="content-grid">
        <section class="card">
          <div class="section-heading">
            <h2>Coming up next</h2>

            <button class="text-button" data-page="classes">
              All classes →
            </button>
          </div>

          ${upcomingClasses()}
        </section>

        <section class="card">
          <div class="section-heading">
            <h2>Growing with every beat</h2>

            <button class="text-button" data-page="progress">
              View progress →
            </button>
          </div>

          ${skillProgress()}

          <div class="note">
            “Jamie is finding a lovely sense of rhythm.
            Keep those short practice sessions playful!”

            <br>
            <strong>— Maya, piano instructor</strong>
          </div>
        </section>
      </div>
    `;
  }

  /* CLASSES */

  function classesPage() {
    return `
      <div class="filters">
        <label for="classSearch">
          Find a class

          <input
            id="classSearch"
            type="search"
            placeholder="Search class or teacher"
          >
        </label>

        <label for="programFilter">
          Program

          <select id="programFilter">
            <option value="all">All programs</option>
            <option value="Dance">Dance</option>
            <option value="Music">Music</option>
          </select>
        </label>
      </div>

      <section class="card">
        <div class="section-heading">
          <h2>Upcoming schedule</h2>
          <span class="badge">October 2026 · Academy local time</span>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Class</th>
                <th scope="col">Time</th>
                <th scope="col">Instructor</th>
                <th scope="col">Location</th>
              </tr>
            </thead>

            <tbody id="classTableBody"></tbody>
          </table>
        </div>

        <p class="empty-state" id="classEmptyState" hidden>
          No classes match your search.
        </p>
      </section>

      <div class="content-grid equal-grid" style="margin-top: 24px">
        <section class="card">
          <h2>Creative Dance</h2>
          <p>Age group 7–9 · Beginner</p>

          <p>
            Expressive movement, balance, and friendly group choreography.
            Bring a water bottle and comfortable dance shoes.
          </p>

          <span class="badge">Enrolled · Sofia Bennett</span>
        </section>

        <section class="card">
          <h2>Piano Explorers</h2>
          <p>Age group 7–10 · Foundation</p>

          <p>
            Discover melodies, note reading, and playful rhythm exercises.
            Bring your practice notebook.
          </p>

          <span class="badge">Enrolled · Maya Chen</span>
        </section>
      </div>
    `;
  }

  function filterClasses() {
    const query = $("#classSearch").value.trim().toLowerCase();
    const selectedProgram = $("#programFilter").value;

    const matchingClasses = classes.filter((item) => {
      const text = [
        item.title,
        item.teacher,
        item.location,
        item.program,
        item.date
      ].join(" ").toLowerCase();

      const programMatches =
        selectedProgram === "all" ||
        item.program === selectedProgram;

      return programMatches && text.includes(query);
    });

    $("#classTableBody").innerHTML = matchingClasses.map((item) => `
      <tr>
        <td>${item.date}</td>

        <td>
          <strong>${item.title}</strong>
          <small>${item.program}</small>
        </td>

        <td>${item.time}</td>
        <td>${item.teacher}</td>
        <td>${item.location}</td>
      </tr>
    `).join("");

    $("#classEmptyState").hidden = matchingClasses.length > 0;
  }

  /* LEARNING PROGRESS */

  function progressPage() {
    return `
      <div class="stats-grid">
        ${metricCard("Classes attended", "11 / 12", "Current term")}
        ${metricCard("Skills in progress", "3", "Personal learning plan")}
        ${metricCard("Milestones earned", "4", "Celebrate every step")}
        ${metricCard(
          "Practice activities",
          completedPractice.length,
          "Completed on this device"
        )}
      </div>

      <div class="content-grid equal-grid">
        <section class="card">
          <h2>Skill development</h2>

          ${skillProgress()}

          <p>
            Sample teacher assessments from October 16, 2026.
            Percentages describe progress through the current learning plan.
          </p>
        </section>

        <section class="card">
          <h2>A moment to celebrate</h2>

          <div class="resource-art" aria-hidden="true">☆</div>

          <h3>First melody, all on their own</h3>

          <p>
            Jamie played a four-bar melody independently in piano class
            on October 14.
          </p>

          <span class="badge badge-secondary">
            Confidence milestone
          </span>
        </section>
      </div>

      <section class="card">
        <h2>Teacher’s next steps</h2>

        <p>
          Practice a steady clap before each piano session.
          For dance, try balancing for five seconds on each foot.
          Five playful minutes is a great start.
        </p>

        <button
          class="button-primary"
          type="button"
          data-page="resources"
        >
          Open practice activities
        </button>
      </section>
    `;
  }

  /* PAYMENTS */

  function paymentsPage() {
    return `
      <div class="content-grid equal-grid">
        <section class="card feature-card">
          <p class="eyebrow">NEXT BILLING DATE</p>

          <h2>$120.00</h2>

          <p>
            November tuition · Due November 1, 2026
            <br>
            Creative Dance $65 + Piano Explorers $55
          </p>

          <span class="badge">No overdue balance</span>
        </section>

        <section class="card">
          <h2>Payment information</h2>

          <p>
            Sample payment history for this demo family.
            All amounts are illustrative USD values.
          </p>

          <p>
            Contact your academy office for payment methods or billing
            changes. Online payment processing is not connected.
          </p>
        </section>
      </div>

      <section class="card">
        <h2>Invoice history</h2>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Invoice</th>
                <th scope="col">Description</th>
                <th scope="col">Date</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Receipt</th>
              </tr>
            </thead>

            <tbody>
              ${invoices.map((invoice, index) => `
                <tr>
                  <td>${invoice.id}</td>
                  <td>${invoice.description}</td>
                  <td>${invoice.date}</td>
                  <td>$${invoice.amount.toFixed(2)}</td>

                  <td>
                    <span class="badge">${invoice.status}</span>
                  </td>

                  <td>
                    <button
                      class="text-button"
                      type="button"
                      data-invoice="${index}"
                      aria-label="Download sample invoice ${invoice.id}"
                    >
                      Download ↓
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  /* RESOURCES */

  function resourcesPage() {
    return `
      <div class="resources-grid">
        ${resources.map((resource, index) => {
          const completed = completedPractice.includes(index);

          return `
            <article class="card resource-card">
              <div class="resource-art" aria-hidden="true">
                ${resource.icon}
              </div>

              <h2>${resource.title}</h2>
              <p>${resource.description}</p>

              <button type="button" data-resource="${index}">
                Download activity ↓
              </button>

              <button
                class="text-button"
                type="button"
                data-practice="${index}"
                ${completed ? "disabled" : ""}
              >
                ${
                  completed
                    ? "✓ Practice completed"
                    : "Mark 5 minutes practiced"
                }
              </button>
            </article>
          `;
        }).join("")}
      </div>

      <section class="card">
        <h2>Winter showcase · Family notes</h2>

        <p>
          Rehearsals begin November 7. Families will receive their
          child’s rehearsal time from the academy.
          Please label belongings and bring water.
        </p>

        <div class="note">
          At-home activities work best with a parent nearby,
          a comfortable pace, and plenty of encouragement.
        </div>
      </section>
    `;
  }

  /* PROFILE */

  function getInitials() {
    return profile.name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function updateHeaderProfile() {
    $("#headerProfileName").textContent = profile.name;
    $("#headerAvatar").textContent = getInitials();
    $("#headerParentName").textContent = profile.name;
    $("#headerParentEmail").textContent = profile.email;
    $("#headerChildName").textContent = profile.child;
    $("#headerChildAge").textContent = profile.age;
  }

  function profilePage() {
    return `
      <div class="content-grid equal-grid">
        <section class="card">
          <h2>Parent & learner details</h2>

          <form class="profile-form" id="profileForm">
            <label for="parentName">
              Parent name

              <input
                id="parentName"
                name="name"
                type="text"
                maxlength="60"
                autocomplete="name"
                value="${escapeHTML(profile.name)}"
                required
              >
            </label>

            <label for="parentEmail">
              Email address

              <input
                id="parentEmail"
                name="email"
                type="email"
                maxlength="120"
                autocomplete="email"
                value="${escapeHTML(profile.email)}"
                required
              >
            </label>

            <label for="childName">
              Child’s name

              <input
                id="childName"
                name="child"
                type="text"
                maxlength="60"
                value="${escapeHTML(profile.child)}"
                required
              >
            </label>

            <label for="childAge">
              Child’s age

              <input
                id="childAge"
                name="age"
                type="number"
                min="3"
                max="16"
                value="${escapeHTML(profile.age)}"
                required
              >
            </label>

            <div class="button-row">
              <button class="button-primary" type="submit">
                Save changes
              </button>

              <span
                class="save-status"
                id="profileSaveStatus"
                role="status"
              ></span>
            </div>
          </form>
        </section>

        <section class="card profile-summary">
          <div class="avatar profile-avatar">
            ${escapeHTML(getInitials())}
          </div>

          <h2>${escapeHTML(profile.name)}</h2>

          <span class="badge">Parent account · Demo</span>

          <p>
            Manage one learner, two enrolled programs,
            and all the little milestones along the way.
          </p>

          <h3>Your privacy</h3>

          <p>
            This demo stores profile edits only in this browser.
            Use sample details here. No account service is connected.
          </p>
        </section>
      </div>
    `;
  }

  function bindProfileForm() {
    $("#profileForm").addEventListener("submit", (event) => {
      event.preventDefault();

      const values = Object.fromEntries(
        new FormData(event.currentTarget)
      );

      values.name = values.name.trim();
      values.child = values.child.trim();
      values.email = values.email.trim();

      if (!values.name || !values.child) {
        showToast("Please enter a name containing more than spaces.");
        return;
      }

      profile = values;

      const saved = writeStorage(
        storageKeys.profile,
        JSON.stringify(profile)
      );

      updateHeaderProfile();
      renderPage("profile");

      $("#profileSaveStatus").textContent = saved
        ? "Saved on this device."
        : "Updated for this visit. Browser storage is unavailable.";
    });
  }

  /* PAGE NAVIGATION */

  const pageRenderers = {
    overview: overviewPage,
    classes: classesPage,
    progress: progressPage,
    payments: paymentsPage,
    resources: resourcesPage,
    profile: profilePage
  };

  function renderPage(page) {
    if (sessionEnded) {
      return;
    }

    const selectedPage = Object.hasOwn(pages, page)
      ? page
      : "overview";

    const details = pages[selectedPage];

    $("#breadcrumbCurrent").textContent = details.label;
    $("#pageTitle").textContent = details.title;

    $("#pageDescription").textContent =
      selectedPage === "overview"
        ? `Welcome back, ${profile.name.trim().split(/\s+/)[0]}. A little progress, a whole lot to celebrate.`
        : details.description;

    navigation.querySelectorAll("[data-page]").forEach((button) => {
      const active = button.dataset.page === selectedPage;

      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    pageContent.innerHTML = pageRenderers[selectedPage]();

    if (selectedPage === "classes") {
      filterClasses();

      $("#classSearch").addEventListener("input", filterClasses);
      $("#programFilter").addEventListener("change", filterClasses);
    }

    if (selectedPage === "profile") {
      bindProfileForm();
    }

    closeSidebar();
    closeNotifications();
    closeFamilyDetails();
  }

  function navigateTo(page) {
    if (sessionEnded) {
      return;
    }

    if (window.location.hash.slice(1) !== page) {
      window.location.hash = page;
    } else {
      renderPage(page);
      $("#main").focus();
    }
  }

  window.addEventListener("hashchange", () => {
    renderPage(window.location.hash.slice(1));

    if (!sessionEnded) {
      $("#main").focus();
    }
  });

  /* DOWNLOADS */

  function downloadText(filename, content) {
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast("Your download is ready.");
  }

  function downloadInvoice(index) {
    const invoice = invoices[index];

    if (!invoice) {
      return;
    }

    const text = [
      "LITTLE RHYTHM — SAMPLE INVOICE",
      "Demo data. Not a financial document.",
      "",
      `Invoice: ${invoice.id}`,
      `Description: ${invoice.description}`,
      `Date: ${invoice.date}`,
      `Amount: $${invoice.amount.toFixed(2)} USD`,
      `Status: ${invoice.status}`,
      "",
      "Creative Dance: $65",
      "Piano Explorers: $55"
    ].join("\n");

    downloadText(`${invoice.id}-sample.txt`, text);
  }

  function downloadResource(index) {
    const resource = resources[index];

    if (!resource) {
      return;
    }

    const text = [
      "LITTLE RHYTHM",
      resource.title,
      "",
      ...resource.instructions.map(
        (instruction, number) => `${number + 1}. ${instruction}`
      )
    ].join("\n");

    downloadText(`little-rhythm-activity-${index + 1}.txt`, text);
  }

  /* CLICK ACTIONS */

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (sessionEnded) {
      return;
    }

    const pageButton = target.closest("[data-page]");

    if (pageButton) {
      navigateTo(pageButton.dataset.page);
    }

    const invoiceButton = target.closest("[data-invoice]");

    if (invoiceButton) {
      downloadInvoice(Number(invoiceButton.dataset.invoice));
    }

    const resourceButton = target.closest("[data-resource]");

    if (resourceButton) {
      downloadResource(Number(resourceButton.dataset.resource));
    }

    const practiceButton = target.closest("[data-practice]");

    if (practiceButton) {
      const index = Number(practiceButton.dataset.practice);

      if (resources[index] && !completedPractice.includes(index)) {
        completedPractice.push(index);

        const saved = writeStorage(
          storageKeys.practice,
          JSON.stringify(completedPractice)
        );

        renderPage("resources");

        showToast(
          saved
            ? "Great effort! Five minutes added to your demo practice total."
            : "Practice recorded for this visit. Browser storage is unavailable."
        );
      }
    }

    if (!target.closest(".notification-wrapper")) {
      closeNotifications();
    }

    if (!target.closest(".family-menu-wrapper")) {
      closeFamilyDetails();
    }
  });

  /* LIGHT / DARK */

  const systemTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  let themePreference = readStorage(storageKeys.theme);

  function applyTheme(theme) {
    const dark = theme === "dark";
    const label = dark
      ? "Switch to light mode"
      : "Switch to dark mode";

    root.dataset.theme = dark ? "dark" : "light";

    $("#themeToggle use").setAttribute(
      "href",
      dark ? "#sun" : "#moon"
    );
    $("#themeToggle").setAttribute("aria-label", label);
    $("#themeToggle").setAttribute("title", label);
  }

  applyTheme(
    ["light", "dark"].includes(themePreference)
      ? themePreference
      : systemTheme.matches
        ? "dark"
        : "light"
  );

  $("#themeToggle").addEventListener("click", () => {
    themePreference =
      root.dataset.theme === "dark" ? "light" : "dark";

    applyTheme(themePreference);
    writeStorage(storageKeys.theme, themePreference);
  });

  systemTheme.addEventListener("change", (event) => {
    if (!["light", "dark"].includes(themePreference)) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  /* RTL / LTR */

  function applyDirection(direction) {
    const rtl = direction === "rtl";

    root.dir = rtl ? "rtl" : "ltr";

    const label = rtl
      ? "Switch to left-to-right layout"
      : "Switch to right-to-left layout";

    $("#directionToggle").setAttribute("aria-label", label);
    $("#directionToggle").setAttribute("title", label);
    $("#directionToggle").setAttribute("aria-pressed", String(rtl));
  }

  applyDirection(
    readStorage(storageKeys.direction) === "rtl" ? "rtl" : "ltr"
  );

  $("#directionToggle").addEventListener("click", () => {
    const next = root.dir === "rtl" ? "ltr" : "rtl";

    applyDirection(next);
    writeStorage(storageKeys.direction, next);
  });

  /* MOBILE SIDEBAR */

  function closeSidebar(restoreFocus = false) {
    document.body.classList.remove("sidebar-open");
    sidebarOverlay.hidden = true;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open sidebar");

    if (restoreFocus) {
      menuToggle.focus();
    }
  }

  function openSidebar() {
    document.body.classList.add("sidebar-open");
    sidebarOverlay.hidden = false;

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close sidebar");

    sidebar.querySelector("a, button")?.focus();
  }

  menuToggle.addEventListener("click", () => {
    if (document.body.classList.contains("sidebar-open")) {
      closeSidebar(true);
    } else {
      openSidebar();
    }
  });

  sidebarOverlay.addEventListener("click", () => {
    closeSidebar(true);
  });

  window.matchMedia("(min-width: 761px)")
    .addEventListener("change", (event) => {
      if (event.matches) {
        closeSidebar();
      }
    });

  /* NOTIFICATIONS */

  function closeNotifications(restoreFocus = false) {
    notificationPanel.hidden = true;
    notificationToggle.setAttribute("aria-expanded", "false");

    if (restoreFocus) {
      notificationToggle.focus();
    }
  }

  function closeFamilyDetails(restoreFocus = false) {
    familyDetailsPanel.hidden = true;
    familyMenuToggle.setAttribute("aria-expanded", "false");

    if (restoreFocus) {
      familyMenuToggle.focus();
    }
  }

  familyMenuToggle.addEventListener("click", () => {
    const open = familyDetailsPanel.hidden;

    closeNotifications();
    familyDetailsPanel.hidden = !open;
    familyMenuToggle.setAttribute("aria-expanded", String(open));
  });

  function updateNotificationState() {
    $("#notificationDot").hidden = !notificationsUnread;

    $("#notificationCount").textContent =
      notificationsUnread ? "2 new" : "All read";

    notificationToggle.setAttribute(
      "aria-label",
      notificationsUnread
        ? "Notifications, 2 unread"
        : "Notifications, all read"
    );
  }

  notificationToggle.addEventListener("click", () => {
    const open = notificationPanel.hidden;

    closeFamilyDetails();
    notificationPanel.hidden = !open;
    notificationToggle.setAttribute("aria-expanded", String(open));
  });

  $("#markNotificationsRead").addEventListener("click", () => {
    notificationsUnread = false;

    writeStorage(storageKeys.notifications, "read");
    updateNotificationState();

    showToast("All notifications marked as read.");
  });

  /* KEYBOARD ACCESSIBILITY */

  document.addEventListener("keydown", (event) => {
    if (sessionEnded) {
      return;
    }

    if (event.key === "Escape") {
      if (!notificationPanel.hidden) {
        closeNotifications(true);
      }

      if (!familyDetailsPanel.hidden) {
        closeFamilyDetails(true);
      }

      if (document.body.classList.contains("sidebar-open")) {
        closeSidebar(true);
      }
    }

    if (
      event.key !== "Tab" ||
      !document.body.classList.contains("sidebar-open") ||
      $("#logoutDialog").open
    ) {
      return;
    }

    const focusable = [
      ...sidebar.querySelectorAll("a[href], button:not(:disabled)")
    ].filter((element) => element.getClientRects().length > 0);

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

  /* DEMO LOGOUT */

  const logoutDialog = $("#logoutDialog");

  $("#logoutButton").addEventListener("click", () => {
    logoutDialog.showModal();
  });

  $("#cancelLogout").addEventListener("click", () => {
    logoutDialog.close();
  });

  $("#confirmLogout").addEventListener("click", () => {
    logoutDialog.close();

    closeSidebar();
    closeNotifications();

    sessionEnded = true;

    document.querySelector(".dashboard-layout").innerHTML = `
      <main class="logged-out">
        <section class="card">
          <p class="eyebrow">LITTLE RHYTHM</p>

          <h1 tabindex="-1" id="loggedOutHeading">
            You’re logged out
          </h1>

          <p>
            Your demo session has ended.
            This static dashboard is not connected to an
            authentication service.
          </p>

          <button
            class="button-primary"
            id="restartDemo"
            type="button"
          >
            Return to demo dashboard
          </button>
        </section>
      </main>
    `;

    $("#restartDemo").addEventListener("click", () => {
      window.location.reload();
    });

    $("#loggedOutHeading").focus();
  });

  /* TOAST */

  function showToast(message) {
    const toast = $("#toast");

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.hidden = false;

    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 4500);
  }

  /* INITIALIZE */

  $("#year").textContent = new Date().getFullYear();

  updateHeaderProfile();
  updateNotificationState();

  renderPage(window.location.hash.slice(1) || "overview");
});