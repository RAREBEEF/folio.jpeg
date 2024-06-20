"use client";

import { getMessaging, getToken } from "firebase/messaging";
import { MouseEvent } from "react";

const PushTestPage = () => {
  const onPushAllow = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    Notification.requestPermission().then((permission) => {
      if (permission !== "granted") {
        // 푸시 거부됐을 때 처리할 내용
        window.alert("푸시 거부됨");
      } else {
        // 푸시 승인됐을 때 처리할 내용
        const messaging = getMessaging();

        getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        })
          .then(async (currentToken) => {
            if (!currentToken) {
              console.log("토근 발급 실패");
              // 토큰 생성 불가시 처리할 내용, 주로 브라우저 푸시 허용이 안된 경우에 해당한다.
            } else {
              // 토큰을 받았다면 호다닥 서버에 저장
              console.log(currentToken);
            }
          })
          .catch((error) => {
            // 예외처리
          });
      }
    });
  };

  const send = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const data = {
      title: "제목",
      body: "바디",
      image: "/vercel.svg",
      click_action: "http://localhost:3000/rarebeef",
    };
    await fetch("/api/send-fcm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(async (response) => {});
  };
  return (
    <div className="h-full bg-shark-50">
      푸시테스트
      <button onClick={onPushAllow}>알림 허용</button>
      <button onClick={send}>알림 보내기</button>
    </div>
  );
};
export default PushTestPage;
