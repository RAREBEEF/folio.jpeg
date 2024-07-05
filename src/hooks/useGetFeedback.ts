import { useState } from "react";
import useErrorAlert from "./useErrorAlert";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/fb";
import { UserFeedback } from "@/types";
import useFetchWithRetry from "./useFetchWithRetry";

const useGetFeedback = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getFeedbackAsync = async ({ uid }: { uid: string }) => {
    console.log("이전 피드백 로딩");
    const docRef = doc(db, "users", uid, "feedback", "data");
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as UserFeedback;

    return data;
  };

  const getFeedback = async ({ uid }: { uid: string }) => {
    if (isLoading) {
      return null;
    }
    setIsLoading(true);

    try {
      return await fetchWithRetry({ asyncFn: getFeedbackAsync, args: { uid } });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getFeedback, isLoading };
};

export default useGetFeedback;
