import { escapeHtml } from "../utils.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60";

export function renderDiscoveryPage(state) {
  return `
    <section class="screen discovery-map-page ${state.currentPage === "discovery" ? "active" : ""}" data-screen="discovery">
      <div class="top-bar">
        <div>
          <h1 class="section-title">${state.t("discovery_title")}</h1>
          <div class="subtitle">${state.t("discovery_subtitle")}</div>
        </div>
        <button class="icon-button" type="button" data-page="dashboard">${state.t("action_back")}</button>
      </div>

      <div class="page-stack">
        <div class="map-browser">
          <div class="map-frame discovery-live-map">
            <div id="discovery-map"></div>

            <div class="map-search-overlay">
              <form class="map-search-card" id="discovery-search-form">
                <div class="map-search-row">
                  <input
                    class="input map-search-input"
                    id="place-query"
                    type="text"
                    placeholder="${state.t("placeholder_search_place")}"
                    autocomplete="off"
                    value="${escapeHtml(state.discoveryQuery || "")}"
                  >
                  <button class="map-inline-button primary" type="submit">${state.t("action_search_places")}</button>
                  <button class="map-inline-button soft" type="button" data-action="use-current-location">${state.t("action_use_current_location")}</button>
                </div>
                <div class="status-text ${state.discoveryStatusType || ""}">${state.discoveryStatus || state.t("discovery_default_status")}</div>
                <div class="helper-text">${state.t("discovery_helper_live")}</div>
              </form>

              ${
                state.discoverySuggestions?.length
                  ? `
                    <div class="search-suggestions">
                      ${state.discoverySuggestions
                        .map(
                          (place, index) => `
                            <button
                              class="search-suggestion"
                              type="button"
                              data-action="pick-discovery-suggestion"
                              data-suggestion-index="${index}"
                            >
                              <span class="search-suggestion-title">${escapeHtml(place.name || "")}</span>
                              <span class="search-suggestion-meta">${escapeHtml(place.display_name || "")}</span>
                            </button>
                          `
                        )
                        .join("")}
                    </div>
                  `
                  : ""
              }
            </div>
          </div>

          <div class="sheet map-results-sheet">
            <div class="top-bar" style="margin-bottom:12px;">
              <div>
                <h3 style="margin:0;">${state.t("discovery_results_title")}</h3>
                <div class="subtitle">${state.t("discovery_results_subtitle")}</div>
              </div>
            </div>

            <div class="result-grid compact">
              ${
                state.discoveryResults.length
                  ? state.discoveryResults
                      .map((place, index) => {
                        const title = place.name || (place.display_name || "Unnamed place").split(",")[0];
                        const lat = Number(place.lat);
                        const lng = Number(place.lon);
                        const latText = Number.isFinite(lat) ? lat.toFixed(4) : "-";
                        const lngText = Number.isFinite(lng) ? lng.toFixed(4) : "-";
                        const isActive = state.selectedDiscoveryResultId === place.id;
                        return `
                          <article class="result-card ${isActive ? "active" : ""}">
                            <img src="${escapeHtml(place.image || FALLBACK_IMAGE)}" alt="${escapeHtml(title)}">
                            <div class="result-card-header">
                              <div>
                                <h3 class="result-title">${escapeHtml(title)}</h3>
                                <div class="helper-text">${escapeHtml(place.display_name || "")}</div>
                              </div>
                            </div>
                            <div class="meta-text tiny" style="margin-top:8px;">${state.t("result_coordinates", { lat: latText, lng: lngText })}</div>
                            <div class="trip-actions" style="margin-top:12px;">
                              <button class="mini-button soft" type="button" data-action="focus-discovery-result" data-place-index="${index}">${state.t("action_view_on_map")}</button>
                              <button class="mini-button light" type="button" data-action="save-place-to-favorite" data-place-index="${index}">${state.t("action_save_favorite")}</button>
                              <button class="mini-button dark" type="button" data-action="add-place-to-trip" data-place-index="${index}">${state.t("action_add_to_trip")}</button>
                            </div>
                          </article>
                        `;
                      })
                      .join("")
                  : `<div class="empty-card">${state.t("empty_places")}</div>`
              }
            </div>
          </div>
        </div>

        <div class="sheet">
          <div class="top-bar" style="margin-bottom:12px;">
            <div>
              <h3 style="margin:0;">${state.t("favorites_title")}</h3>
              <div class="subtitle">${state.t("favorites_subtitle")}</div>
            </div>
          </div>
          <div class="result-grid">
            ${
              state.favorites.length
                ? state.favorites
                    .map(
                      (favorite) => `
                      <article class="result-card">
                        <h3 class="result-title">${escapeHtml(favorite.name || state.t("field_place"))}</h3>
                        <div class="helper-text">${escapeHtml(favorite.address || "")}</div>
                        <div class="meta-text tiny" style="margin-top:8px;">${state.t("result_coordinates", { lat: favorite.lat || "-", lng: favorite.lng || "-" })}</div>
                        ${favorite.note ? `<div class="helper-text" style="margin-top:8px;">${escapeHtml(favorite.note)}</div>` : ""}
                        <div class="trip-actions" style="margin-top:12px;">
                          <button class="mini-button soft" type="button" data-action="use-favorite-in-trip" data-favorite-id="${favorite.id}">${state.t("action_use_favorite")}</button>
                          <button class="mini-button dark" type="button" data-action="remove-favorite" data-favorite-id="${favorite.id}">${state.t("action_remove_favorite")}</button>
                        </div>
                      </article>
                    `
                    )
                    .join("")
                : `<div class="empty-card">${state.t("empty_favorites")}</div>`
            }
          </div>
        </div>
      </div>
    </section>
  `;
}
