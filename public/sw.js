// Service Worker para Treevüt 3.0
// Maneja notificaciones push y caché de recursos

const CACHE_NAME = 'treevut-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/treevut-icon.png',
    '/treevut-badge.png',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar solicitudes de red
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devolver del caché si existe, sino hacer fetch
                return response || fetch(event.request);
            })
    );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    const data = event.notification.data;

    if (action === 'claim' && data.type === 'challenge_completed') {
        // Abrir la app en la pestaña de Senda
        event.waitUntil(
            clients.openWindow('/?tab=senda&claim=' + data.challengeId)
        );
    } else if (action === 'dismiss') {
        // Solo cerrar la notificación
        return;
    } else {
        // Clic en el cuerpo de la notificación - abrir la app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Manejar mensajes push (para futuras integraciones con backend)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const title = data.title || 'Treevüt';
    const options = {
        body: data.body || 'Tienes una nueva notificación',
        icon: data.icon || '/treevut-icon.png',
        badge: '/treevut-badge.png',
        tag: data.tag || 'treevut-notification',
        data: data.data || {},
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
