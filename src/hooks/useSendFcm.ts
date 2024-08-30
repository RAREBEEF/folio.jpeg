import { authStatusState } from "@/recoil/states";
import { useRecoilValue } from "recoil";
import logoIcon from "@/icons/favicon.ico";
import defaultProfileIcon from "@/images/user.png";

const useSendFcm = () => {
  const authStatus = useRecoilValue(authStatusState);

  const sendFcm = async ({
    data,
    exceptSelf = true,
  }: {
    data: {
      title: string;
      body: string | undefined | null;
      profileImage: string | undefined | null;
      targetImage?: string | undefined | null;
      click_action: string;
      uids?: Array<string> | null;
      sender: {
        uid: string | null;
        displayName: string | null;
        displayId: string | null;
      } | null;
      type?: "comment" | "reply" | "like" | "follow" | "other";
      subject?: string;
    };
    exceptSelf?: boolean;
  }) => {
    console.log("useSendFcm");
    // 토큰이나 토큰의 경로, uid가 전달되지 않았으면 리턴
    // 미로그인시 리턴, 미로그인 상태에서는 푸시 기능 쓸 일 없음.
    if (
      !data.uids ||
      data.uids.length <= 0 ||
      authStatus.status !== "signedIn"
    ) {
      return;
    } else {
      // 푸시 알림을 자신을 제외하고 전송할지
      const targetUids = exceptSelf
        ? data.uids.filter((uid) => uid !== authStatus.data.uid)
        : data.uids;
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
          uids: targetUids,
          sender: data.sender,
          type: data.type || "other",
          subject: data.subject || "",
        }),
      })
        .then(async (response) => {})
        .catch((error) => {});
    }
  };

  return sendFcm;
};
export default useSendFcm;
