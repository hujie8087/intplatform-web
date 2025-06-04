importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC3aPZumZvuLvKkQw39KxeTCwtIu8dHwww",
  authDomain: "iwip-intplatform.firebaseapp.com",
  projectId: "iwip-intplatform",
  storageBucket: "iwip-intplatform.firebasestorage.app",
  messagingSenderId: "876588716398",
  appId: "1:876588716398:web:e6d02163f82df81048b17f",
  measurementId: "G-YCXGEQMMW1"
});

const messaging = firebase.messaging();
// 监听后台推送消息
messaging.onBackgroundMessage(payload => {
  console.log("收到后台消息: ", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png"
  });
});
