// Offline-Speicher für den Patientenmonitor.
// Beim ersten Aufruf werden alle Dateien auf dem iPad gespeichert.
// Danach kommt die Seite immer aus dem Speicher (läuft also ohne Netz);
// gibt es Netz, wird im Hintergrund die neueste Version nachgeladen
// und beim nächsten Start angezeigt.

const CACHE = "patientenmonitor";
const DATEIEN = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const gespeichert = await c.match(e.request, { ignoreSearch: true });
      const neu = fetch(e.request, { cache: "no-cache" })
        .then(antwort => { if (antwort.ok) c.put(e.request, antwort.clone()); return antwort; })
        .catch(() => null);
      return gespeichert || (await neu) || c.match("./");
    })
  );
});
