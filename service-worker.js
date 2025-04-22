// Define a cache name
const CACHE_NAME = 'level-up-life-cache-v1';

// List the files you want to cache
const urlsToCache = [
  '.', // Represents the root directory (often index.html)
  'index.html',
  'style.css',
  'script.js',
  // IMPORTANT: Add paths to your icons here!
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'icons/icon-180x180.png',
  // Add other essential assets if you have them (e.g., fonts loaded locally)
];

// Install event: Cache the files
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event');
  // Prevent the worker from being killed until the cache is updated.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // Add all the specified URLs to the cache.
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Cache populated successfully');
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
});

// Activate event: Clean up old caches (optional but good practice)
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If this cache name isn't the current one, delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[Service Worker] Claiming clients');
        // Take control of currently open pages immediately.
        return self.clients.claim();
    })
  );
});


// Fetch event: Serve assets from cache or network
self.addEventListener('fetch', event => {
  // console.log('[Service Worker] Fetching:', event.request.url);
  // Use a Cache First strategy
  event.respondWith(
    caches.match(event.request) // Check if the request is in the cache
      .then(response => {
        // If it is in the cache, return the cached response
        if (response) {
          // console.log('[Service Worker] Cache hit:', event.request.url);
          return response;
        }
        // If it's not in the cache, fetch it from the network
        // console.log('[Service Worker] Cache miss, fetching from network:', event.request.url);
        return fetch(event.request)
            // Optional: Cache the new response for next time (be careful with dynamic data!)
            // .then(networkResponse => {
            //   if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            //     return networkResponse; // Don't cache errors or cross-origin resources without CORS
            //   }
            //   // Clone response as it can only be consumed once
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME)
            //     .then(cache => {
            //       cache.put(event.request, responseToCache);
            //     });
            //   return networkResponse;
            // });
            ; // Simpler: just return network response without caching dynamic requests
      })
      .catch(error => {
        // Handle fetch errors, maybe serve a fallback page?
        console.error('[Service Worker] Fetch failed:', error);
        // Example: return caches.match('offline.html'); // If you have an offline fallback page
      })
  );
});