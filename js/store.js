import { getSheetBackendConfig } from "./sheetConfig.js";
import { byNewestDate, todayIso, uid } from "./utils.js";

const KEYS = {
  users: "tripflow_free_users",
  session: "tripflow_free_session",
  trips: "tripflow_free_trips",
  memories: "tripflow_free_memories",
  favorites: "tripflow_free_favorites"
};

const DEFAULT_CATEGORIES = ["Mountain", "Sea", "Cafe", "City", "Road Trip", "Family"];

function read(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    return [];
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function hasRemoteBackend() {
  const config = getSheetBackendConfig();
  return Boolean(config.webAppUrl);
}

async function callBackend(action, payload = {}) {
  const config = getSheetBackendConfig();
  if (!config.webAppUrl) {
    throw new Error("Remote backend is not configured yet.");
  }

  const response = await fetch(config.webAppUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "text/plain;charset=UTF-8"
    },
    body: JSON.stringify({
      action,
      spreadsheetId: config.spreadsheetId,
      ...payload
    })
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || "Remote request failed.");
  }
  return data;
}

function syncLocalCollection(key, collection) {
  write(key, collection);
  return collection;
}

export function getConfig() {
  return {
    appName: "TripFlow Free",
    categories: DEFAULT_CATEGORIES
  };
}

export function getSession() {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
}

export async function seedDemoData() {
  if (hasRemoteBackend()) {
    try {
      const data = await callBackend("seedDemoData");
      syncLocalCollection(KEYS.users, data.users || []);
      syncLocalCollection(KEYS.trips, data.trips || []);
      syncLocalCollection(KEYS.memories, data.memories || []);
      syncLocalCollection(KEYS.favorites, data.favorites || []);
      return;
    } catch (error) {
      console.warn("Remote seed failed, using local cache instead.", error);
    }
  }

  if (read(KEYS.users).length) return;

  const now = new Date().toISOString();
  const demoUserId = uid("usr");
  const demoTripId = uid("trip");
  const users = [
    {
      id: demoUserId,
      name: "Fern Demo",
      email: "demo@tripflow.app",
      password: "1234",
      createdAt: now,
      lastLoginAt: now
    }
  ];
  const trips = [
    {
      id: demoTripId,
      userId: demoUserId,
      title: "Bangkok Cafe Weekend",
      category: "Cafe",
      startDate: "2026-04-20",
      endDate: "2026-04-21",
      cover: "Coffee",
      notes: "Slow weekend with coffee, food, and old town walks.",
      createdAt: now,
      updatedAt: now,
      itinerary: [
        {
          id: uid("item"),
          dayIndex: 1,
          title: "Breakfast and espresso",
          startTime: "09:00",
          endTime: "10:30",
          placeName: "Ari neighborhood",
          address: "Phaya Thai, Bangkok",
          lat: "13.7791",
          lng: "100.5447",
          note: "Start slow with brunch."
        },
        {
          id: uid("item"),
          dayIndex: 1,
          title: "Photo walk",
          startTime: "13:00",
          endTime: "16:00",
          placeName: "Talat Noi",
          address: "Samphanthawong, Bangkok",
          lat: "13.7368",
          lng: "100.5132",
          note: "Street art and small alleys."
        }
      ]
    }
  ];
  const memories = [
    {
      id: uid("mem"),
      userId: demoUserId,
      tripId: demoTripId,
      placeName: "Talat Noi",
      memoryDate: "2026-04-20",
      note: "Golden light in the late afternoon.",
      photoUrl: "",
      lat: "13.7368",
      lng: "100.5132",
      createdAt: now
    }
  ];

  write(KEYS.users, users);
  write(KEYS.trips, trips);
  write(KEYS.memories, memories);
  write(KEYS.favorites, []);
}

export async function registerUser({ name, email, password }) {
  if (hasRemoteBackend()) {
    const data = await callBackend("registerUser", { name, email, password });
    localStorage.setItem(KEYS.session, JSON.stringify(data.user));
    return data.user;
  }

  const users = read(KEYS.users);
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!name || !normalizedEmail || !password) {
    throw new Error("Please complete name, email, and password.");
  }
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("This email is already registered.");
  }

  const now = new Date().toISOString();
  const user = {
    id: uid("usr"),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: now,
    lastLoginAt: now
  };
  users.push(user);
  write(KEYS.users, users);
  localStorage.setItem(KEYS.session, JSON.stringify(safeUser(user)));
  return safeUser(user);
}

export async function loginUser({ email, password }) {
  if (hasRemoteBackend()) {
    const data = await callBackend("loginUser", { email, password });
    localStorage.setItem(KEYS.session, JSON.stringify(data.user));
    return data.user;
  }

  const users = read(KEYS.users);
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === String(password || "")
  );

  if (!user) {
    throw new Error("Incorrect email or password.");
  }

  user.lastLoginAt = new Date().toISOString();
  write(KEYS.users, users);
  localStorage.setItem(KEYS.session, JSON.stringify(safeUser(user)));
  return safeUser(user);
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

