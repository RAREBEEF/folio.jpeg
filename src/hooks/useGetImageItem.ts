import { db } from "@/fb";
import { ImageDocData, ImageItem } from "@/types";
import { doc, getDoc } from "firebase/firestore";

const useGetImageItem = () => {
  const getImageItem = async (id: string): Promise<ImageItem | null> => {
    const docRef = doc(db, "images", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const imageData = docSnap.data() as ImageDocData;
      const imageItem = { ...imageData, grid: null, id: docSnap.id };
      return imageItem;
    } else {
      return null;
    }
  };

  return getImageItem;
};

export default useGetImageItem;
