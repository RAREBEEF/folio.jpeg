import { db } from "@/fb";
import { ImageDocData } from "@/types";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const useSetImageData = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setImageData = async (
    id: string,
    data: ImageDocData,
    update: boolean = false,
  ) => {
    setIsLoading(true);

    const docRef = doc(db, "images", id);

    if (update) {
      const updateData: any = { ...data };
      delete updateData.likes;
      await updateDoc(docRef, { ...updateData }).then(() => {
        setIsLoading(false);
      });
    } else {
      await setDoc(docRef, data).then(() => {
        setIsLoading(false);
      });
    }
  };

  return { setImageData, isLoading };
};

export default useSetImageData;
