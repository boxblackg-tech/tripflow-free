const DEFAULT_SPREADSHEET_ID = "1aueJX_coe3TeHoBLwge5Ww9C15T5lg8MlBmfLrLj_T8";

const TABLES = {
  users: [
    "id",
    "name",
    "email",
    "password",
    "createdAt",
    "lastLoginAt"
  ],
  trips: [
    "id",
    "userId",
    "title",
    "category",
    "startDate",
    "endDate",
    "cover",
    "notes",
    "createdAt",
    "updatedAt",
    "itineraryJson"
  ],
  memories: [
    "id",
    "userId",
    "tripId",
    "placeName",
    "memoryDate",
    "note",
    "photoUrl",
    "lat",
    "lng",
    "createdAt"
  ],
  favorites: [
    "id",
    "userId",
    "name",
    "address",
    "lat",
    "lng",
    "note",
    "source",
    "createdAt"
  ]
};

function recreateTripFlowTables() {
  return recreateTables(openSpreadsheet(DEFAULT_SPREADSHEET_ID));
}

function dropTripFlowTables() {
  return dropTables(openSpreadsheet(DEFAULT_SPREADSHEET_ID));
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const action = payload.action || "";
    const spreadsheet = openSpreadsheet(payload.spreadsheetId);

    if (action === "seedDemoData") return jsonResponse(seedDemoData(spreadsheet));
    if (action === "registerUser") return jsonResponse(registerUser(spreadsheet, payload));
    if (action === "loginUser") return jsonResponse(loginUser(spreadsheet, payload));
    if (action === "getTripsByUser") return jsonResponse({ ok: true, items: getTripsByUser(spreadsheet, payload.userId) });
    if (action === "saveTrip") return jsonResponse({ ok: true, item: saveTrip(spreadsheet, payload.trip) });
    if (action === "deleteTrip") return jsonResponse({ ok: true, deleted: deleteTrip(spreadsheet, payload.tripId) });
    if (action === "getMemoriesByUser") return jsonResponse({ ok: true, items: getMemoriesByUser(spreadsheet, payload.userId) });
    if (action === "saveMemory") return jsonResponse({ ok: true, item: saveMemory(spreadsheet, payload.memory) });
    if (action === "getFavoritesByUser") return jsonResponse({ ok: true, items: getFavoritesByUser(spreadsheet, payload.userId) });
    if (action === "saveFavorite") return jsonResponse({ ok: true, item: saveFavorite(spreadsheet, payload.favorite) });
    if (action === "deleteFavorite") return jsonResponse({ ok: true, deleted: deleteFavorite(spreadsheet, payload.favoriteId) });
    if (action === "recreateTables") return jsonResponse(recreateTables(spreadsheet));
    if (action === "dropTables") return jsonResponse(dropTables(spreadsheet));

    throw new Error("Unknown action: " + action);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message || String(error)
    });
  }
}

function openSpreadsheet(spreadsheetId) {
  const id = spreadsheetId || DEFAULT_SPREADSHEET_ID;
  return SpreadsheetApp.openById(id);
}

function ensureTables(spreadsheet) {
  Object.keys(TABLES).forEach(function(name) {
    ensureSheet(spreadsheet, name, TABLES[name]);
  });
}

function ensureSheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const currentHeaders = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  const sameHeader = headers.length === currentHeaders.length && headers.every(function(header, index) {
    return currentHeaders[index] === header;
  });

  if (!sameHeader) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function recreateTables(spreadsheet) {
  dropTables(spreadsheet);
  ensureTables(spreadsheet);
  deletePlaceholderSheet_(spreadsheet);
  return {
    ok: true,
    message: "Tables recreated.",
    tables: Object.keys(TABLES)
  };
}

