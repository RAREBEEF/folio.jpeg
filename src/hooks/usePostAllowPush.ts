import { doc, updateDoc } from "firebase/firestore";
import useFetchWithRetry from "./useFetchWithRetry";
import { db } from "@/fb";
import { useRecoilValue } from "recoil";
import { authStatusState } from "@/recoil/states";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";

const usePostAllowPush = () => {
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const { fetchWithRetry } = useFetchWithRetry();

  const postAllowPushAsync = async ({
    allow,
    uid,
  }: {
    allow: boolean;
    uid: string;
  }) => {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { allowPush: allow });
  };

  const postAllowPush = async ({ allow }: { allow: boolean }) => {
    if (isLoading || authStatus.status !== "signedIn") {
      return;
    }

    setIsLoading(true);

    try {
      await fetchWithRetry({
        asyncFn: postAllowPushAsync,
        args: { allow, uid: authStatus.data.uid },
      });
    } catch (error) {
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  return { postAllowPush, isLoading };
};

export default usePostAllowPush;
