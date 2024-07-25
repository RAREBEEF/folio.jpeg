import { db } from "@/fb";
import { ImageDocData, ImageData } from "@/types";
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
  const getImageDataAsync = async ({
    imageId,
  }: {
    imageId: string;
  }): Promise<ImageData | null> => {
    console.log("useGetImage");
    const docRef = doc(db, "images", imageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as ImageDocData;
      const imageData = { ...data, grid: null, id: docSnap.id };
      return imageData;
    } else {
      return null;
    }
  };

  const getImageData = async ({
    imageId,
  }: {
    imageId: string;
  }): Promise<ImageData | null> => {
    if (isLoading) return null;
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: getImageDataAsync,
        args: { imageId },
      });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getImageData, isLoading };
};

export default useGetImage;
