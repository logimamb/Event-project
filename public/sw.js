self.addEventListener('push', event => {
  if (!event.data) return

  try {
    const payload = event.data.json()
    const options = {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
      silent: !payload.sound,
      vibrate: payload.sound ? [200, 100, 200] : undefined,
      timestamp: payload.timestamp || Date.now(),
      renotify: true,
      requireInteraction: true
    }

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    )
  } catch (error) {
    console.error('Error handling push event:', error)
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
});

self.addEventListener('notificationclose', function(event) {
  // Track when notifications are dismissed
  const dismissedNotification = event.notification;
  console.log('Notification dismissed:', dismissedNotification.tag);
});

self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription.options.applicationServerKey
    }).then(subscription => {
      // Send the new subscription to the server
      return fetch('/api/notifications/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldEndpoint: event.oldSubscription.endpoint,
          newSubscription: subscription
        })
      })
    })
  )
});
