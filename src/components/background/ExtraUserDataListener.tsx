import { authStatusState } from "@/recoil/states";
import { useRecoilState } from "recoil";
import { db } from "@/fb";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import _ from "lodash";
import useTypeGuards from "@/hooks/useTypeGuards";

const ExtraUserDataListener = () => {
  const { isExtraUserData } = useTypeGuards();
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);

  useEffect(() => {
    if (!authStatus.data?.uid) return;

    const docRef = doc(db, "users", authStatus.data.uid);

    const unsub = onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (isExtraUserData(data))
        setAuthStatus((prev) => {
          if (!prev) return prev;

          return prev.status === "signedIn"
            ? {
                status: prev.status,
                data: {
                  ...prev.data,
                  ...data,
                },
              }
            : prev;
        });
    });

    return () => {
      unsub();
    };
  }, [setAuthStatus, authStatus.data, isExtraUserData]);

  return null;
};

export default ExtraUserDataListener;
