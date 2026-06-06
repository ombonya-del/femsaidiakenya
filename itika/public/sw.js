const CACHE = "itika-v4"
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
  let data = {}
  try { data = event.data?.json() || {} } catch(e) {}
  const title = data.title || "\ud83d\udea8 Emergency Alert \u2014 Itika"
  const body  = data.body  || "An emergency has been reported in your county. Open Itika NOW to respond."

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  "/icon-192.png",
      badge: "/icon-192.png",
      tag:   "itika-alert",
    })
  )
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type:"window" }).then(list => {
      for (const client of list) {
        if (client.url.includes("itika") && "focus" in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow("/")
    })
  )
})
