import { InAppNotification } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import Loading from "./Loading";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  authStatusState,
  inAppNotificationHistoryState,
  inAppNotificationsState,
  lastVisibleState,
} from "@/recoil/states";
import useDateDiffNow from "@/hooks/useDateDiffNow";
import Image from "next/image";
import Link from "next/link";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
} from "firebase/firestore";
import { db } from "@/fb";
import _ from "lodash";

const NotificationsModal = ({ close }: { close: Function }) => {
  const dateDiffNow = useDateDiffNow();
  const loadRef = useRef<HTMLDivElement>(null);
  const authStatus = useRecoilValue(authStatusState);
  //   const { notifications } = useListenNotifications(authStatus.data?.uid || "");
  const { notifications, lastUpdate } = useRecoilValue(inAppNotificationsState);
  const [{ notificationHistory, lastPage }, setNotificationHistory] =
    useRecoilState(inAppNotificationHistoryState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastVisible, setLastVisible] = useRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState("notification"));

  const loadNotificationHistory = useCallback(async () => {
    if (isLoading || !authStatus.data || lastPage) return;
    setIsLoading(true);

    const q = query(
      collection(db, "users", authStatus.data.uid, "notifications"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible || Date.now()),
      limit(2),
    );

    const documentSnapshots = await getDocs(q);

    const notificationHistory: Array<InAppNotification> = [];
    documentSnapshots.forEach((doc) => {
      notificationHistory.push(doc.data() as InAppNotification);
    });

    setNotificationHistory((prev) => ({
      notificationHistory: [
        ...prev.notificationHistory,
        ...notificationHistory,
      ],
      lastPage: documentSnapshots.empty,
    }));

    const lv = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setLastVisible(() => {
      const newLv = _.cloneDeep(lv);
      return newLv;
    });

    setIsLoading(false);
  }, [
    authStatus.data,
    isLoading,
    lastPage,
    lastVisible,
    setLastVisible,
    setNotificationHistory,
  ]);

  // 무한 스크롤에 사용할 옵저버 (뷰포트에 감지되면 다음 페이지 불러온다.)
  useEffect(() => {
    const loadBtn = loadRef.current;
    if (!loadBtn) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          await loadNotificationHistory();
        }
      });
    });
    observer.observe(loadBtn);

    return () => {
      observer.unobserve(loadBtn);
    };
  }, [loadNotificationHistory]);

  return (
    <div className="h-[40vh] max-h-[500px] min-h-[200px]">
      <ul className="flex flex-col gap-4 p-4 px-6">
        {notifications.concat(notificationHistory).map((notification, i) => (
          <li key={i}>
            <Link
              href={notification.url}
              className="block rounded-lg p-2 shadow"
              onClick={() => {
                close();
              }}
            >
              <div className="flex gap-4">
                <div className="relative aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-full bg-shark-500">
                  <Image
                    src={notification.image}
                    layout="fill"
                    alt={notification.title}
                  />
                </div>
                <div className="flex flex-col gap-2 break-keep leading-tight">
                  <div>{notification.title}</div>
                  <div className="text-sm text-shark-700">
                    {notification.body}
                  </div>
                </div>
              </div>
              <div className="w-full text-end text-xs text-shark-500">
                {dateDiffNow(notification.createdAt).diffSummary}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!lastPage && (
        <div
          ref={loadRef}
          className="pb-24 pt-12 text-center text-sm text-shark-500"
        >
          <Loading />
        </div>
      )}
    </div>
  );
};

export default NotificationsModal;
