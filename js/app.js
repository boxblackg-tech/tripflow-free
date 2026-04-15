import {
  clearSession,
  deleteTrip,
  getConfig,
  getFavoritesByUser,
  getMemoriesByUser,
  getSession,
  getTripsByUser,
  deleteFavorite,
  loginUser,
  registerUser,
  saveFavorite,
  saveMemory,
  saveTrip,
  seedDemoData
} from "./store.js";
import { createTranslator, translateCategory } from "./i18n.js";
import { renderApp } from "./ui.js";
import { findTripById, todayIso, uid } from "./utils.js";

const state = {
  config: getConfig(),
  lang: localStorage.getItem("tripflow_free_lang") || "en",
  currentPage: "login",
  authMode: "login",
  authStatus: "",
  authStatusType: "",
  editorStatus: "",
  editorStatusType: "",
  discoveryStatus: "",
  discoveryStatusType: "",
  memoryStatus: "",
  memoryStatusType: "",
  discoveryQuery: "",
  discoverySuggestions: [],
  discoveryResults: [],
  discoveryBounds: null,
  discoveryCenter: null,
  selectedDiscoveryResultId: "",
  selectedCategory: "All",
  user: null,
  trips: [],
  memories: [],
  favorites: [],
  editingTrip: null,
  memoryDraft: {
    tripId: "",
    placeName: "",
    memoryDate: todayIso(),
    note: "",
    photoUrl: "",
    lat: "",
    lng: ""
  }
};

let map = null;
let discoverySuggestionTimer = null;

bindGlobalEvents();
registerServiceWorker();
bootstrapApp();

async function bootstrapApp() {
  render();
  try {
    await seedDemoData();
    state.user = getSession();
    if (state.user) {
      await hydrateUserData();
      state.currentPage = "dashboard";
    }
  } catch (error) {
    console.warn("Bootstrap failed.", error);
  }
  render();
}

function bindGlobalEvents() {
  document.addEventListener("click", async (event) => {
    const actionTarget = event.target.closest("[data-action]");
    const pageTarget = event.target.closest("[data-page]");
    const authModeTarget = event.target.closest("[data-auth-mode]");
    const categoryTarget = event.target.closest("[data-category]");
    const langTarget = event.target.closest("[data-lang]");

    if (authModeTarget) {
      state.authMode = authModeTarget.dataset.authMode;
      state.authStatus = "";
      state.authStatusType = "";
      render();
      return;
    }

    if (langTarget) {
      state.lang = langTarget.dataset.lang;
      localStorage.setItem("tripflow_free_lang", state.lang);
      render();
      return;
    }

    if (pageTarget) {
      setPage(pageTarget.dataset.page);
      return;
    }

    if (categoryTarget) {
      state.selectedCategory = categoryTarget.dataset.category;
      render();
      return;
    }

    if (!actionTarget) return;

    const { action, tripId, placeIndex, suggestionIndex } = actionTarget.dataset;

    if (action === "logout") {
      clearSession();
      state.user = null;
      state.trips = [];
      state.memories = [];
      state.editingTrip = null;
      state.currentPage = "login";
      render();
      return;
    }

    if (action === "new-trip") {
      startNewTrip();
      return;
    }

    if (action === "edit-trip") {
      state.editingTrip = clone(findTripById(state.trips, tripId));
      state.editorStatus = "";
      state.editorStatusType = "";
      setPage("editor");
      return;
    }

    if (action === "delete-trip") {
      if (!window.confirm(t("confirm_delete_trip"))) return;
      await deleteTrip(tripId);
      await hydrateUserData();
      setPage("dashboard");
      return;
    }

    if (action === "add-itinerary") {
      ensureEditingTrip();
      state.editingTrip.itinerary.push(blankItineraryItem());
      render();
      return;
    }

    if (action === "remove-itinerary") {
      const article = event.target.closest(".itinerary-item");
      if (article) article.remove();
      return;
    }

    if (action === "save-trip") {
      await saveCurrentTrip();
      return;
    }

    if (action === "search-places") {
      await runPlaceSearch();
      return;
    }

    if (action === "pick-discovery-suggestion") {
      await applyDiscoverySuggestion(Number(suggestionIndex));
      return;
    }

    if (action === "focus-discovery-result") {
      focusDiscoveryResult(Number(placeIndex));
      return;
    }

    if (action === "save-memory") {
      await saveCurrentMemory();
      return;
    }

    if (action === "save-place-to-favorite") {
      await saveDiscoveryPlaceToFavorite(Number(placeIndex));
      return;
    }

    if (action === "add-place-to-trip") {
      addDiscoveryPlaceToTrip(Number(placeIndex));
      return;
    }

    if (action === "use-current-location") {
      await useCurrentLocation();
      return;
    }

    if (action === "use-favorite-in-trip") {
      addFavoriteToTrip(actionTarget.dataset.favoriteId);
      return;
    }

    if (action === "remove-favorite") {
      await removeFavorite(actionTarget.dataset.favoriteId);
      return;
    }
  });

  document.addEventListener("submit", async (event) => {
    if (event.target.id === "auth-form") {
      event.preventDefault();
      await handleAuthSubmit(new FormData(event.target));
    }
    if (event.target.id === "discovery-search-form") {
      event.preventDefault();
      await runPlaceSearch();
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "place-query") {
      state.discoveryQuery = event.target.value;
      scheduleDiscoverySuggestions(event.target.value);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.id !== "demo-login") return;
    state.authMode = "login";
    void handleAuthSubmit(
      new FormData(
        Object.assign(document.createElement("form"), {
          innerHTML: `
            <input name="email" value="demo@tripflow.app">
            <input name="password" value="1234">
          `
        })
      )
    );
  });
}

