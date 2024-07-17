import { useState } from "react";
import useFetchWithRetry from "./useFetchWithRetry";
import { useRecoilState, waitForAllSettled } from "recoil";
import { imageItemState } from "@/recoil/states";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import useErrorAlert from "./useErrorAlert";
import { ImageItem } from "@/types";

const useImagePopularity = ({ imageId }: { imageId: string }) => {
  const showErrorAlert = useErrorAlert();
  const [imageItem, setImageItem] = useRecoilState(imageItemState(imageId));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { fetchWithRetry } = useFetchWithRetry();

  const adjustPopularityAsync = async (amount: number = 1) => {
    console.log("useImagePopularity");
    const docRef = doc(db, "images", imageId);
    await updateDoc(docRef, { popularity: increment(amount) });
  };

  const adjustPopularity = async (amount: number = 1) => {
    if (isLoading) return;
    setIsLoading(true);

    let prevImageItem: ImageItem | null = null;

    setImageItem((prev) => {
      if (!prev) return prev;
      prevImageItem = prev;

      return { ...prev, popularity: prev.popularity + amount };
    });

    try {
      await fetchWithRetry({ asyncFn: adjustPopularityAsync, args: amount });
    } catch (error) {
      setImageItem(prevImageItem);
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  return { adjustPopularity, isLoading };
};

export default useImagePopularity;
