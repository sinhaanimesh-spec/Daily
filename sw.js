var C = "daily-v13";
self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(["./", "./index.html"]); }).catch(function () {}));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // The app page itself: try the network first so updates arrive on the next open; fall back to the cached copy offline.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var cp = res.clone();
        caches.open(C).then(function (c) { c.put("./index.html", cp); });
        return res;
      }).catch(function () { return caches.match("./index.html"); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (r) {
      return r || fetch(e.request).then(function (res) {
        var cp = res.clone();
        caches.open(C).then(function (c) { c.put(e.request, cp); });
        return res;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
