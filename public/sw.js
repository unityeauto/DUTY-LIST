// Service worker for Volvo Bus Duty Allocation PWA.
//
// Caching strategy:
// - Static assets (_next/static, icons): cache-first — content-hashed, safe forever.
// - Navigations / API data: network-first with an offline fallback page.
// - POST / server actions are NEVER cached or queued: duty assignment writes
//   require a live connection so conflict checks always run on fresh data.

const CACHE_NAME = 'volvo-duty-v1'
const OFFLINE_URL = '/offline.html'

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Never intercept non-GET requests (server actions, mutations).
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Only handle same-origin requests (skip Supabase API calls entirely —
  // auth/data must always hit the network).
  if (url.origin !== self.location.origin) return

  // Static assets: cache-first.
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            }
            return response
          })
      )
    )
    return
  }

  // Page navigations: network-first, offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || Response.error())
      )
    )
  }
})