async function handleAuthSubmit(formData) {
  try {
    const payload = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      password: formData.get("password") || ""
    };
    const user =
      state.authMode === "signup" ? await registerUser(payload) : await loginUser(payload);
    state.user = user;
    state.authStatus = "";
    state.authStatusType = "";
    await hydrateUserData();
    setPage("dashboard");
  } catch (error) {
    state.authStatus = translateError(error.message || String(error));
    state.authStatusType = "error";
    render();
  }
}

async function hydrateUserData() {
  if (!state.user) return;
  state.trips = await getTripsByUser(state.user.id);
  state.memories = await getMemoriesByUser(state.user.id);
  state.favorites = await getFavoritesByUser(state.user.id);
  if (!state.memoryDraft.memoryDate) state.memoryDraft.memoryDate = todayIso();
}

function deriveState() {
  const translator = createTranslator(state.lang);
  return {
    ...state,
    t: translator,
    tCategory: (category) => translateCategory(state.lang, category),
    filteredTrips: state.trips.filter(
      (trip) =>
        state.selectedCategory === "All" || trip.category === state.selectedCategory
    )
  };
}

function render() {
  renderApp(deriveState());
  syncDiscoveryInput();
  mountMapIfNeeded();
}

function setPage(page) {
  if (page !== "discovery") {
    state.discoverySuggestions = [];
  }
  state.currentPage = page;
  if (page === "editor") ensureEditingTrip();
  render();
}

function ensureEditingTrip() {
  if (!state.editingTrip) {
    state.editingTrip = {
      id: "",
      title: "",
      category: state.config.categories[0],
      cover: "Trip",
      startDate: "",
      endDate: "",
      notes: "",
      createdAt: "",
      itinerary: [blankItineraryItem()]
    };
  }
}

function startNewTrip() {
  state.editingTrip = {
    id: "",
    title: "",
    category: state.config.categories[0],
    cover: "Trip",
    startDate: "",
    endDate: "",
    notes: "",
    createdAt: "",
    itinerary: [blankItineraryItem()]
  };
  state.editorStatus = "";
  state.editorStatusType = "";
  setPage("editor");
}

function blankItineraryItem() {
  return {
    id: uid("item"),
    dayIndex: 1,
    title: "",
    startTime: "",
    endTime: "",
    placeName: "",
    address: "",
    lat: "",
    lng: "",
    note: ""
  };
}

