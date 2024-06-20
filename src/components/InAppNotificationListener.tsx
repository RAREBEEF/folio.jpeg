import { authStatusState, inAppNotificationsState } from "@/recoil/states";
import { useRecoilState, useRecoilValue } from "recoil";
import { db } from "@/fb";
import { InAppNotification } from "@/types";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  startAt,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const InAppNotificationListener = () => {
  const authStatus = useRecoilValue(authStatusState);
  const [inAppNotifications, setInAppNotifications] = useRecoilState(
    inAppNotificationsState,
  );

  useEffect(() => {
    if (!authStatus.data?.uid) return;
    const now = Date.now();

    const q = query(
      collection(db, "users", authStatus.data.uid, "notifications"),
      orderBy("createdAt", "asc"),
      startAt(now),
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const notifications: Array<InAppNotification> = [];
      querySnapshot.forEach((doc) => {
        notifications.push(doc.data() as InAppNotification);
      });

      setInAppNotifications((prev) => ({
        ...prev,
        notifications: notifications.reverse(),
      }));
    });

    return () => {
      unsub();
    };
  }, [authStatus.data?.uid, setInAppNotifications]);

  return <div></div>;
};

export default InAppNotificationListener;
