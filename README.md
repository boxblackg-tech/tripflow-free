# TripFlow Free

Mobile-first trip planner PWA with:

- Login and signup
- Trip planning and itinerary editor
- Interactive map and province-based discovery
- Memory timeline
- Starred places
- Google Sheet storage support via Apps Script

## Stack

- Static HTML, CSS, and JavaScript modules
- Leaflet + OpenStreetMap for the map
- Nominatim + Overpass for free location discovery
- Google Apps Script + Google Sheets for data storage
- Local cache fallback when the Apps Script endpoint is not set yet

## Project Structure

- `index.html` : app entry
- `styles/app.css` : mobile-first UI
- `js/app.js` : main app logic and routing
- `js/store.js` : data layer with Google Sheets support
- `js/sheetConfig.js` : spreadsheet id and web app URL config
- `js/utils.js` : shared helpers
- `js/ui.js` : app shell renderer
- `js/pages/loginPage.js` : login screen
- `js/pages/dashboardPage.js` : trip dashboard
- `js/pages/editorPage.js` : create and edit trip
- `js/pages/discoveryPage.js` : map and place discovery
- `js/pages/memoryPage.js` : memory timeline
- `gas/Code.gs` : Google Apps Script backend for the sheet
- `gas/appsscript.json` : Apps Script manifest
- `manifest.webmanifest` : PWA manifest
- `service-worker.js` : cache for the app shell

## Google Sheet Target

This repo is prepared for the spreadsheet:

- Spreadsheet ID: `1aueJX_coe3TeHoBLwge5Ww9C15T5lg8MlBmfLrLj_T8`

The Apps Script backend can:

- Create the tables automatically as sheet tabs
- Recreate all tables
- Delete all tables
- Read and write users, trips, memories, and favorites

## One-Time Setup

### 1. Create the Apps Script project

1. Open the Google Sheet
2. Go to `Extensions > Apps Script`
3. Replace the default code with the contents of `gas/Code.gs`
4. Replace the manifest with `gas/appsscript.json`
5. Save the project

### 2. Deploy the Apps Script as a web app

1. Click `Deploy > New deployment`
2. Choose `Web app`
3. Execute as `Me`
4. Who has access: choose the option that matches your use
5. Deploy and copy the generated web app URL

### 3. Put the web app URL into the frontend

Open `js/sheetConfig.js` and set:

```js
export const SHEET_BACKEND = {
  spreadsheetId: "1aueJX_coe3TeHoBLwge5Ww9C15T5lg8MlBmfLrLj_T8",
  webAppUrl: "PASTE_YOUR_WEB_APP_URL_HERE"
};
```

Then push the updated repo again.

## Data Tables In Google Sheets

The backend creates these sheet tabs automatically:

- `users`
- `trips`
- `memories`
- `favorites`

## Admin Actions

The backend supports these maintenance actions:

- `recreateTables` : delete and recreate all tabs
- `dropTables` : delete all tabs used by the app

You can call them from Apps Script editor or add a temporary requester if needed.

## Demo Login

- Email: `demo@tripflow.app`
- Password: `1234`

If the Google Sheet is empty, the backend seeds this demo account automatically.

## Free Deployment

### Option 1: GitHub Pages

1. Push this repo to GitHub
2. Enable GitHub Pages
3. Open the published URL on mobile

### Option 2: Netlify Drop

1. Zip the repo contents
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drop the zip file
4. Open the generated URL on mobile

## Important Notes

- If `webAppUrl` is still empty, the app falls back to local browser cache
- To save real data into Google Sheets, the Apps Script web app must be deployed first
- Place discovery uses OpenStreetMap services, so search should be used politely
- Result images in discovery are placeholders to keep the interface complete without paid APIs
