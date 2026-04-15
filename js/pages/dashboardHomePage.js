import { escapeHtml, formatTripRange, getCoverLabel } from "../utils.js";

export function renderDashboardPage(state) {
  const trips = state.filteredTrips || [];
  const categories = ["All"].concat(state.config.categories);

  return `
    <section class="screen dashboard-screen ${state.currentPage === "dashboard" ? "active" : ""}" data-screen="dashboard">
      <div class="dashboard-content">
        <div class="top-bar">
          <div>
            <h1 class="section-title">${state.t("dashboard_title")}</h1>
            <div class="subtitle">${state.t("dashboard_welcome", { name: state.user?.name || "Traveler" })}</div>
          </div>
          <button class="icon-button" type="button" data-action="logout">☰</button>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="meta-text">${state.t("metric_trips")}</div>
            <div class="summary-value">${state.trips.length}</div>
          </div>
          <div class="summary-card">
            <div class="meta-text">${state.t("metric_memories")}</div>
            <div class="summary-value">${state.memories.length}</div>
          </div>
        </div>

        <div class="chip-row dashboard-chip-row" style="margin-top:18px;">
          ${categories
            .map((category) => {
              const label = category === "All" ? state.t("filter_all") : state.tCategory(category);
              return `
                <button
                  type="button"
                  class="filter-chip ${state.selectedCategory === category ? "active" : ""}"
                  data-category="${escapeHtml(category)}"
                >${escapeHtml(label)}</button>
              `;
            })
            .join("")}
        </div>

        <div class="trip-grid" style="margin-top:18px;">
          ${
            trips.length
              ? trips
                  .map((trip) => {
                    const preview = (trip.itinerary || [])
                      .slice(0, 2)
                      .map(
                        (item) =>
                          `<div class="tiny">${escapeHtml(item.startTime || "--:--")} - ${escapeHtml(
                            item.title || item.placeName || "Plan item"
                          )}</div>`
                      )
                      .join("");

                    return `
                      <article class="trip-card">
                        <div class="tiny">${escapeHtml(state.tCategory(trip.category || "City"))}</div>
                        <h3 class="trip-title">${escapeHtml(`${getCoverLabel(trip.cover)} ${trip.title}`)}</h3>
                        <div class="trip-meta">${escapeHtml(formatTripRange(trip.startDate, trip.endDate))}</div>
                        <div class="page-stack" style="margin-top:12px;">${preview}</div>
                        <div class="trip-actions" style="margin-top:14px;">
                          <button class="mini-button light" type="button" data-action="edit-trip" data-trip-id="${trip.id}">${state.t("action_edit")}</button>
                          <button class="mini-button dark" type="button" data-action="delete-trip" data-trip-id="${trip.id}">${state.t("action_delete")}</button>
                        </div>
                      </article>
                    `;
                  })
                  .join("")
              : `<div class="empty-card">${state.t("empty_trips")}</div>`
          }
        </div>
      </div>
    </section>
  `;
}
