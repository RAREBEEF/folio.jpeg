import { db } from "@/fb";
import { ImageDocData, ImageItem } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

/**
 * imageId로 db에서 이미지 데이터를 불러오는 비동기 함수 (를 반환하는 커스텀훅)
 * */
const useGetImageItem = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /**
   * imageId로 db에서 이미지 데이터를 불러오는 비동기 함수
   * */
  const getImageItem = async (id: string): Promise<ImageItem | null> => {
    setIsLoading(true);
    const docRef = doc(db, "images", id);
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
  };

  return { getImageItem, isLoading };
};

export default useGetImageItem;