function collectTripForm() {
  const itinerary = Array.from(document.querySelectorAll(".itinerary-item"))
    .map((item, index) => {
      const previous = state.editingTrip?.itinerary?.[index] || {};
      return {
        id: previous.id || uid("item"),
        dayIndex: item.querySelector('[data-item-field="dayIndex"]').value,
        title: item.querySelector('[data-item-field="title"]').value.trim(),
        startTime: item.querySelector('[data-item-field="startTime"]').value,
        endTime: item.querySelector('[data-item-field="endTime"]').value,
        placeName: item.querySelector('[data-item-field="placeName"]').value.trim(),
        address: item.querySelector('[data-item-field="address"]').value.trim(),
        lat: item.querySelector('[data-item-field="lat"]').value.trim(),
        lng: item.querySelector('[data-item-field="lng"]').value.trim(),
        note: item.querySelector('[data-item-field="note"]').value.trim()
      };
    })
    .filter((item) => item.title || item.placeName || item.startTime || item.note);

  return {
    id: state.editingTrip?.id || "",
    createdAt: state.editingTrip?.createdAt || "",
    title: document.getElementById("trip-title")?.value.trim() || "",
    category: document.getElementById("trip-category")?.value || state.config.categories[0],
    cover: document.getElementById("trip-cover")?.value.trim() || "Trip",
    startDate: document.getElementById("trip-start")?.value || "",
    endDate: document.getElementById("trip-end")?.value || "",
    notes: document.getElementById("trip-notes")?.value.trim() || "",
    itinerary
  };
}

async function saveCurrentTrip() {
  if (!state.user) return;
  const payload = collectTripForm();
  const trip = await saveTrip(state.user.id, payload);
  state.editingTrip = clone(trip);
  await hydrateUserData();
  state.editorStatus = t("status_trip_saved");
  state.editorStatusType = "success";
  render();
}

async function runPlaceSearch() {
  const queryInput = document.getElementById("place-query");
  const query = queryInput?.value.trim() || state.discoveryQuery.trim();
  if (!query) {
    state.discoveryStatus = t("error_search_query");
    state.discoveryStatusType = "error";
    render();
    return;
  }

  state.discoveryQuery = query;
  state.discoverySuggestions = [];
  state.discoveryStatus = t("status_searching");
  state.discoveryStatusType = "";
  render();

  try {
    const results = await searchNominatim(query, 12);
    state.discoveryResults = results;
    state.selectedDiscoveryResultId = results[0]?.id || "";
    const bounds = computeBoundsFromResults(results);
    state.discoveryBounds = bounds;
    state.discoveryCenter = results[0]
      ? { lat: Number(results[0].lat), lng: Number(results[0].lon) }
      : state.discoveryCenter;

    if (!results.length) {
      state.discoveryStatus = t("error_search_no_results");
      state.discoveryStatusType = "error";
      render();
      return;
    }

    state.discoveryStatus = t("status_found_places", {
      count: state.discoveryResults.length
    });
    state.discoveryStatusType = "success";
  } catch (error) {
    state.discoveryResults = [];
    state.discoveryBounds = null;
    state.discoveryCenter = null;
    state.discoveryStatus = t("error_search_failed");
    state.discoveryStatusType = "error";
  }
  render();
}

function addDiscoveryPlaceToTrip(index) {
  const place = state.discoveryResults[index];
  if (!place) return;
  ensureEditingTrip();
  state.editingTrip.itinerary.push({
    id: uid("item"),
    dayIndex: 1,
    title: place.name || (place.display_name || "").split(",")[0],
    startTime: "",
    endTime: "",
    placeName: place.name || (place.display_name || "").split(",")[0],
    address: place.display_name || "",
    lat: place.lat || "",
    lng: place.lon || "",
    note: ""
  });
  state.editorStatus = t("status_place_added");
  state.editorStatusType = "success";
  setPage("editor");
}

function scheduleDiscoverySuggestions(query) {
  window.clearTimeout(discoverySuggestionTimer);
  const normalizedQuery = String(query || "").trim();
  if (normalizedQuery.length < 2) {
    state.discoverySuggestions = [];
    if (state.currentPage === "discovery") render();
    return;
  }

  discoverySuggestionTimer = window.setTimeout(async () => {
    try {
      const suggestions = await searchNominatim(normalizedQuery, 6);
      if (state.discoveryQuery.trim() !== normalizedQuery) return;
      state.discoverySuggestions = suggestions;
      if (state.currentPage === "discovery") render();
    } catch (error) {
      state.discoverySuggestions = [];
      if (state.currentPage === "discovery") render();
    }
  }, 450);
}

async function applyDiscoverySuggestion(index) {
  const suggestion = state.discoverySuggestions[index];
  if (!suggestion) return;
  state.discoveryQuery = suggestion.name || suggestion.display_name || state.discoveryQuery;
  state.discoverySuggestions = [];
  state.discoveryResults = [suggestion];
  state.selectedDiscoveryResultId = suggestion.id;
  state.discoveryBounds = computeBoundsFromResults([suggestion]);
  state.discoveryCenter = { lat: Number(suggestion.lat), lng: Number(suggestion.lon) };
  state.discoveryStatus = t("status_selected_place", {
    name: suggestion.name || suggestion.display_name || ""
  });
  state.discoveryStatusType = "success";
  render();
}

