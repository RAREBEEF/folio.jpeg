import { db } from "@/fb";
import { ImageDocData } from "@/types";
import { doc, setDoc } from "firebase/firestore";

const useSetImageData = () => {
  const setImageData = async (id: string, data: ImageDocData) => {
    const docRef = doc(db, "images", id);
    await setDoc(docRef, data);
  };

  return setImageData;
};

export default useSetImageData;
