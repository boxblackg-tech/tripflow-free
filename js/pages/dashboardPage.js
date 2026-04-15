import { escapeHtml, formatTripRange, getCoverLabel } from "../utils.js";

export function renderDashboardPage(state) {
  const trips = state.filteredTrips || [];
  const categories = ["All"].concat(state.config.categories);

  return `
    <section class="screen ${state.currentPage === "dashboard" ? "active" : ""}" data-screen="dashboard">
      <div class="top-bar">
        <div>
          <h1 class="section-title">Today.</h1>
          <div class="subtitle">Welcome back, ${escapeHtml(state.user?.name || "Traveler")}</div>
        </div>
        <button class="icon-button" type="button" data-action="logout">☰</button>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="meta-text">Trips</div>
          <div class="summary-value">${state.trips.length}</div>
        </div>
        <div class="summary-card">
          <div class="meta-text">Memories</div>
          <div class="summary-value">${state.memories.length}</div>
        </div>
      </div>

      <div class="chip-row" style="margin-top:18px;">
        ${categories
          .map(
            (category) => `
            <button
              type="button"
              class="filter-chip ${state.selectedCategory === category ? "active" : ""}"
              data-category="${escapeHtml(category)}"
            >${escapeHtml(category)}</button>
          `
          )
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
                      <div class="tiny">${escapeHtml(trip.category || "Trip")}</div>
                      <h3 class="trip-title">${escapeHtml(`${getCoverLabel(trip.cover)} ${trip.title}`)}</h3>
                      <div class="trip-meta">${escapeHtml(formatTripRange(trip.startDate, trip.endDate))}</div>
                      <div class="page-stack" style="margin-top:12px;">${preview}</div>
                      <div class="trip-actions" style="margin-top:14px;">
                        <button class="mini-button light" type="button" data-action="edit-trip" data-trip-id="${trip.id}">Edit</button>
                        <button class="mini-button dark" type="button" data-action="delete-trip" data-trip-id="${trip.id}">Delete</button>
                      </div>
                    </article>
                  `;
                })
                .join("")
            : `<div class="empty-card">No trips yet. Tap the plus button to create your first plan.</div>`
        }
      </div>
    </section>
  `;
}
