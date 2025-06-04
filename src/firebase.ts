import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { FIREBASE_CONFIG } from "@/config";
import { saveUserMobilePhoneId } from "./api/modules/login";
import { ElNotification } from "element-plus";

// 判断是否生产环境
if (import.meta.env.MODE === "production") {
  const app = initializeApp(FIREBASE_CONFIG);
  const messaging = getMessaging(app);
  const fileUrl = "/intplatform/mis/";
  // 请求通知权限
  const requestPermission = () => {
    Notification.requestPermission().then(permission => {
      console.log(permission);
      if (permission === "granted") {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker
            .register(`${fileUrl}/firebase-messaging-sw.js`)
            .then(registration => {
              console.log("Service Worker 注册成功:", registration);

              getToken(messaging, {
                vapidKey: "BD39A0PHexocdIF8jS7-J2hdifWrlnK_FvNwzRrcpclm4cR4ibEWBZCl_3GwrMW4hrhrFfap_VWq9fOxufiwBUs"
              })
                .then(currentToken => {
                  if (currentToken) {
                    // Send the token to your server and update the UI if necessary
                    // ...
                    saveUserMobilePhoneId({ mobilePhoneId: currentToken });

                    onMessage(messaging, payload => {
                      console.log("收到后台消息: ", payload);
                      ElNotification({
                        title: payload.notification?.title,
                        message: payload.notification?.body,
                        type: "success",
                        duration: 0
                      });
                    });
                  } else {
                    // Show permission request UI
                    console.log("No registration token available. Request permission to generate one.");
                    // ...
                  }
                })
                .catch(err => {
                  console.log("An error occurred while retrieving token. ", err);
                  // ...
                });
            })
            .catch(error => {
              console.error("Service Worker 注册失败:", error);
            });
        }
      } else {
        console.log("Notification permission denied.");
      }
    });
  };
  requestPermission();
}
