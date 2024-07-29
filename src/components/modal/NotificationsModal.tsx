import { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authStatusState, inAppNotificationState } from "@/recoil/states";
import useDateDiffNow from "@/hooks/useDateDiffNow";
import Image from "next/image";
import Link from "next/link";
import _ from "lodash";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";

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

  // 오래된 알림 삭제
  useEffect(() => {
    if (authStatus.data?.uid && notification.list.length > 100) {
      const newList = _.cloneDeep(notification.list).splice(0, 50).reverse();
      const docRef = doc(
        db,
        "users",
        authStatus.data.uid,
        "notification",
        "data",
      );
      updateDoc(docRef, {
        list: newList,
      });
    }
  }, [authStatus.data?.uid, notification.list, notification.list.length]);

  return (
    <div className="h-[40vh] max-h-[500px] min-h-[200px]">
      <ul className="flex h-full flex-col gap-4 overflow-scroll p-4 px-6">
        {notification.list.length <= 0 ? (
          <div className="flex h-[80%] items-center justify-center text-center text-astronaut-700">
            목록이 비어있습니다.
          </div>
        ) : (
          notification.list.map((notification, i) => (
            <li key={i}>
              <Link
                href={notification.URL}
                className="block rounded-lg p-2 shadow"
                onClick={() => {
                  close();
                }}
              >
                <div className="flex gap-4">
                  <div className="relative aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-full bg-astronaut-800">
                    <Image
                      src={notification.profileImage}
                      layout="fill"
                      alt={notification.title}
                    />
                  </div>
                  <div className="flex flex-col gap-0 break-keep leading-tight">
                    <div>{notification.title}</div>
                    <div className="text-sm text-astronaut-700">
                      {notification.body}
                    </div>
                  </div>
                  {notification.targetImage && (
                    <div className="relative aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-astronaut-800">
                      <Image
                        src={notification.targetImage}
                        layout="fill"
                        alt={notification.title}
                      />
                    </div>
                  )}
                </div>
                <div className="w-full pr-2 pt-2 text-end text-xs text-astronaut-500">
                  {dateDiffNow(notification.createdAt).diffSummary}
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationsModal;
