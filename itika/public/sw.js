const CACHE = "itika-v3"
const SHELL = ["/", "/index.html"]

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────────
self.addEventListener("push", event => {
  let data = {}; try { data = event.data?.json() || {} } catch(e) {}
  const title = data.title || "Itika Alert"
  const body  = data.body  || "A new alert has been dispatched in your county."

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:   "/icon-192.png",
      badge:  "/icon-192.png",
      tag:    "itika-alert",
      renotify: true,
      requireInteraction: true,
      data:   data.data || {},
      actions: [
        { action: "view",    title: "View Alert" },
        { action: "dismiss", title: "Dismiss" },
      ],
      vibrate: [200, 100, 200, 100, 200],
    })
  )
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  if (event.action === "view" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type:"window" }).then(list => {
        for (const client of list) {
          if (client.url.includes("itika") && "focus" in client) return client.focus()
        }
        if (clients.openWindow) return clients.openWindow("/")
      })
    )
  }
})
