import { db } from "@/fb";
import { ImageDocData, ImageItem } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";

/**
 * imageId로 db에서 이미지 데이터를 불러오는 비동기 함수 (를 반환하는 커스텀훅)
 * */
const useGetImage = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /**
   * imageId로 db에서 이미지 데이터를 불러오는 비동기 함수
   * */
  const getImageItemAsync = async ({
    imageId,
  }: {
    imageId: string;
  }): Promise<ImageItem | null> => {
    console.log("useGetImage");
    const docRef = doc(db, "images", imageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const imageData = docSnap.data() as ImageDocData;
      const imageItem = { ...imageData, grid: null, id: docSnap.id };
      return imageItem;
    } else {
      return null;
    }
  };

  const getImageItem = async ({
    imageId,
  }: {
    imageId: string;
  }): Promise<ImageItem | null> => {
    if (isLoading) return null;
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: getImageItemAsync,
        args: { imageId },
      });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getImageItem, isLoading };
};

export default useGetImage;
