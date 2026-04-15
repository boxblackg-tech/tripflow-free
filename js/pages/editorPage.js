import { escapeHtml } from "../utils.js";

function renderItineraryItem(item = {}, state) {
  return `
    <article class="itinerary-item">
      <div class="split-grid">
        <label class="field">
          <span class="field-label">${state.t("field_day")}</span>
          <input class="input" data-item-field="dayIndex" type="number" min="1" value="${escapeHtml(item.dayIndex || 1)}">
        </label>
        <label class="field">
          <span class="field-label">${state.t("field_title")}</span>
          <input class="input" data-item-field="title" type="text" placeholder="${state.t("placeholder_item_title")}" value="${escapeHtml(item.title || "")}">
        </label>
      </div>

      <div class="split-grid" style="margin-top:10px;">
        <label class="field">
          <span class="field-label">${state.t("field_start")}</span>
          <input class="input" data-item-field="startTime" type="time" value="${escapeHtml(item.startTime || "")}">
        </label>
        <label class="field">
          <span class="field-label">${state.t("field_end")}</span>
          <input class="input" data-item-field="endTime" type="time" value="${escapeHtml(item.endTime || "")}">
        </label>
      </div>

      <label class="field" style="margin-top:10px;">
        <span class="field-label">${state.t("field_place")}</span>
        <input class="input" data-item-field="placeName" type="text" placeholder="${state.t("placeholder_place")}" value="${escapeHtml(item.placeName || "")}">
      </label>

      <label class="field" style="margin-top:10px;">
        <span class="field-label">${state.t("field_address")}</span>
        <input class="input" data-item-field="address" type="text" placeholder="${state.t("placeholder_address")}" value="${escapeHtml(item.address || "")}">
      </label>

      <div class="split-grid" style="margin-top:10px;">
        <label class="field">
          <span class="field-label">${state.t("field_lat")}</span>
          <input class="input" data-item-field="lat" type="text" value="${escapeHtml(item.lat || "")}">
        </label>
        <label class="field">
          <span class="field-label">${state.t("field_lng")}</span>
          <input class="input" data-item-field="lng" type="text" value="${escapeHtml(item.lng || "")}">
        </label>
      </div>

      <label class="field" style="margin-top:10px;">
        <span class="field-label">${state.t("field_note")}</span>
        <textarea class="textarea" data-item-field="note" placeholder="${state.t("placeholder_note")}">${escapeHtml(item.note || "")}</textarea>
      </label>

      <button class="mini-button dark" type="button" data-action="remove-itinerary">${state.t("action_remove")}</button>
    </article>
  `;
}

export function renderEditorPage(state) {
  const trip = state.editingTrip || {
    title: "",
    category: state.config.categories[0],
    cover: "Trip",
    startDate: "",
    endDate: "",
    notes: "",
    itinerary: [{}]
  };

  return `
    <section class="screen ${state.currentPage === "editor" ? "active" : ""}" data-screen="editor">
      <div class="top-bar">
        <div>
          <h1 class="section-title">${state.t("editor_title")}</h1>
          <div class="subtitle">${state.t("editor_subtitle")}</div>
        </div>
        <button class="icon-button" type="button" data-page="dashboard">←</button>
      </div>

      <div class="sheet page-stack">
        <label class="field">
          <span class="field-label">${state.t("field_trip_title")}</span>
          <input class="input" id="trip-title" type="text" placeholder="${state.t("placeholder_trip_title")}" value="${escapeHtml(trip.title || "")}">
        </label>
        <div class="split-grid">
          <label class="field">
            <span class="field-label">${state.t("field_category")}</span>
            <select class="select" id="trip-category">
              ${state.config.categories
                .map(
                  (category) => `
                  <option value="${escapeHtml(category)}" ${trip.category === category ? "selected" : ""}>${escapeHtml(state.tCategory(category))}</option>
                `
                )
                .join("")}
            </select>
          </label>
          <label class="field">
            <span class="field-label">${state.t("field_cover_label")}</span>
            <input class="input" id="trip-cover" type="text" maxlength="12" placeholder="${state.t("placeholder_cover")}" value="${escapeHtml(trip.cover || "")}">
          </label>
        </div>
        <div class="split-grid">
          <label class="field">
            <span class="field-label">${state.t("field_start_date")}</span>
            <input class="input" id="trip-start" type="date" value="${escapeHtml(trip.startDate || "")}">
          </label>
          <label class="field">
            <span class="field-label">${state.t("field_end_date")}</span>
            <input class="input" id="trip-end" type="date" value="${escapeHtml(trip.endDate || "")}">
          </label>
        </div>
        <label class="field">
          <span class="field-label">${state.t("field_trip_notes")}</span>
          <textarea class="textarea" id="trip-notes" placeholder="${state.t("placeholder_trip_notes")}">${escapeHtml(trip.notes || "")}</textarea>
        </label>
      </div>

      <div class="sheet" style="margin-top:14px;">
        <div class="top-bar" style="margin-bottom:12px;">
          <div>
            <h3 style="margin:0;">${state.t("itinerary_title")}</h3>
            <div class="subtitle">${state.t("itinerary_subtitle")}</div>
          </div>
          <button class="icon-button" type="button" data-action="add-itinerary">+</button>
        </div>
        <div class="itinerary-list" id="itinerary-list">
          ${(trip.itinerary && trip.itinerary.length ? trip.itinerary : [{}])
            .map((item) => renderItineraryItem(item, state))
            .join("")}
        </div>
      </div>

      <div class="editor-actions" style="margin-top:14px;">
        <button class="mini-button dark" type="button" data-action="save-trip">${state.t("action_save_trip")}</button>
        <button class="mini-button soft" type="button" data-action="new-trip">${state.t("action_new_blank")}</button>
      </div>

      <div class="status-text ${state.editorStatusType || ""}" style="margin-top:12px;">${state.editorStatus || ""}</div>
    </section>
  `;
}
