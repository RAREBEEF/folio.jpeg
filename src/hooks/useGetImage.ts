import { db } from "@/fb";
import { ImageDocData, ImageItem } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";

/**
 * imageId로 db에서 이미지 데이터를 불러오는 비동기 함수 (를 반환하는 커스텀훅)
 * */
const useGetImage = () => {
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /**
   * imageId로 db에서 이미지 데이터를 불러오는 비동기 함수
   * */
  const getImageItem = async ({
    imageId,
  }: {
    imageId: string;
  }): Promise<ImageItem | null> => {
    setIsLoading(true);

    try {
      const docRef = doc(db, "images", imageId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const imageData = docSnap.data() as ImageDocData;
        const imageItem = { ...imageData, grid: null, id: docSnap.id };
        setIsLoading(false);
        return imageItem;
      } else {
        setIsLoading(false);
        return null;
      }
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
