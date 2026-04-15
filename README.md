# TripFlow Free

Free mobile-first trip planner PWA with:

- Login and signup
- Trip planning and itinerary editor
- Interactive map and place discovery
- Memory timeline
- Offline-friendly shell with service worker
- No GAS
- No paid backend

## Stack

- Static HTML, CSS, and JavaScript modules
- Local browser storage for users, trips, and memories
- Leaflet + OpenStreetMap for the map
- Nominatim for free place search

## Project Structure

- `index.html` : app entry
- `styles/app.css` : mobile-first UI
- `js/app.js` : main app logic and routing
- `js/store.js` : local storage data layer
- `js/utils.js` : shared helpers
- `js/ui.js` : app shell renderer
- `js/pages/loginPage.js` : login screen
- `js/pages/dashboardPage.js` : trip dashboard
- `js/pages/editorPage.js` : create and edit trip
- `js/pages/discoveryPage.js` : map and place discovery
- `js/pages/memoryPage.js` : memory timeline
- `manifest.webmanifest` : PWA manifest
- `service-worker.js` : cache for the app shell

## Demo Login

- Email: `demo@tripflow.app`
- Password: `1234`

## How To Use For Free

### Option 1: Open locally

Open `index.html` in a browser.

Notes:

- Basic app usage works from the local file in many browsers.
- PWA install and service worker work best when served over `http` or `https`.

### Option 2: Netlify Drop

1. Zip the `tripflow-free` folder
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the zip file into the page
4. Open the generated URL on mobile

This is the easiest fully free deployment path.

### Option 3: GitHub Pages

1. Create a GitHub repository
2. Upload the contents of `tripflow-free`
3. Enable GitHub Pages from the repository settings
4. Open the published URL on mobile

## Important Notes

- User data is stored in the current browser only
- If you clear browser storage, local data will be removed
- Place search uses OpenStreetMap Nominatim, so search should be used politely and not spammed
- Result images in discovery are placeholders to keep the UI complete without paid APIs

## Good Next Upgrades

- Sync data with Supabase for cross-device login
- Add real photo upload
- Add drag-and-drop itinerary sorting
- Add favorites and saved places
