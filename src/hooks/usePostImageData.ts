import { db, storage } from "@/fb";
import { ImageDocData } from "@/types";
import {
  doc,
  FieldValue,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";
import { deleteObject, ref } from "firebase/storage";
import useFetchWithRetry from "./useFetchWithRetry";

const usePostImageData = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const postImageDataAsync = async ({
    id,
    data,
    update = false,
  }: {
    id: string;
    data: ImageDocData;
    update: boolean;
  }): Promise<"success" | "error"> => {
    console.log("useSetImageData", data);
    const imageDocRef = doc(db, "images", id);
    const tagsDocRef = doc(db, "tags", "data");

    const newTags: { [key in string]: FieldValue } = {};
    data.tags.forEach((tag) => {
      newTags["list." + tag] = increment(1);
    });

    const promises = [updateDoc(tagsDocRef, newTags)];

    if (update) {
      const updateData: any = { ...data };
      delete updateData.likes;
      promises.push(updateDoc(imageDocRef, { ...updateData }));
    } else {
      promises.push(setDoc(imageDocRef, data));
    }

    await Promise.all(promises).then(() => {
      setIsLoading(false);
    });

    return "success";
  };

  const postImageData = async ({
    id,
    data,
    update = false,
  }: {
    id: string;
    data: ImageDocData;
    update: boolean;
  }): Promise<"success" | "error" | ""> => {
    setIsLoading(true);

    try {
      await fetchWithRetry({
        asyncFn: postImageDataAsync,
        args: {
          id,
          data,
          update,
        },
      });
      return "success";
    } catch (error) {
      // 스토리지에서 이미지 삭제
      console.log(error);
      const storageRef = ref(storage, `images/${data.uid}/${data.fileName}`);
      await deleteObject(storageRef);
      showErrorAlert();
      return "error";
    } finally {
      setIsLoading(false);
    }
  };

  return { postImageData, isLoading };
};

export default usePostImageData;
