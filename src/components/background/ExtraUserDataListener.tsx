import { authStatusState } from "@/recoil/states";
import { useRecoilState } from "recoil";
import { db } from "@/fb";
import { ExtraUserData, UserData } from "@/types";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import _ from "lodash";

const ExtraUserDataListener = () => {
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);

  useEffect(() => {
    if (!authStatus.data?.uid) return;

    const docRef = doc(db, "users", authStatus.data.uid);

    const unsub = onSnapshot(docRef, (doc) => {
      setAuthStatus((prev) => {
        if (!prev) return prev;
        const newAuthStatus = _.cloneDeep(prev);

        return {
          ...newAuthStatus,
          data: {
            ...newAuthStatus.data,
            ...(doc.data() as ExtraUserData),
          } as UserData,
        };
      });
    });

    return () => {
      unsub();
    };
  }, [setAuthStatus, authStatus.data?.uid]);

  return null;
};

export default ExtraUserDataListener;
