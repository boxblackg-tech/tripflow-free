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
        <div class="sheet">
          <div class="form-grid">
            <label class="field">
              <span class="field-label">${state.t("field_province")}</span>
              <input
                class="input"
                id="place-query"
                type="text"
                placeholder="${state.t("placeholder_search_place")}"
                value="${escapeHtml(state.discoveryQuery || "")}"
              >
            </label>
            <button class="primary-button" type="button" data-action="search-places">${state.t("action_search_places")}</button>
            <div class="status-text ${state.discoveryStatusType || ""}">${state.discoveryStatus || state.t("discovery_default_status")}</div>
            <div class="helper-text">${state.t("discovery_helper_province")}</div>
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
                    const title = place.name || (place.display_name || "Unnamed place").split(",")[0];
                    const lat = Number(place.lat);
                    const lng = Number(place.lon);
                    const latText = Number.isFinite(lat) ? lat.toFixed(4) : "-";
                    const lngText = Number.isFinite(lng) ? lng.toFixed(4) : "-";
                    return `
                      <article class="result-card">
                        <img src="${escapeHtml(place.image || FALLBACK_IMAGE)}" alt="${escapeHtml(title)}">
                        <h3 class="result-title">${escapeHtml(title)}</h3>
                        <div class="helper-text">${escapeHtml(place.display_name || "")}</div>
                        <div class="meta-text tiny" style="margin-top:8px;">${state.t("result_coordinates", { lat: latText, lng: lngText })}</div>
                        <div class="trip-actions" style="margin-top:12px;">
                          <button class="mini-button light" type="button" data-action="save-place-to-favorite" data-place-index="${index}">${state.t("action_save_favorite")}</button>
                        </div>
                      </article>
                    `;
                  })
                  .join("")
              : `<div class="empty-card">${state.t("empty_places")}</div>`
          }
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
