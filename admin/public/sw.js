// Service worker for the FemSaidia admin PWA.
//  • Push: Itika admin notifications (new responder registrations, en-route).
//  • Caching: app-shell so the admin is installable and opens offline. Only
//    SAME-ORIGIN GETs are cached — Supabase API / auth calls (cross-origin) are
//    never intercepted, so live data always goes to the network.
// Bump CACHE to force old caches out on the next activate.
const CACHE = 'fsadmin-v2'
const SHELL = ['/', '/index.html']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return   // Supabase & other hosts → untouched

  // Navigations: network-first (always try for the freshest app), fall back to
  // the cached shell when offline. Keeps new deploys from being shadowed.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('/index.html', copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    )
    return
  }

  // Same-origin assets: stale-while-revalidate (fast, self-healing on new builds
  // because Vite fingerprints filenames).
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})

// ── Push (unchanged) ─────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let n = { title: 'Itika Admin', body: '', tag: 'itika-admin' }
  try {
    if (event.data) {
      const d = event.data.json()
      if (d && (d.title || d.body)) {
        n = { title: d.title || n.title, body: d.body || n.body, tag: d.tag || 'itika-admin' }
      }
    }
  } catch (_) { /* non-JSON payload — keep default */ }
  event.waitUntil(self.registration.showNotification(n.title, { body: n.body, tag: n.tag }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => {
    for (const c of list) { if ('focus' in c) return c.focus() }
    if (self.clients.openWindow) return self.clients.openWindow('/')
  }))
})
