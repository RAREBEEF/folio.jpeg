import { db, storage } from "@/fb";
import { ImageDocData } from "@/types";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";
import { deleteObject, ref } from "firebase/storage";
import useFetchWithRetry from "./useFetchWithRetry";

const useSetImageData = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setImageDataAsync = async ({
    id,
    data,
    update = false,
  }: {
    id: string;
    data: ImageDocData;
    update: boolean;
  }): Promise<"success" | "error"> => {
    console.log("useSetImageData");
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
    return "success";
  };

  const setImageData = async ({
    id,
    data,
    update = false,
  }: {
    id: string;
    data: ImageDocData;
    update: boolean;
  }): Promise<"success" | "error" | ""> => {
    if (isLoading) return "error";

    setIsLoading(true);

    try {
      await fetchWithRetry({
        asyncFn: setImageDataAsync,
        args: {
          id,
          data,
          update,
        },
      });
      return "success";
    } catch (error) {
      // 스토리지에서 이미지 삭제
      const storageRef = ref(storage, `images/${data.uid}/${data.fileName}`);
      await deleteObject(storageRef);
      showErrorAlert();
      return "error";
    } finally {
      setIsLoading(false);
    }
  };

  return { setImageData, isLoading };
};

export default useSetImageData;
