const CACHE_NAME = "personal-os-web-v1"

const PRECACHE_URLS = [
  "/",
  "/assets/favicon.ico",
  "/assets/favicon-96x96.png",
  "/assets/icon-light.png",
  "/assets/icon-dark.png",
  "/assets/apple-touch-icon.png",
  "/assets/icon.png",
  "/assets/icon-512x512.png",
  "/assets/icon-192x192.png",
  "/manifest.json",
  "/images/app-banner-v1.png",
  "/images/welcome-ilustration-light.png",
  "/images/welcome-ilustration-dark.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  const url = new URL(event.request.url)

  if (url.pathname.startsWith("/api/")) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone()
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

self.addEventListener("push", (event) => {
  if (!event.data) {
    return
  }

  let payload = { title: "Personal OS", body: "", data: {} }

  try {
    payload = { ...payload, ...event.data.json() }
  } catch {
    payload.body = event.data.text()
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const hasFocusedClient = clients.some((client) => client.focused)
        if (hasFocusedClient) {
          return undefined
        }

        return self.registration.showNotification(
          payload.title ?? "Personal OS",
          {
            body: payload.body ?? "",
            data: payload.data ?? {},
            icon: "/favicon.ico",
          }
        )
      })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const targetUrl =
    typeof event.notification.data?.url === "string"
      ? event.notification.data.url
      : "/notifications"

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            return client.focus()
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }

        return undefined
      })
  )
})
