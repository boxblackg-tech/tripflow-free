import { escapeHtml } from "../utils.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60";

export function renderDiscoveryPage(state) {
  return `
    <section class="screen ${state.currentPage === "discovery" ? "active" : ""}" data-screen="discovery">
      <div class="top-bar">
        <div>
          <h1 class="section-title">${state.t("discovery_title")}</h1>
          <div class="subtitle">${state.t("discovery_subtitle")}</div>
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
                >${escapeHtml(state.t(`discovery_${tab.key}`))}</button>
              `
              )
              .join("")}
          </div>

          <div class="form-grid" style="margin-top:12px;">
            <input class="input" id="place-query" type="text" placeholder="${state.t("placeholder_search_place")}" value="${escapeHtml(state.discoveryQuery || "")}">
            <button class="primary-button" type="button" data-action="search-places">${state.t("action_search_places")}</button>
            <div class="status-text ${state.discoveryStatusType || ""}">${state.discoveryStatus || state.t("discovery_default_status")}</div>
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
                        <div class="meta-text tiny" style="margin-top:8px;">${state.t("result_coordinates", { lat: latText, lng: lngText })}</div>
                        <div class="trip-actions" style="margin-top:12px;">
                          <button class="mini-button soft" type="button" data-action="add-place-to-trip" data-place-index="${index}">${state.t("action_add_to_trip")}</button>
                          <button class="mini-button dark" type="button" data-action="add-place-to-memory" data-place-index="${index}">${state.t("action_save_memory_short")}</button>
                        </div>
                      </article>
                    `;
                  })
                  .join("")
              : `<div class="empty-card">${state.t("empty_places")}</div>`
          }
        </div>
      </div>
    </section>
  `;
}
