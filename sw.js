
/* 
  SIMPLE PUSH LAB SERVICE WORKER 
  Note: Access-Control-Allow-Origin headers must be set by your server (e.g. Cloudflare)
  when serving this file if you intend to register it across different subdomains.
*/

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { 
    title: 'Push Lab Alert', 
    body: 'Test notification received successfully!' 
  };

  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: 'https://picsum.photos/192/192?random=sw',
    badge: 'https://picsum.photos/96/96?random=badge',
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'Open App' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
