import { MouseEvent, useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import Button from "../Button";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { useRecoilState, useSetRecoilState } from "recoil";
import { alertsState, authStatusState } from "@/recoil/states";
import { doc, FirestoreError, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import { uniqueId } from "lodash";
import useFetchWithRetry from "@/hooks/useFetchWithRetry";
import usePostAllowPush from "@/hooks/usePostAllowPush";
import useSendFcm from "@/hooks/useSendFcm";
import useDevicePushToken from "@/hooks/useDevicePushToken";

//TODO:로그인 후 푸시 허용하고 로그아웃하고 다른 계정 로그인시에도 물어보는지 체크

const WebPush = () => {
  const sendFcm = useSendFcm();
  const { postDeviceData } = useDevicePushToken();
  const { postAllowPush } = usePostAllowPush();
  const { fetchWithRetry } = useFetchWithRetry();
  const setAlerts = useSetRecoilState(alertsState);
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);
  const [showUserAllowModal, setShowUserAllowModal] = useState<boolean>(false);
  const [showBrowserPermissionModal, setShowBrowserPermissionModal] =
    useState<boolean>(false);
  // 최초 허용시 테스트 푸시
  const [firstRequest, setFirstRequest] = useState<boolean>(false);
  // 다음에 다시 묻기 선택 후 재접속 시
  const [secondRequest, setSecondRequest] = useState<boolean>(false);
  // 브라우저 푸시 권한
  const [browserPermission, setBrowserPermission] = useState<boolean>(false);
  // 유저의 푸시 허용
  const [userAllow, setUserAllow] = useState<boolean>(false);

  // 유저의 푸시 허용 여부
  useEffect(() => {
    // 로그인 여부 체크
    if (authStatus.status !== "signedIn") {
      return;
    }

    (async () => {
      // fcm 지원여부 확인
      const supported = await isSupported();
      if (!supported) return;

      // 두 번째 요청인지 구분
      const isSecondRequest =
        localStorage.getItem("pushUserAllow") === "notNow";
      if (isSecondRequest) {
        setSecondRequest(true);
      }

      switch (authStatus.data.allowPush) {
        // 아직 안물어본 경우 물어보기
        case undefined:
          setFirstRequest(true);
          setUserAllow(false);
          setShowUserAllowModal(true);

          break;
        // 이미 허용한 경우
        case true:
          setUserAllow(true);
          break;
        // 거부했거나 그 외 발생할 수 있는 모든 경우
        default:
          setUserAllow(false);
      }
    })();
  }, [authStatus.data, authStatus.status]);

  // 브라우저 푸시 권한 체크
  useEffect(() => {
    // 유저가 허용을 안했으면 체크 안해도 됨
    const denied =
      localStorage.getItem("pushBrowserPermission") === "deny" || !userAllow;

    if (denied) {
      return;
    }

    // 브라우저 권한이 있음
    if (Notification.permission === "granted") {
      setBrowserPermission(true);
      // 브라우저 권한이 없음
    } else {
      // 권한 요청하기
      setBrowserPermission(false);
      setShowBrowserPermissionModal(true);
    }
  }, [userAllow]);

  // 유저의 허용과 브라우저의 권한이 모두 있는 경우 토큰 불러오고 db에 업데이트
  useEffect(() => {
    if (
      browserPermission &&
      userAllow &&
      authStatus.status === "signedIn" &&
      !authStatus.data.currentPushToken
    ) {
      (async () => {
        const messaging = getMessaging();
        const currentToken = await fetchWithRetry({
          asyncFn: getToken,
          multipleArgs: [
            messaging,
            {
              vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
            },
          ],
        });

        setAuthStatus((prev) => {
          if (prev.status !== "signedIn") return prev;

          return {
            ...prev,
            data: { ...prev.data, currentPushToken: currentToken },
          };
        });

        const deviceData = {
          fcmToken: currentToken,
          createdAt: Date.now(),
        };

        await postDeviceData(deviceData);

        if (firstRequest) {
          await sendFcm({
            data: {
              title: `푸시 알림을 받기 위한 준비가 완료되었습니다.`,
              body: null,
              profileImage: null,
              targetImage: null,
              click_action: `/${authStatus.data.displayId}`,
              uids: [authStatus.data.uid],
              sender: {
                uid: authStatus.data.uid,
                displayName: authStatus.data.displayName,
                displayId: authStatus.data.displayId || null,
              },
            },
            exceptSelf: false,
          });
          setFirstRequest(false);
        }
      })();
    }
  }, [
    fetchWithRetry,
    authStatus.status,
    browserPermission,
    userAllow,
    firstRequest,
    authStatus.data,
    setAuthStatus,
    postDeviceData,
    sendFcm,
  ]);

  // 유저 푸시 허용 모달에서 허용 클릭
  const onAllowClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      setUserAllow(true);
      setShowUserAllowModal(false);
      await postAllowPush({ allow: true });
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "success",
          createdAt: Date.now(),
          text: "푸시 알림이 허용되었습니다.",
        },
      ]);
    } catch (error) {
      setUserAllow(false);
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "푸시 권한 업데이트 중 문제가 발생하였습니다. 나중에 다시 시도해 주세요.",
        },
      ]);
    }
  };

  // 유저 푸시 허용 모달에서 다시 보지 않기(거부) 클릭
  const onUserAllowDenyClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setShowUserAllowModal(false);

    try {
      // db에 허용 여부 업데이트
      await postAllowPush({ allow: false });
      localStorage.removeItem("pushUserAllow");
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "success",
          createdAt: Date.now(),
          text: "푸시가 거부되었습니다. 프로필 설정에서 다시 허용할 수 있습니다.",
        },
      ]);
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "푸시 권한 업데이트 중 문제가 발생하였습니다.",
        },
      ]);
    }
  };

  // 유저 푸시 허용 모달에서 나중에 다시 알림 클릭
  const onUserAllowNotNowClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowUserAllowModal(false);
    localStorage.setItem("pushUserAllow", "notNow");
  };

  const onCloseModal = () => {
    setShowUserAllowModal(false);
    setShowBrowserPermissionModal(false);
    localStorage.setItem("pushUserAllow", "notNow");
  };

  const onGrantClick = async () => {
    setShowBrowserPermissionModal(false);
    try {
      // 브라우저 권한 요청/체크
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setBrowserPermission(true);
          // TODO: 테스트 푸시 전송하기
        } else {
          setBrowserPermission(false);
        }
      });
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "푸시 권한 업데이트 중 문제가 발생하였습니다. 나중에 다시 시도해 주세요.",
        },
      ]);
    }
  };

  const onBrowserPermissionDenyClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowBrowserPermissionModal(false);
    localStorage.setItem("pushBrowserPermission", "deny");
  };

  return (
    <div>
      {showUserAllowModal && (
        <Modal close={onCloseModal} title="푸시 알림 받기">
          <div className="break-keep px-6 pb-2 pt-8 text-lg">
            <div className="text-base leading-6">
              회원님의 사진에 대한 반응이나 팔로우 등을 알림으로 받아보실 수
              있습니다.
            </div>
            <div className="pb-4 pt-8 text-end text-xs">
              <div className="flex justify-end gap-2">
                <Button onClick={onAllowClick}>
                  <div>알림 받기</div>
                </Button>
                <Button
                  tailwindStyle="bg-astronaut-400 hover:bg-astronaut-500"
                  onClick={onUserAllowNotNowClick}
                >
                  <div>나중에 다시 묻기</div>
                </Button>
              </div>
              {secondRequest && (
                <button
                  onClick={onUserAllowDenyClick}
                  className="mt-4 text-astronaut-300 underline"
                >
                  <div>다시 보지 않기</div>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
      {showBrowserPermissionModal && (
        <Modal close={onCloseModal} title="브라우저 권한 요청">
          <div className="break-keep break-keep px-6 pb-2 pt-8 text-lg">
            <div className="text-base leading-6">
              브라우저가 알림 권한을 요청합니다.
            </div>
            <div className="mt-2 text-base leading-6">
              허용을 누르시면 푸시 알림을 받기 위한 설정이 완료됩니다.
            </div>
            <div className="pb-4 pt-8 text-end text-xs">
              <div className="flex justify-end gap-2">
                <Button onClick={onGrantClick}>
                  <div>알겠습니다.</div>
                </Button>
              </div>
              <button
                onClick={onBrowserPermissionDenyClick}
                className="mt-4 h-fit text-astronaut-300 underline"
              >
                <div>다시 보지 않기</div>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WebPush;
