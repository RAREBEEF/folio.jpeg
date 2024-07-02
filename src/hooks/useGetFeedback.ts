import { useState } from "react";
import useErrorAlert from "./useErrorAlert";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/fb";
import { UserFeedback } from "@/types";

const useGetFeedback = () => {
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getFeedback = async ({ uid }: { uid: string }) => {
    setIsLoading(true);

    try {
      console.log("피드백 로딩");
      const docRef = doc(db, "users", uid, "feedback", "data");
      const docSnap = await getDoc(docRef);
      const data = docSnap.data() as UserFeedback;

      return data;
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
