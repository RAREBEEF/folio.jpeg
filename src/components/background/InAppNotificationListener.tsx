import { authStatusState, inAppNotificationState } from "@/recoil/states";
import { useRecoilState, useRecoilValue } from "recoil";
import { db } from "@/fb";
import { InAppNotification } from "@/types";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";

const InAppNotificationListener = () => {
  const authStatus = useRecoilValue(authStatusState);
  const [inAppNotification, setInAppNotification] = useRecoilState(
    inAppNotificationState,
  );

  useEffect(() => {
    if (!authStatus.data?.uid) return;
    const now = Date.now();

    const docRef = doc(
      db,
      "users",
      authStatus.data.uid,
      "notification",
      "data",
    );

    const unsub = onSnapshot(docRef, (doc) => {
      const list: Array<InAppNotification> =
        (doc.data()?.list as Array<InAppNotification>) || [];
      const lastCheck: number = (doc.data()?.lastCheck as number) || 0;

      setInAppNotification((prev) => ({
        ...prev,
        list: list.reverse(),
        lastCheck,
      }));
    });

    return () => {
      unsub();
    };
  }, [authStatus.data?.uid, setInAppNotification]);

  return null;
};

export default InAppNotificationListener;