function dropTables(spreadsheet) {
  const targetSheets = Object.keys(TABLES)
    .map(function(name) {
      return spreadsheet.getSheetByName(name);
    })
    .filter(Boolean);

  if (!targetSheets.length) {
    return {
      ok: true,
      message: "No tables to delete.",
      tables: Object.keys(TABLES)
    };
  }

  let sheetsToDelete = targetSheets.slice();
  if (spreadsheet.getSheets().length === targetSheets.length) {
    const placeholder = sheetsToDelete.shift();
    placeholder.clear();
    placeholder.setName("_tripflow_placeholder");
  }

  sheetsToDelete.forEach(function(sheet) {
    spreadsheet.deleteSheet(sheet);
  });

  return {
    ok: true,
    message: "Tables deleted.",
    tables: Object.keys(TABLES)
  };
}

function getRows(spreadsheet, sheetName) {
  const sheet = ensureSheet(spreadsheet, sheetName, TABLES[sheetName]);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  return values.slice(1).filter(function(row) {
    return row.some(function(cell) { return cell !== ""; });
  }).map(function(row) {
    const item = {};
    headers.forEach(function(header, index) {
      item[header] = row[index];
    });
    return normalizeItem(sheetName, item);
  });
}

function writeRows(spreadsheet, sheetName, items) {
  const headers = TABLES[sheetName];
  const sheet = ensureSheet(spreadsheet, sheetName, headers);
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);

  if (!items.length) return;

  const rows = items.map(function(item) {
    return headers.map(function(header) {
      return item[header] == null ? "" : item[header];
    });
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function normalizeItem(sheetName, item) {
  if (sheetName === "trips") {
    item.itinerary = safeJsonParse(item.itineraryJson, []);
    delete item.itineraryJson;
  }
  return item;
}

function prepareItem(sheetName, item) {
  const copy = Object.assign({}, item);
  if (sheetName === "trips") {
    copy.itineraryJson = JSON.stringify(copy.itinerary || []);
    delete copy.itinerary;
  }
  return copy;
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function seedDemoData(spreadsheet) {
  ensureTables(spreadsheet);
  const users = getRows(spreadsheet, "users");
  if (users.length) {
    return {
      ok: true,
      users: users,
      trips: getRows(spreadsheet, "trips"),
      memories: getRows(spreadsheet, "memories"),
      favorites: getRows(spreadsheet, "favorites")
    };
  }

  const now = new Date().toISOString();
  const demoUserId = uid_("usr");
  const demoTripId = uid_("trip");
  const seedUsers = [
    {
      id: demoUserId,
      name: "Fern Demo",
      email: "demo@tripflow.app",
      password: "1234",
      createdAt: now,
      lastLoginAt: now
    }
  ];
  const seedTrips = [
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
          id: uid_("item"),
          dayIndex: 1,
          title: "Breakfast and espresso",
          startTime: "09:00",
          endTime: "10:30",
          placeName: "Ari neighborhood",
          address: "Phaya Thai, Bangkok",
          lat: "13.7791",
          lng: "100.5447",
          note: "Start slow with brunch."
        }
      ]
    }
  ];
  const seedMemories = [
    {
      id: uid_("mem"),
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

  writeRows(spreadsheet, "users", seedUsers.map(function(item) { return prepareItem("users", item); }));
  writeRows(spreadsheet, "trips", seedTrips.map(function(item) { return prepareItem("trips", item); }));
  writeRows(spreadsheet, "memories", seedMemories.map(function(item) { return prepareItem("memories", item); }));
  writeRows(spreadsheet, "favorites", []);

  return {
    ok: true,
    users: seedUsers,
    trips: seedTrips,
    memories: seedMemories,
    favorites: []
  };
}

function registerUser(spreadsheet, payload) {
  ensureTables(spreadsheet);
  const users = getRows(spreadsheet, "users");
  const normalizedEmail = String(payload.email || "").trim().toLowerCase();
  if (!payload.name || !normalizedEmail || !payload.password) {
    throw new Error("Please complete name, email, and password.");
  }
  if (users.some(function(user) { return user.email === normalizedEmail; })) {
    throw new Error("This email is already registered.");
  }

  const now = new Date().toISOString();
  const user = {
    id: uid_("usr"),
    name: String(payload.name).trim(),
    email: normalizedEmail,
    password: String(payload.password),
    createdAt: now,
    lastLoginAt: now
  };

  users.push(user);
  writeRows(spreadsheet, "users", users.map(function(item) { return prepareItem("users", item); }));
  return {
    ok: true,
    user: safeUser_(user)
  };
}

function loginUser(spreadsheet, payload) {
  ensureTables(spreadsheet);
  const users = getRows(spreadsheet, "users");
  const normalizedEmail = String(payload.email || "").trim().toLowerCase();
  const user = users.find(function(item) {
    return item.email === normalizedEmail && item.password === String(payload.password || "");
  });

  if (!user) {
    throw new Error("Incorrect email or password.");
  }

  user.lastLoginAt = new Date().toISOString();
  writeRows(spreadsheet, "users", users.map(function(item) { return prepareItem("users", item); }));
  return {
    ok: true,
    user: safeUser_(user)
  };
}

function getTripsByUser(spreadsheet, userId) {
  return getRows(spreadsheet, "trips")
    .filter(function(trip) { return trip.userId === userId; })
    .sort(function(a, b) {
      return String(b.startDate || "").localeCompare(String(a.startDate || ""));
    });
}

function saveTrip(spreadsheet, trip) {
  ensureTables(spreadsheet);
  const trips = getRows(spreadsheet, "trips");
  const nextTrip = Object.assign({}, trip);
  const index = trips.findIndex(function(item) { return item.id === nextTrip.id; });
  if (index >= 0) {
    trips[index] = nextTrip;
  } else {
    trips.unshift(nextTrip);
  }
  writeRows(spreadsheet, "trips", trips.map(function(item) { return prepareItem("trips", item); }));
  return nextTrip;
}

function deleteTrip(spreadsheet, tripId) {
  const trips = getRows(spreadsheet, "trips").filter(function(item) { return item.id !== tripId; });
  const memories = getRows(spreadsheet, "memories").filter(function(item) { return item.tripId !== tripId; });
  writeRows(spreadsheet, "trips", trips.map(function(item) { return prepareItem("trips", item); }));
  writeRows(spreadsheet, "memories", memories.map(function(item) { return prepareItem("memories", item); }));
  return true;
}

function getMemoriesByUser(spreadsheet, userId) {
  return getRows(spreadsheet, "memories")
    .filter(function(memory) { return memory.userId === userId; })
    .sort(function(a, b) {
      return String(b.memoryDate || "").localeCompare(String(a.memoryDate || ""));
    });
}

function saveMemory(spreadsheet, memory) {
  ensureTables(spreadsheet);
  const memories = getRows(spreadsheet, "memories");
  memories.unshift(memory);
  writeRows(spreadsheet, "memories", memories.map(function(item) { return prepareItem("memories", item); }));
  return memory;
}

function getFavoritesByUser(spreadsheet, userId) {
  return getRows(spreadsheet, "favorites")
    .filter(function(favorite) { return favorite.userId === userId; })
    .sort(function(a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
}

function saveFavorite(spreadsheet, favorite) {
  ensureTables(spreadsheet);
  const favorites = getRows(spreadsheet, "favorites");
  const index = favorites.findIndex(function(item) { return item.id === favorite.id; });
  if (index >= 0) {
    favorites[index] = favorite;
  } else {
    favorites.unshift(favorite);
  }
  writeRows(spreadsheet, "favorites", favorites.map(function(item) { return prepareItem("favorites", item); }));
  return favorite;
}

function deleteFavorite(spreadsheet, favoriteId) {
  const favorites = getRows(spreadsheet, "favorites").filter(function(item) { return item.id !== favoriteId; });
  writeRows(spreadsheet, "favorites", favorites.map(function(item) { return prepareItem("favorites", item); }));
  return true;
}

function safeUser_(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

function uid_(prefix) {
  return prefix + "_" + Utilities.getUuid().slice(0, 8);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function deletePlaceholderSheet_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName("_tripflow_placeholder");
  if (sheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(sheet);
  }
}
