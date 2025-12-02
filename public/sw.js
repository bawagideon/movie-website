// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== API_CACHE)
          .map(name => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - cache strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
    return
  }

  // Static assets - cache first with network fallback
  event.respondWith(cacheFirstStrategy(request, CACHE_NAME))
})

/**
 * Network first strategy - try network, fallback to cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

/**
 * Cache first strategy - use cache, fallback to network
 */
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-wishlist') {
    event.waitUntil(syncWishlist())
  }
})

async function syncWishlist() {
  try {
    const db = await openDB()
    const pendingActions = await db.getAllFromIndex('pending', 'synced', false)

    for (const action of pendingActions) {
      try {
        await fetch(`/api/wishlist/${action.id}`, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })

        const tx = db.transaction('pending', 'readwrite')
        await tx.store.delete(action.id)
      } catch (error) {
        console.error('Sync error:', error)
      }
    }
  } catch (error) {
    console.error('Background sync error:', error)
  }
}

/**
 * Open IndexedDB for offline storage
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('Cinema80', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = event => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending')) {
        const store = db.createObjectStore('pending', { keyPath: 'id' })
        store.createIndex('synced', 'synced', { unique: false })
      }
    }
  })
}

/**
 * Push notification handler
 */
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'cinema80',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Cinema80', options)
  )
})

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].url === '/' && 'focus' in clientList[i]) {
            return clientList[i].focus()
          }
        }
        // Open new window if not found
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
    )
  }
})