export async function getTripsByUser(userId) {
  if (hasRemoteBackend()) {
    try {
      const data = await callBackend("getTripsByUser", { userId });
      return syncLocalCollection(KEYS.trips, data.items || [])
        .filter((trip) => trip.userId === userId)
        .sort((a, b) => byNewestDate(a, b, "startDate"));
    } catch (error) {
      console.warn("Remote trips fetch failed, using local cache instead.", error);
    }
  }

  return read(KEYS.trips)
    .filter((trip) => trip.userId === userId)
    .sort((a, b) => byNewestDate(a, b, "startDate"));
}

export async function saveTrip(userId, payload) {
  const now = new Date().toISOString();
  const tripId = payload.id || uid("trip");
  const nextTrip = {
    id: tripId,
    userId,
    title: payload.title || "Untitled Trip",
    category: payload.category || "City",
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
    cover: payload.cover || "Trip",
    notes: payload.notes || "",
    createdAt: payload.createdAt || now,
    updatedAt: now,
    itinerary: (payload.itinerary || []).map((item) => ({
      id: item.id || uid("item"),
      dayIndex: item.dayIndex || 1,
      title: item.title || "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      placeName: item.placeName || "",
      address: item.address || "",
      lat: item.lat || "",
      lng: item.lng || "",
      note: item.note || ""
    }))
  };

  if (hasRemoteBackend()) {
    const data = await callBackend("saveTrip", { trip: nextTrip });
    return data.item;
  }

  const trips = read(KEYS.trips);
  const index = trips.findIndex((trip) => trip.id === tripId);
  if (index >= 0) {
    trips[index] = nextTrip;
  } else {
    trips.unshift(nextTrip);
  }
  write(KEYS.trips, trips);
  return nextTrip;
}

export async function deleteTrip(tripId) {
  if (hasRemoteBackend()) {
    await callBackend("deleteTrip", { tripId });
    return;
  }

  write(
    KEYS.trips,
    read(KEYS.trips).filter((trip) => trip.id !== tripId)
  );
  write(
    KEYS.memories,
    read(KEYS.memories).filter((memory) => memory.tripId !== tripId)
  );
}

export async function getMemoriesByUser(userId) {
  if (hasRemoteBackend()) {
    try {
      const data = await callBackend("getMemoriesByUser", { userId });
      return syncLocalCollection(KEYS.memories, data.items || [])
        .filter((memory) => memory.userId === userId)
        .sort((a, b) => byNewestDate(a, b, "memoryDate"));
    } catch (error) {
      console.warn("Remote memories fetch failed, using local cache instead.", error);
    }
  }

  return read(KEYS.memories)
    .filter((memory) => memory.userId === userId)
    .sort((a, b) => byNewestDate(a, b, "memoryDate"));
}

export async function saveMemory(userId, payload) {
  const now = new Date().toISOString();
  const memory = {
    id: payload.id || uid("mem"),
    userId,
    tripId: payload.tripId || "",
    placeName: payload.placeName || "",
    memoryDate: payload.memoryDate || todayIso(),
    note: payload.note || "",
    photoUrl: payload.photoUrl || "",
    lat: payload.lat || "",
    lng: payload.lng || "",
    createdAt: payload.createdAt || now
  };

  if (hasRemoteBackend()) {
    const data = await callBackend("saveMemory", { memory });
    return data.item;
  }

  const memories = read(KEYS.memories);
  memories.unshift(memory);
  write(KEYS.memories, memories);
  return memory;
}

export async function getFavoritesByUser(userId) {
  if (hasRemoteBackend()) {
    try {
      const data = await callBackend("getFavoritesByUser", { userId });
      return syncLocalCollection(KEYS.favorites, data.items || [])
        .filter((favorite) => favorite.userId === userId)
        .sort((a, b) => byNewestDate(a, b, "createdAt"));
    } catch (error) {
      console.warn("Remote favorites fetch failed, using local cache instead.", error);
    }
  }

  return read(KEYS.favorites)
    .filter((favorite) => favorite.userId === userId)
    .sort((a, b) => byNewestDate(a, b, "createdAt"));
}

export async function saveFavorite(userId, payload) {
  const now = new Date().toISOString();
  const favorite = {
    id: payload.id || uid("fav"),
    userId,
    name: payload.name || "",
    address: payload.address || "",
    lat: payload.lat || "",
    lng: payload.lng || "",
    note: payload.note || "",
    source: payload.source || "manual",
    createdAt: payload.createdAt || now
  };

  if (hasRemoteBackend()) {
    const data = await callBackend("saveFavorite", { favorite });
    return data.item;
  }

  const favorites = read(KEYS.favorites);
  const existingIndex = favorites.findIndex((item) => item.id === favorite.id);
  if (existingIndex >= 0) {
    favorites[existingIndex] = favorite;
  } else {
    favorites.unshift(favorite);
  }
  write(KEYS.favorites, favorites);
  return favorite;
}

export async function deleteFavorite(favoriteId) {
  if (hasRemoteBackend()) {
    await callBackend("deleteFavorite", { favoriteId });
    return;
  }

  write(
    KEYS.favorites,
    read(KEYS.favorites).filter((favorite) => favorite.id !== favoriteId)
  );
}
