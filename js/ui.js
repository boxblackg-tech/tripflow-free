import { renderDashboardPage } from "./pages/dashboardPage.js";
import { renderDiscoveryPage } from "./pages/discoveryPage.js";
import { renderEditorPage } from "./pages/editorPage.js";
import { renderLoginPage } from "./pages/loginPage.js";
import { renderMemoryPage } from "./pages/memoryPage.js";

export function renderApp(state) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="app-shell">
      ${renderLoginPage(state)}
      ${renderDashboardPage(state)}
      ${renderEditorPage(state)}
      ${renderDiscoveryPage(state)}
      ${renderMemoryPage(state)}

      <button class="fab ${state.user && state.currentPage === "dashboard" ? "" : "hidden"}" type="button" data-action="new-trip">+</button>

      <nav class="nav ${state.user ? "" : "hidden"}">
        ${[
          ["dashboard", "Trips", "Home"],
          ["discovery", "Map", "Map"],
          ["memory", "Memory", "Star"],
          ["editor", "Editor", "Edit"]
        ]
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
