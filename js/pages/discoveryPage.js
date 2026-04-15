import { escapeHtml } from "../utils.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60";

export function renderDiscoveryPage(state) {
  return `
    <section class="screen ${state.currentPage === "discovery" ? "active" : ""}" data-screen="discovery">
      <div class="top-bar">
        <div>
          <h1 class="section-title">Explore.</h1>
          <div class="subtitle">Search cafes, food, and places to visit on an interactive map.</div>
        </div>
        <button class="icon-button" type="button" data-page="dashboard">←</button>
      </div>

      <div class="page-stack">
        <div class="sheet">
          <div class="chip-row">
            ${state.config.discoveryTabs
              .map(
                (tab) => `
                <button
                  class="filter-chip ${state.discoveryType === tab.key ? "active" : ""}"
                  type="button"
                  data-discovery-type="${tab.key}"
                >${escapeHtml(tab.label)}</button>
              `
              )
              .join("")}
          </div>

          <div class="form-grid" style="margin-top:12px;">
            <input class="input" id="place-query" type="text" placeholder="Search city, district, or place" value="${escapeHtml(state.discoveryQuery || "")}">
            <button class="primary-button" type="button" data-action="search-places">Search places</button>
            <div class="status-text ${state.discoveryStatusType || ""}">${state.discoveryStatus || "Place results will be pinned on the map below."}</div>
          </div>
        </div>

        <div class="map-frame">
          <div id="discovery-map"></div>
        </div>

        <div class="result-grid">
          ${
            state.discoveryResults.length
              ? state.discoveryResults
                  .map((place, index) => {
                    const title = (place.display_name || "Unnamed place").split(",")[0];
                    const lat = Number(place.lat);
                    const lng = Number(place.lon);
                    const latText = Number.isFinite(lat) ? lat.toFixed(4) : "-";
                    const lngText = Number.isFinite(lng) ? lng.toFixed(4) : "-";
                    return `
                      <article class="result-card">
                        <img src="${FALLBACK_IMAGE}" alt="${escapeHtml(title)}">
                        <h3 class="result-title">${escapeHtml(title)}</h3>
                        <div class="helper-text">${escapeHtml(place.display_name || "")}</div>
                        <div class="meta-text tiny" style="margin-top:8px;">Coordinates: ${escapeHtml(latText)}, ${escapeHtml(lngText)}</div>
                        <div class="trip-actions" style="margin-top:12px;">
                          <button class="mini-button soft" type="button" data-action="add-place-to-trip" data-place-index="${index}">Add to trip</button>
                          <button class="mini-button dark" type="button" data-action="add-place-to-memory" data-place-index="${index}">Save memory</button>
                        </div>
                      </article>
                    `;
                  })
                  .join("")
              : `<div class="empty-card">No place results yet. Search an area to start exploring.</div>`
          }
        </div>
      </div>
    </section>
  `;
}
