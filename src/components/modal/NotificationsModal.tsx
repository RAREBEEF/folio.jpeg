import { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authStatusState, inAppNotificationState } from "@/recoil/states";
import useDateDiffNow from "@/hooks/useDateDiffNow";
import Image from "next/image";
import Link from "next/link";
import _ from "lodash";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import { InAppNotification } from "@/types";
import ProfileImage from "../user/ProfileImage";

const NotificationsModal = ({ close }: { close: Function }) => {
  const dateDiffNow = useDateDiffNow();
  const authStatus = useRecoilValue(authStatusState);
  const [notification, setNotification] = useRecoilState(
    inAppNotificationState,
  );

  const updateLastCheck = useCallback(async () => {
    if (!authStatus.data?.uid) return;

    const now = Date.now();
    setNotification((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lastCheck: now,
      };
    });
    const docRef = doc(
      db,
      "users",
      authStatus.data.uid,
      "notification",
      "data",
    );
    await updateDoc(docRef, {
      lastCheck: now,
    });
  }, [authStatus.data?.uid, setNotification]);

  useEffect(() => {
    updateLastCheck();
  }, [updateLastCheck]);

  const notificationGenerator = (notification: InAppNotification) => {
    const { title, body, sender, type } = notification;
    let titleContent: string | JSX.Element = title;
    let bodyContent: string | JSX.Element | null = body;
    const senders = Array.isArray(sender) ? sender : [sender];
    const sentenceMap = {
      like: "이 회원님의 사진에 좋아요를 눌렀습니다.",
      follow: "이 회원님을 팔로우하기 시작했습니다.",
      comment: "이 회원님의 사진에 댓글을 남겼습니다.",
      reply: "이 회원님의 댓글에 답글을 남겼습니다.",
    };

    if (type === "other") {
    } else if (["comment", "reply"].includes(type)) {
      titleContent = (
        <span>
          <Link
            className="font-semibold text-astronaut-950"
            href={`/${senders[0]?.displayId}`}
          >
            {senders[0]?.displayName}
            {" 님"}
          </Link>
          {sentenceMap[type]}
        </span>
      );
      bodyContent = (
        <span>
          <Link
            className="font-semibold text-astronaut-950"
            href={`/${senders[0]?.displayId}`}
          >
            {senders[0]?.displayName}
            {" 님"}
          </Link>
          {body?.replace(`${senders[0]?.displayName}님`, "")}
        </span>
      );
    } else if (senders.length === 1) {
      bodyContent = (
        <span>
          <Link className="font-semibold" href={`/${senders[0]?.displayId}`}>
            {senders[0]?.displayName}
            {" 님"}
          </Link>
          {sentenceMap[type]}
        </span>
      );
    } else if (senders.length === 2) {
      bodyContent = (
        <span>
          <Link className="font-semibold" href={`/${senders[0]?.displayId}`}>
            {senders[0]?.displayName}
            {" 님"}
          </Link>
          ,{" "}
          <Link className="font-semibold" href={`/${senders[1]?.displayId}`}>
            {senders[1]?.displayName}
            {" 님"}
          </Link>
          {sentenceMap[type]}
        </span>
      );
    } else {
      bodyContent = (
        <span>
          <Link className="font-semibold" href={`/${senders[0]?.displayId}`}>
            {senders[0]?.displayName}
            {" 님"}
          </Link>
          ,{" "}
          <Link className="font-semibold" href={`/${senders[1]?.displayId}`}>
            {senders[1]?.displayName}
            {" 님 외"}
          </Link>{" "}
          {(senders.length - 2).toLocaleString("ko-KR")}명의 사람들
          {sentenceMap[type]}
        </span>
      );
    }

    return (
      <li>
        <Link
          href={notification.URL}
          className="block rounded-lg p-2 shadow"
          onClick={() => {
            close();
          }}
        >
          <div className="flex gap-4 xs:gap-2">
            <Link
              href={
                `/${Array.isArray(notification.sender) ? notification.sender[0].displayId : notification.sender?.displayId}` ||
                notification.URL
              }
              className="relative aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-full bg-astronaut-50 xs:h-8 xs:w-8"
            >
              {/* <Image
                src={notification.profileImage}
                layout="fill"
                objectFit="cover"
                alt={title}
              /> */}
              <ProfileImage URL={notification.profileImage} />
            </Link>
            <div className="flex flex-col gap-0 leading-tight">
              <div className="text-sm font-bold leading-tight text-astronaut-800">
                {titleContent}
                {!bodyContent && (
                  <span className="pl-2 text-sm text-xs font-normal text-astronaut-600">
                    ∙ {dateDiffNow(notification.createdAt).diffSummary}
                  </span>
                )}
              </div>
              <div className="text-sm font-normal leading-tight">
                {bodyContent}
                {bodyContent && (
                  <span className="pl-2 text-xs text-astronaut-600">
                    ∙ {dateDiffNow(notification.createdAt).diffSummary}
                  </span>
                )}
              </div>
            </div>
            {notification.targetImage && (
              <div className="relative aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-astronaut-800 xs:h-10 xs:w-10">
                <Image
                  src={notification.targetImage}
                  layout="fill"
                  objectFit="cover"
                  alt={notification.title}
                />
              </div>
            )}
          </div>
        </Link>
      </li>
    );
  };

  return (
    <div className="h-[40vh] max-h-[500px] min-h-[200px]">
      <ul className="flex h-full flex-col gap-4 overflow-scroll px-6 pb-12 pt-8">
        {notification.list.length <= 0 ? (
          <div className="flex h-[80%] items-center justify-center text-center text-astronaut-700">
            목록이 비어있습니다.
          </div>
        ) : (
          notification.list.map((notification) =>
            notificationGenerator(notification),
          )
        )}
      </ul>
    </div>
  );
};

export default NotificationsModal;
