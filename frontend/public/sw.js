// Minimal service worker — makes the app installable ("Add to Home Screen").
// It intentionally does NOT cache anything, so the site is always up to date.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {
  // Pass through to the network. No offline caching.
})
