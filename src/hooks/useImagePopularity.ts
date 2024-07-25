import { useState } from "react";
import useFetchWithRetry from "./useFetchWithRetry";
import { useRecoilState, useRecoilValue } from "recoil";
import { authStatusState, imageDataState } from "@/recoil/states";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import useErrorAlert from "./useErrorAlert";
import { ImageData } from "@/types";

const useImagePopularity = ({ imageId }: { imageId: string }) => {
  const showErrorAlert = useErrorAlert();
  const [imageData, setImageData] = useRecoilState(imageDataState(imageId));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { fetchWithRetry } = useFetchWithRetry();
  const authStatus = useRecoilValue(authStatusState);

  const adjustPopularityAsync = async (amount: number = 1) => {
    console.log("useImagePopularity");
    const docRef = doc(db, "images", imageId);
    await updateDoc(docRef, { popularity: increment(amount) });
  };

  const adjustPopularity = async (amount: number = 1) => {
    if (isLoading || authStatus.status !== "signedIn") return;
    setIsLoading(true);

    let prevImageData: ImageData | null = null;

    setImageData((prev) => {
      if (!prev) return prev;
      prevImageData = prev;

      return { ...prev, popularity: prev.popularity + amount };
    });

    try {
      await fetchWithRetry({ asyncFn: adjustPopularityAsync, args: amount });
    } catch (error) {
      setImageData(prevImageData);
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  return { adjustPopularity, isLoading };
};

export default useImagePopularity;
