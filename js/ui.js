import { renderDashboardPage } from "./pages/dashboardHomePage.js";
import { renderDiscoveryPage } from "./pages/discoveryPage.js";
import { renderEditorPage } from "./pages/editorPage.js";
import { renderLoginPage } from "./pages/loginPage.js";
import { renderMemoryPage } from "./pages/memoryPage.js";

export function renderApp(state) {
  const app = document.getElementById("app");
  const navItems = [
    ["dashboard", state.t("nav_trips"), "Home"],
    ["discovery", state.t("nav_map"), "Map"],
    ["memory", state.t("nav_memory"), "Star"],
    ["editor", state.t("nav_editor"), "Edit"]
  ];

  app.innerHTML = `
    <div class="app-shell">
      <div class="lang-switch ${state.user ? "" : "login-mode"}">
        <div class="lang-switch-group">
          <button class="lang-button ${state.lang === "en" ? "active" : ""}" type="button" data-lang="en">${state.t("lang_en")}</button>
          <button class="lang-button ${state.lang === "th" ? "active" : ""}" type="button" data-lang="th">${state.t("lang_th")}</button>
        </div>
      </div>

      ${renderLoginPage(state)}
      ${renderDashboardPage(state)}
      ${renderEditorPage(state)}
      ${renderDiscoveryPage(state)}
      ${renderMemoryPage(state)}

      <button class="fab ${state.user && state.currentPage === "dashboard" ? "" : "hidden"}" type="button" data-action="new-trip">+</button>

      <nav class="nav ${state.user ? "" : "hidden"}">
        ${navItems
          .map(
            ([page, label, icon]) => `
            <button class="nav-button ${state.currentPage === page ? "active" : ""}" type="button" data-page="${page}">
              <span>${icon}</span>
              <span>${label}</span>
            </button>
          `
          )
          .join("")}
      </nav>
    </div>
  `;
}
