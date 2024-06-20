import { db } from "@/fb";
import { inAppNotificationsState } from "@/recoil/states";
import { InAppNotification } from "@/types";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAt,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";

const useListenNotifications = (uid: string) => {
  const [inAppNotifications, setInAppNotifications] = useRecoilState(
    inAppNotificationsState,
  );

  //   const getPrevNotifications = async () => {
  //     if (isLoading) return;
  //     setIsLoading(true);
  //     console.log("이전 로드");

  //     const lastVisibleCreatedAt =
  //       inAppNotifications.prevNotifications[
  //         inAppNotifications.prevNotifications.length - 1
  //       ]?.createdAt ||
  //       inAppNotifications.newNotifications[
  //         inAppNotifications.newNotifications.length - 1
  //       ]?.createdAt ||
  //       Date.now();

  //     const q = query(
  //       collection(db, "users", uid, "notifications"),
  //       orderBy("createdAt", "desc"),
  //       startAt(lastVisibleCreatedAt),
  //       limit(2),
  //     );
  //     const docSnap = await getDocs(q);
  //     const prevNotifications: Array<InAppNotification> = [];
  //     docSnap.forEach((doc) => {
  //       prevNotifications.push(doc.data() as InAppNotification);
  //     });

  //     setInAppNotifications((prev) => ({
  //       ...prev,
  //       prevNotifications: [
  //         ...prev.prevNotifications,
  //         ...prevNotifications.reverse(),
  //       ],
  //     }));
  //     setIsLoading(false);
  //   };

  useEffect(() => {
    if (!uid) return;

    setInAppNotifications((prev) => ({
      ...prev,
      newNotifications: [],
      prevNotifications: [...prev.newNotifications, ...prev.prevNotifications],
    }));

    const q = query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "asc"),
      startAt(Date.now()),
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const notifications: Array<InAppNotification> = [];
      querySnapshot.forEach((doc) => {
        notifications.push(doc.data() as InAppNotification);
      });

      setInAppNotifications((prev) => ({
        ...prev,
        newNotifications: notifications.reverse(),
      }));
    });

    return () => {
      unsub();
    };
  }, [setInAppNotifications, uid]);

  return inAppNotifications;
};

export default useListenNotifications;
