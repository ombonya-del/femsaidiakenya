const CACHE = "itika-v5"
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
      .then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return res })
      .catch(() => caches.match(e.request))
  )
})

self.addEventListener("push", event => {
  event.waitUntil(
    self.registration.showNotification("EMERGENCY ALERT - Itika", {
      body: "An emergency has been reported in your county. Open Itika NOW to respond.",
      tag: "itika-alert"
    })
  )
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  event.waitUntil(clients.matchAll({type:"window"}).then(list => {
    for (const c of list) { if (c.url.includes("itika") && "focus" in c) return c.focus() }
    if (clients.openWindow) return clients.openWindow("/")
  }))
})
