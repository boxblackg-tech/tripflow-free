import { escapeHtml } from "../utils.js";

function renderItineraryItem(item = {}) {
  return `
    <article class="itinerary-item">
      <div class="split-grid">
        <label class="field">
          <span class="field-label">Day</span>
          <input class="input" data-item-field="dayIndex" type="number" min="1" value="${escapeHtml(item.dayIndex || 1)}">
        </label>
        <label class="field">
          <span class="field-label">Title</span>
          <input class="input" data-item-field="title" type="text" placeholder="Morning coffee" value="${escapeHtml(item.title || "")}">
        </label>
      </div>

      <div class="split-grid" style="margin-top:10px;">
        <label class="field">
          <span class="field-label">Start</span>
          <input class="input" data-item-field="startTime" type="time" value="${escapeHtml(item.startTime || "")}">
        </label>
        <label class="field">
          <span class="field-label">End</span>
          <input class="input" data-item-field="endTime" type="time" value="${escapeHtml(item.endTime || "")}">
        </label>
      </div>

      <label class="field" style="margin-top:10px;">
        <span class="field-label">Place</span>
        <input class="input" data-item-field="placeName" type="text" placeholder="Cafe or location" value="${escapeHtml(item.placeName || "")}">
      </label>

      <label class="field" style="margin-top:10px;">
        <span class="field-label">Address</span>
        <input class="input" data-item-field="address" type="text" placeholder="Address or map detail" value="${escapeHtml(item.address || "")}">
      </label>

      <div class="split-grid" style="margin-top:10px;">
        <label class="field">
          <span class="field-label">Lat</span>
          <input class="input" data-item-field="lat" type="text" value="${escapeHtml(item.lat || "")}">
        </label>
        <label class="field">
          <span class="field-label">Lng</span>
          <input class="input" data-item-field="lng" type="text" value="${escapeHtml(item.lng || "")}">
        </label>
      </div>

      <label class="field" style="margin-top:10px;">
        <span class="field-label">Note</span>
        <textarea class="textarea" data-item-field="note" placeholder="Details">${escapeHtml(item.note || "")}</textarea>
      </label>

      <button class="mini-button dark" type="button" data-action="remove-itinerary">Remove</button>
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
          <h1 class="section-title">Trip.</h1>
          <div class="subtitle">Create or update your itinerary day by day.</div>
        </div>
        <button class="icon-button" type="button" data-page="dashboard">←</button>
      </div>

      <div class="sheet page-stack">
        <label class="field">
          <span class="field-label">Trip title</span>
          <input class="input" id="trip-title" type="text" placeholder="Chiang Mai Coffee Escape" value="${escapeHtml(trip.title || "")}">
        </label>
        <div class="split-grid">
          <label class="field">
            <span class="field-label">Category</span>
            <select class="select" id="trip-category">
              ${state.config.categories
                .map(
                  (category) => `
                  <option value="${escapeHtml(category)}" ${trip.category === category ? "selected" : ""}>${escapeHtml(category)}</option>
                `
                )
                .join("")}
            </select>
          </label>
          <label class="field">
            <span class="field-label">Cover label</span>
            <input class="input" id="trip-cover" type="text" maxlength="12" placeholder="Beach" value="${escapeHtml(trip.cover || "")}">
          </label>
        </div>
        <div class="split-grid">
          <label class="field">
            <span class="field-label">Start date</span>
            <input class="input" id="trip-start" type="date" value="${escapeHtml(trip.startDate || "")}">
          </label>
          <label class="field">
            <span class="field-label">End date</span>
            <input class="input" id="trip-end" type="date" value="${escapeHtml(trip.endDate || "")}">
          </label>
        </div>
        <label class="field">
          <span class="field-label">Trip notes</span>
          <textarea class="textarea" id="trip-notes" placeholder="Mood board, route idea, booking note">${escapeHtml(trip.notes || "")}</textarea>
        </label>
      </div>

      <div class="sheet" style="margin-top:14px;">
        <div class="top-bar" style="margin-bottom:12px;">
          <div>
            <h3 style="margin:0;">Itinerary</h3>
            <div class="subtitle">Organize time, place, and notes for each stop.</div>
          </div>
          <button class="icon-button" type="button" data-action="add-itinerary">+</button>
        </div>
        <div class="itinerary-list" id="itinerary-list">
          ${(trip.itinerary && trip.itinerary.length ? trip.itinerary : [{}]).map(renderItineraryItem).join("")}
        </div>
      </div>

      <div class="editor-actions" style="margin-top:14px;">
        <button class="mini-button dark" type="button" data-action="save-trip">Save Trip</button>
        <button class="mini-button soft" type="button" data-action="new-trip">New Blank</button>
      </div>

      <div class="status-text ${state.editorStatusType || ""}" style="margin-top:12px;">${state.editorStatus || ""}</div>
    </section>
  `;
}
