import { authStatusState } from "@/recoil/states";
import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import logoIcon from "@/icons/favicon.ico";
import defaultProfileIcon from "@/images/user-solid.png";

const useSendFcm = () => {
  const authStatus = useRecoilValue(authStatusState);
  // 내 토큰
  // 알림을 전송할 때, 현재 내 토큰은 제외해야함
  const myToken = useMemo(
    () => authStatus.data?.fcmToken || null,
    [authStatus],
  );
  const myUid = useMemo(() => authStatus.data?.uid || null, [authStatus]);

  const sendFcm = async ({
    data,
  }: {
    data: {
      title: string;
      body: string | undefined | null;
      profileImage: string | undefined | null;
      targetImage?: string | undefined | null;
      click_action: string;
      fcmTokens?: Array<string> | null;
      tokenPath?: string | null;
      uids?: Array<string> | null;
    };
  }) => {
    console.log("useSendFcm");
    // 토큰이나 토큰의 경로, uid가 전달되지 않았으면 리턴
    if (!data.fcmTokens && !data.tokenPath && !data.uids) {
      return;
    } else {
      // 토큰 전송 요청
      await fetch("/api/fcm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          body: data.body || "",
          profileImage: data.profileImage || defaultProfileIcon.src,
          targetImage: data.targetImage || null,
          icon: logoIcon.src,
          click_action: data.click_action || "/",
          fcmTokens: data.fcmTokens,
          tokenPath: data.tokenPath,
          uids: data.uids,
          myToken,
          myUid,
        }),
      })
        .then(async (response) => {})
        .catch((error) => {});
    }
  };

  return sendFcm;
};
export default useSendFcm;
