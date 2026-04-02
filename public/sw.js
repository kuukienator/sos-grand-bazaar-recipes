const CACHE_NAME = "sos-grand-bazaar-v2";
const FONT_CACHE = "sos-fonts-v1";

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(["/", "/index.html"])),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME && key !== FONT_CACHE)
						.map((key) => caches.delete(key)),
				),
			),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	if (url.hostname === "fonts.gstatic.com") {
		event.respondWith(
			caches.match(event.request).then((cached) => {
				if (cached) return cached;
				return fetch(event.request).then((response) => {
					const clone = response.clone();
					caches
						.open(FONT_CACHE)
						.then((cache) => cache.put(event.request, clone));
					return response;
				});
			}),
		);
		return;
	}

	if (url.origin !== location.origin) return;

	event.respondWith(
		caches.match(event.request).then((cached) => {
			if (cached) return cached;

			return fetch(event.request).then((response) => {
				if (!response || response.status !== 200 || response.type !== "basic") {
					return response;
				}

				const clone = response.clone();
				caches
					.open(CACHE_NAME)
					.then((cache) => cache.put(event.request, clone));
				return response;
			});
		}),
	);
});
