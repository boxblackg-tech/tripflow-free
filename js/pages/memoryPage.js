import { escapeHtml } from "../utils.js";

export function renderMemoryPage(state) {
  return `
    <section class="screen ${state.currentPage === "memory" ? "active" : ""}" data-screen="memory">
      <div class="top-bar">
        <div>
          <h1 class="section-title">${state.t("memory_title")}</h1>
          <div class="subtitle">${state.t("memory_subtitle")}</div>
        </div>
        <button class="icon-button" type="button" data-page="dashboard">←</button>
      </div>

      <div class="sheet">
        <div class="form-grid">
          <label class="field">
            <span class="field-label">${state.t("field_trip")}</span>
            <select class="select" id="memory-trip">
              <option value="">${state.t("option_no_trip")}</option>
              ${state.trips
                .map(
                  (trip) => `
                  <option value="${trip.id}" ${state.memoryDraft.tripId === trip.id ? "selected" : ""}>${escapeHtml(trip.title)}</option>
                `
                )
                .join("")}
            </select>
          </label>

          <label class="field">
            <span class="field-label">${state.t("field_place")}</span>
            <input class="input" id="memory-place" type="text" placeholder="${state.t("placeholder_memory_place")}" value="${escapeHtml(state.memoryDraft.placeName || "")}">
          </label>

          <div class="split-grid">
            <label class="field">
              <span class="field-label">${state.t("field_date")}</span>
              <input class="input" id="memory-date" type="date" value="${escapeHtml(state.memoryDraft.memoryDate || "")}">
            </label>
            <label class="field">
              <span class="field-label">${state.t("field_photo_url")}</span>
              <input class="input" id="memory-photo" type="url" placeholder="https://..." value="${escapeHtml(state.memoryDraft.photoUrl || "")}">
            </label>
          </div>

          <div class="split-grid">
            <label class="field">
              <span class="field-label">${state.t("field_latitude")}</span>
              <input class="input" id="memory-lat" type="text" placeholder="13.7563" value="${escapeHtml(state.memoryDraft.lat || "")}">
            </label>
            <label class="field">
              <span class="field-label">${state.t("field_longitude")}</span>
              <input class="input" id="memory-lng" type="text" placeholder="100.5018" value="${escapeHtml(state.memoryDraft.lng || "")}">
            </label>
          </div>

          <label class="field">
            <span class="field-label">${state.t("field_memory_note")}</span>
            <textarea class="textarea" id="memory-note" placeholder="${state.t("placeholder_memory_note")}">${escapeHtml(state.memoryDraft.note || "")}</textarea>
          </label>

          <button class="primary-button" type="button" data-action="save-memory">${state.t("action_save_memory")}</button>
          <div class="status-text ${state.memoryStatusType || ""}">${state.memoryStatus || ""}</div>
        </div>
      </div>

      <div class="memory-grid" style="margin-top:16px;">
        ${
          state.memories.length
            ? state.memories
                .map((memory) => {
                  const trip = state.trips.find((item) => item.id === memory.tripId);
                  return `
                    <article class="memory-card">
                      ${memory.photoUrl ? `<img src="${escapeHtml(memory.photoUrl)}" alt="${escapeHtml(memory.placeName)}">` : ""}
                      <div class="meta-text tiny">${escapeHtml(memory.memoryDate || "")}${trip ? ` - ${escapeHtml(trip.title)}` : ""}</div>
                      <h3 class="memory-title">${escapeHtml(memory.placeName || state.t("memory_pin"))}</h3>
                      <div class="helper-text">${escapeHtml(memory.note || state.t("memory_no_note"))}</div>
                      ${memory.lat && memory.lng ? `<div class="meta-text tiny" style="margin-top:8px;">${state.t("memory_pinned_at", { lat: memory.lat, lng: memory.lng })}</div>` : ""}
                    </article>
                  `;
                })
                .join("")
            : `<div class="empty-card">${state.t("empty_memories")}</div>`
        }
      </div>
    </section>
  `;
}