function focusDiscoveryResult(index) {
  const place = state.discoveryResults[index];
  if (!place) return;
  state.selectedDiscoveryResultId = place.id;
  state.discoveryCenter = { lat: Number(place.lat), lng: Number(place.lon) };
  render();
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    state.discoveryStatus = t("error_location_failed");
    state.discoveryStatusType = "error";
    render();
    return;
  }

  state.discoveryStatus = t("status_locating");
  state.discoveryStatusType = "";
  render();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      try {
        const place = await reverseLookup(lat, lng);
        state.discoveryQuery = place.name || place.display_name || t("action_use_current_location");
        state.discoverySuggestions = [];
        state.discoveryResults = [place];
        state.selectedDiscoveryResultId = place.id;
        state.discoveryCenter = { lat, lng };
        state.discoveryBounds = computeBoundsFromResults([place]);
        state.discoveryStatus = t("status_selected_place", {
          name: place.name || place.display_name || ""
        });
        state.discoveryStatusType = "success";
      } catch (error) {
        state.discoveryCenter = { lat, lng };
        state.discoveryStatus = t("error_location_failed");
        state.discoveryStatusType = "error";
      }
      render();
    },
    () => {
      state.discoveryStatus = t("error_location_failed");
      state.discoveryStatusType = "error";
      render();
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
}

async function searchNominatim(query, limit = 12) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=${limit}&addressdetails=1&namedetails=1&extratags=1&dedupe=1&accept-language=th,en&q=${encodeURIComponent(
      query
    )}`,
    {
      headers: { Accept: "application/json" }
    }
  );
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map(normalizeSearchResult);
}

async function reverseLookup(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&namedetails=1&accept-language=th,en&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`,
    {
      headers: { Accept: "application/json" }
    }
  );
  const data = await response.json();
  return normalizeSearchResult(data);
}

function normalizeSearchResult(place) {
  const address = place.address || {};
  const name =
    place.name ||
    place.namedetails?.name ||
    place.namedetails?.["name:th"] ||
    place.display_name?.split(",")?.[0] ||
    "Pinned place";
  const typeLabel = [place.type, place.class].filter(Boolean).join(" · ");

  return {
    id: place.place_id ? `nom_${place.place_id}` : uid("place"),
    name,
    display_name:
      [
        address.road,
        address.suburb,
        address.city,
        address.town,
        address.county,
        address.state,
        address.country
      ]
        .filter(Boolean)
        .join(", ") || place.display_name || "",
    lat: String(place.lat || ""),
    lon: String(place.lon || ""),
    image: "",
    typeLabel
  };
}

