import { MouseEvent, useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import Button from "./Button";
import { getMessaging, getToken } from "firebase/messaging";
import { useRecoilState, useSetRecoilState } from "recoil";
import { alertsState, authStatusState } from "@/recoil/states";
import { UserData } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import { uniqueId } from "lodash";

const PushRequest = () => {
  const setAlerts = useSetRecoilState(alertsState);
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);
  const [showPushRequestModal, setShowPushRequestModal] =
    useState<boolean>(false);
  const [secondRequest, setSecondRequest] = useState<boolean>(false);

  useEffect(() => {
    if (authStatus.status !== "signedIn" || authStatus.data?.fcmToken) return;

    const requestHistory = localStorage.getItem("pushRequest");
    switch (requestHistory) {
      // 허용됨
      case "granted":
        if (!authStatus.data?.fcmToken) {
          localStorage.setItem("pushRequest", "not now");
        } else {
          break;
        }

      // 거절됨
      case "denied":
        break;
      // 나중에 다시 알림
      // 두 번째 요청은 허용 안함 버튼을 출력함
      case "not now":
        setSecondRequest(true);
        setShowPushRequestModal(true);
        break;
      // 지원 안함
      case "unsupport":
        break;
      // 최초 요청
      // 최초 요청은 허용 안함 버튼 출력 안함
      default:
        setShowPushRequestModal(true);
        break;
    }
  }, [authStatus]);

  const onCloseModal = () => {
    setShowPushRequestModal(false);
  };

  const requestAndGetToken = async () => {
    Notification.requestPermission().then(async (permission) => {
      if (authStatus.status !== "signedIn") {
        return;
      } else if (permission !== "granted") {
        // 푸시 거부됐을 때 처리할 내용
        localStorage.setItem("pushRequest", "not now");
      } else {
        // 푸시 승인됐을 때 처리할 내용
        const messaging = getMessaging();
        try {
          await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
          }).then(async (currentToken) => {
            if (!currentToken) {
              localStorage.setItem("pushRequest", "not now");
            } else {
              if (!authStatus.data) return;
              // 먼저 상태 업데이트
              const docRef = doc(db, "users", authStatus.data.uid);
              await updateDoc(docRef, {
                fcmToken: currentToken,
              }).then(async () => {
                // db 저장 완료 후 localStorage와 상태에 저장
                localStorage.setItem("pushRequest", "granted");

                setAuthStatus((prev) => {
                  return prev.status === "signedIn"
                    ? {
                        status: prev.status,
                        data: {
                          ...prev.data,
                          fcmToken: currentToken,
                        },
                      }
                    : prev;
                });

                setAlerts((prev) => [
                  ...prev,
                  {
                    id: uniqueId(),
                    createdAt: Date.now(),
                    text: "푸시 허용이 완료되었습니다.",
                    show: true,
                    type: "success",
                  },
                ]);

                const data = {
                  title: "푸시를 허용이 완료되었습니다.",
                  body: "이제 여기에 푸시 알림이 출력됩니다.",
                  image: "/vercel.svg",
                  click_action: "",
                  fcmTokens: [currentToken],
                };
                await fetch("/api/fcm", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                });
              });
            }
          });
        } catch (error) {
          localStorage.setItem("pushRequest", "not now");
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              createdAt: Date.now(),
              text: "푸시 토큰 생성 중 문제가 발생하였습니다.",
              show: true,
              type: "warning",
            },
          ]);
        }
      }
    });
  };

  const onGrantClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPushRequestModal(false);
    await requestAndGetToken();
  };
  const onDenyClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    localStorage.setItem("pushRequest", "denied");
    setShowPushRequestModal(false);
  };
  const onNotNowClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    localStorage.setItem("pushRequest", "not now");
    setShowPushRequestModal(false);
  };

  return (
    <div>
      {showPushRequestModal && (
        <Modal close={onCloseModal} title="푸시 알림 받기">
          <div className="break-keep px-8 text-lg">
            <div className="pb-4 leading-6">
              회원님의 사진에 대한 반응이나 새로운 팔로워 등을 알림으로 받아보실
              수 있습니다.
            </div>
            <div className="py-4 text-end text-xs">
              <div className="flex justify-end gap-2">
                <Button onClick={onGrantClick}>
                  <div>허용</div>
                </Button>
                <Button
                  tailwindStyle="bg-astronaut-700"
                  onClick={onNotNowClick}
                >
                  <div>나중에 다시 알림</div>
                </Button>
              </div>
              {secondRequest && (
                <button
                  onClick={onDenyClick}
                  className="pt-4 text-astronaut-700 underline"
                >
                  <div>다시 보지 않기</div>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PushRequest;
