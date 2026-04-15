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
  discoveryResults: [],
  discoveryBounds: null,
  discoveryCenter: null,
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

seedDemoData();
state.user = getSession();
if (state.user) {
  hydrateUserData();
  state.currentPage = "dashboard";
}
render();
bindGlobalEvents();
registerServiceWorker();

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

    const { action, tripId, placeIndex } = actionTarget.dataset;

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
      deleteTrip(tripId);
      hydrateUserData();
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
      saveCurrentTrip();
      return;
    }

    if (action === "search-places") {
      await runPlaceSearch();
      return;
    }

    if (action === "save-memory") {
      saveCurrentMemory();
      return;
    }

    if (action === "save-place-to-favorite") {
      saveDiscoveryPlaceToFavorite(Number(placeIndex));
      return;
    }

    if (action === "use-favorite-in-trip") {
      addFavoriteToTrip(actionTarget.dataset.favoriteId);
      return;
    }

    if (action === "remove-favorite") {
      removeFavorite(actionTarget.dataset.favoriteId);
      return;
    }
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "auth-form") return;
    event.preventDefault();
    handleAuthSubmit(new FormData(event.target));
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "place-query") {
      state.discoveryQuery = event.target.value;
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.id !== "demo-login") return;
    state.authMode = "login";
    handleAuthSubmit(
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

function handleAuthSubmit(formData) {
  try {
    const payload = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      password: formData.get("password") || ""
    };
    const user =
      state.authMode === "signup" ? registerUser(payload) : loginUser(payload);
    state.user = user;
    state.authStatus = "";
    state.authStatusType = "";
    hydrateUserData();
    setPage("dashboard");
  } catch (error) {
    state.authStatus = translateError(error.message || String(error));
    state.authStatusType = "error";
    render();
  }
}

function hydrateUserData() {
  if (!state.user) return;
  state.trips = getTripsByUser(state.user.id);
  state.memories = getMemoriesByUser(state.user.id);
  state.favorites = getFavoritesByUser(state.user.id);
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

function saveCurrentTrip() {
  if (!state.user) return;
  const payload = collectTripForm();
  const trip = saveTrip(state.user.id, payload);
  state.editingTrip = clone(trip);
  hydrateUserData();
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
  state.discoveryStatus = t("status_searching");
  state.discoveryStatusType = "";
  render();

  try {
    const queryCandidates = [`${query} province Thailand`, `${query} Thailand`, query];
    let province = null;

    for (const candidate of queryCandidates) {
      const provinceResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(
          candidate
        )}`,
        {
          headers: { Accept: "application/json" }
        }
      );
      const provinceData = await provinceResponse.json();
      province = Array.isArray(provinceData) ? provinceData[0] : null;
      if (province) break;
    }

    if (!province) {
      state.discoveryResults = [];
      state.discoveryBounds = null;
      state.discoveryCenter = null;
      state.discoveryStatus = t("error_province_not_found");
      state.discoveryStatusType = "error";
      render();
      return;
    }

    const [south, north, west, east] = (province.boundingbox || []).map(Number);
    const centerLat = Number(province.lat);
    const centerLng = Number(province.lon);
    state.discoveryBounds =
      [south, north, west, east].every(Number.isFinite)
        ? { south, north, west, east }
        : null;
    state.discoveryCenter =
      Number.isFinite(centerLat) && Number.isFinite(centerLng)
        ? { lat: centerLat, lng: centerLng }
        : null;

    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo"](${south},${west},${north},${east});
        way["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo"](${south},${west},${north},${east});
        node["historic"](${south},${west},${north},${east});
        way["historic"](${south},${west},${north},${east});
        node["leisure"~"park|nature_reserve"](${south},${west},${north},${east});
        way["leisure"~"park|nature_reserve"](${south},${west},${north},${east});
      );
      out center 40;
    `;

    const resultsResponse = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: overpassQuery
    });
    const resultsData = await resultsResponse.json();
    const elements = Array.isArray(resultsData.elements) ? resultsData.elements : [];
    state.discoveryResults = elements
      .map((item) => {
        const lat = Number(item.lat ?? item.center?.lat);
        const lon = Number(item.lon ?? item.center?.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        const tags = item.tags || {};
        const name =
          tags["name:th"] ||
          tags.name ||
          tags["official_name:th"] ||
          tags.official_name ||
          tags.tourism ||
          tags.historic ||
          tags.leisure ||
          "Travel place";
        const addressParts = [
          tags["addr:subdistrict"],
          tags["addr:district"],
          tags["addr:province"],
          query
        ].filter(Boolean);
        return {
          id: `place_${item.type}_${item.id}`,
          name,
          display_name: Array.from(new Set(addressParts)).join(", "),
          lat: String(lat),
          lon: String(lon),
          image: ""
        };
      })
      .filter(Boolean)
      .slice(0, 12);
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

function saveCurrentMemory() {
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

  saveMemory(state.user.id, payload);
  hydrateUserData();
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
  state.discoveryResults.forEach((place) => {
    const lat = Number(place.lat);
    const lng = Number(place.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const title = place.name || (place.display_name || "").split(",")[0] || "Place";
    window.L.marker([lat, lng]).addTo(map).bindPopup(title);
    bounds.push([lat, lng]);
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [24, 24] });
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

function saveDiscoveryPlaceToFavorite(index) {
  const place = state.discoveryResults[index];
  if (!place || !state.user) return;
  saveFavorite(state.user.id, {
    name: place.name || (place.display_name || "").split(",")[0],
    address: place.display_name || "",
    lat: place.lat || "",
    lng: place.lon || "",
    note: "",
    source: "search"
  });
  hydrateUserData();
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

function removeFavorite(favoriteId) {
  deleteFavorite(favoriteId);
  hydrateUserData();
  state.discoveryStatus = t("status_favorite_removed");
  state.discoveryStatusType = "success";
  render();
}