function computeBoundsFromResults(results) {
  const points = results
    .map((place) => [Number(place.lat), Number(place.lon)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

  if (!points.length) return null;

  const lats = points.map(([lat]) => lat);
  const lngs = points.map(([, lng]) => lng);
  return {
    south: Math.min(...lats),
    north: Math.max(...lats),
    west: Math.min(...lngs),
    east: Math.max(...lngs)
  };
}

async function saveCurrentMemory() {
  if (!state.user) return;
  const payload = {
    tripId: document.getElementById("memory-trip")?.value || "",
    placeName: document.getElementById("memory-place")?.value.trim() || "",
    memoryDate: document.getElementById("memory-date")?.value || todayIso(),
    note: document.getElementById("memory-note")?.value.trim() || "",
    photoUrl: document.getElementById("memory-photo")?.value.trim() || "",
    lat: document.getElementById("memory-lat")?.value.trim() || "",
    lng: document.getElementById("memory-lng")?.value.trim() || ""
  };

  if (!payload.placeName) {
    state.memoryStatus = t("error_place_required");
    state.memoryStatusType = "error";
    render();
    return;
  }

  await saveMemory(state.user.id, payload);
  await hydrateUserData();
  state.memoryDraft = {
    tripId: "",
    placeName: "",
    memoryDate: todayIso(),
    note: "",
    photoUrl: "",
    lat: "",
    lng: ""
  };
  state.memoryStatus = t("status_memory_saved");
  state.memoryStatusType = "success";
  render();
}

function syncDiscoveryInput() {
  const input = document.getElementById("place-query");
  if (input) input.value = state.discoveryQuery;
}

function mountMapIfNeeded() {
  if (state.currentPage !== "discovery") {
    if (map) {
      map.remove();
      map = null;
    }
    return;
  }

  const mapElement = document.getElementById("discovery-map");
  if (!mapElement || typeof window.L === "undefined") return;

  if (map) map.remove();
  map = window.L.map(mapElement).setView([13.7563, 100.5018], 6);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  const bounds = [];
  let activeMarker = null;
  state.discoveryResults.forEach((place) => {
    const lat = Number(place.lat);
    const lng = Number(place.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const title = place.name || (place.display_name || "").split(",")[0] || "Place";
    const marker = window.L.marker([lat, lng]).addTo(map).bindPopup(
      `<strong>${title}</strong><br>${place.display_name || ""}`
    );
    marker.on("click", () => {
      state.selectedDiscoveryResultId = place.id;
      render();
    });
    if (place.id === state.selectedDiscoveryResultId) {
      activeMarker = marker;
    }
    bounds.push([lat, lng]);
  });

  map.on("click", async (event) => {
    state.discoveryStatus = t("status_loading_pin");
    state.discoveryStatusType = "";
    render();
    try {
      const place = await reverseLookup(event.latlng.lat, event.latlng.lng);
      state.discoveryQuery = place.name || place.display_name || state.discoveryQuery;
      state.discoverySuggestions = [];
      state.discoveryResults = [place];
      state.selectedDiscoveryResultId = place.id;
      state.discoveryCenter = {
        lat: Number(place.lat),
        lng: Number(place.lon)
      };
      state.discoveryBounds = computeBoundsFromResults([place]);
      state.discoveryStatus = t("status_selected_place", {
        name: place.name || place.display_name || ""
      });
      state.discoveryStatusType = "success";
    } catch (error) {
      state.discoveryStatus = t("error_search_failed");
      state.discoveryStatusType = "error";
    }
    render();
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [24, 24] });
    if (activeMarker) {
      window.setTimeout(() => activeMarker.openPopup(), 150);
    }
    return;
  }

  if (state.discoveryBounds) {
    map.fitBounds(
      [
        [state.discoveryBounds.south, state.discoveryBounds.west],
        [state.discoveryBounds.north, state.discoveryBounds.east]
      ],
      { padding: [24, 24] }
    );
    return;
  }

  if (state.discoveryCenter) {
    map.setView([state.discoveryCenter.lat, state.discoveryCenter.lng], 9);
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => registration.update())
      .catch(() => {});
  });
}

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

function t(key, vars) {
  return createTranslator(state.lang)(key, vars);
}

function translateError(message) {
  const map = {
    "Please complete name, email, and password.": "error_complete_auth",
    "This email is already registered.": "error_email_registered",
    "Incorrect email or password.": "error_incorrect_login"
  };
  return map[message] ? t(map[message]) : message;
}

async function saveDiscoveryPlaceToFavorite(index) {
  const place = state.discoveryResults[index];
  if (!place || !state.user) return;
  await saveFavorite(state.user.id, {
    name: place.name || (place.display_name || "").split(",")[0],
    address: place.display_name || "",
    lat: place.lat || "",
    lng: place.lon || "",
    note: "",
    source: "search"
  });
  await hydrateUserData();
  state.discoveryStatus = t("status_pin_saved");
  state.discoveryStatusType = "success";
  render();
}

function addFavoriteToTrip(favoriteId) {
  const favorite = state.favorites.find((item) => item.id === favoriteId);
  if (!favorite) return;
  ensureEditingTrip();
  state.editingTrip.itinerary.push({
    id: uid("item"),
    dayIndex: 1,
    title: favorite.name,
    startTime: "",
    endTime: "",
    placeName: favorite.name,
    address: favorite.address,
    lat: favorite.lat,
    lng: favorite.lng,
    note: favorite.note || ""
  });
  state.editorStatus = t("status_place_added");
  state.editorStatusType = "success";
  setPage("editor");
}

async function removeFavorite(favoriteId) {
  await deleteFavorite(favoriteId);
  await hydrateUserData();
  state.discoveryStatus = t("status_favorite_removed");
  state.discoveryStatusType = "success";
  render();
}
