// Push-only service worker for Itika Command. No fetch caching (won't shadow the
// SPA) — it exists to receive coordinator notifications (new registrations,
// responders en route).

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()))

self.addEventListener("push", event => {
  let n = { title: "Itika Command", body: "", tag: "itika-admin" }
  try {
    if (event.data) {
      const d = event.data.json()
      if (d && (d.title || d.body)) {
        n = { title: d.title || n.title, body: d.body || n.body, tag: d.tag || "itika-admin" }
      }
    }
  } catch (_) { /* non-JSON payload — keep default */ }
  event.waitUntil(self.registration.showNotification(n.title, { body: n.body, tag: n.tag }))
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  event.waitUntil(self.clients.matchAll({ type: "window" }).then(list => {
    for (const c of list) { if ("focus" in c) return c.focus() }
    if (self.clients.openWindow) return self.clients.openWindow("/")
  }))
})
