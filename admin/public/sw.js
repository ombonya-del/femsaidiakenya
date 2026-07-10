// Push-only service worker for the FemSaidia admin app. It does NOT cache or
// intercept fetches (so it can't shadow the SPA) — it exists purely to receive
// Itika admin notifications (new responder registrations, responders en route).

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()))

self.addEventListener("push", event => {
  let n = { title: "Itika Admin", body: "", tag: "itika-admin" }
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
