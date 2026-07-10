const CACHE = "itika-v6"
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
  // Default to the emergency-alert message (back-compat with the old "ALERT"
  // string payload); override with the real title/body when send-push provides
  // structured JSON (registration / activation / response notifications).
  let n = {
    title: "EMERGENCY ALERT - Itika",
    body: "An emergency has been reported in your county. Open Itika NOW to respond.",
    tag: "itika-alert",
  }
  try {
    if (event.data) {
      const d = event.data.json()
      if (d && (d.title || d.body)) {
        n = { title: d.title || n.title, body: d.body || n.body, tag: d.tag || "itika" }
      }
    }
  } catch (_) {
    // payload was not JSON — keep the emergency default
  }
  event.waitUntil(self.registration.showNotification(n.title, { body: n.body, tag: n.tag }))
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  event.waitUntil(clients.matchAll({type:"window"}).then(list => {
    for (const c of list) { if (c.url.includes("itika") && "focus" in c) return c.focus() }
    if (clients.openWindow) return clients.openWindow("/")
  }))
})
