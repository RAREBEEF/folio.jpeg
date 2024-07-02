importScripts(
  "https://www.gstatic.com/firebasejs/9.0.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB7fZYjRpImGmwh1l7ziAYOAIwRHtvp0sA",
  authDomain: "folio-jpeg.firebaseapp.com",
  projectId: "folio-jpeg",
  storageBucket: "folio-jpeg.appspot.com",
  messagingSenderId: "734230205254",
  appId: "1:734230205254:web:ee6a06c0ea32e8fd714b47",
});

const messaging = firebase.messaging();

self.addEventListener("push", async function (event) {
  if (event.data) {
    const notification = await event.data.json().notification;
    const data = await event.data.json().data;

    const options = {
      body: notification.body,
      icon: data.icon,
      image: data.image,
      vibrate: [200, 100, 200],
      data: {
        click_action: data.click_action,
      },
    };
    event.waitUntil(
      self.registration.showNotification(notification.title, options),
    );
  } else {
    console.log("This push event has no data.");
  }
});

self.addEventListener("notificationclick", function (event) {
  event.preventDefault();
  event.notification.close();

  const URLToOpen = event.notification.data.click_action;

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then(function (windowClients) {
      let matchingClient = null;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url.includes(URLToOpen)) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(URLToOpen);
      }
    });

  event.waitUntil(promiseChain);
});
