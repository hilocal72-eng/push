
// Service Worker for PushNotify Tester
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'New Notification', body: 'Push event received' };
  
  const options = {
    body: data.body,
    icon: '/icon.png', // You can host an icon on Cloudflare
    badge: '/badge.png',
    data: {
      url: self.location.origin
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
