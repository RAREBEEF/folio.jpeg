import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import { ref } from "firebase/storage";

const useSetImageAndGetUrl = () => {
  const setImageAndGetUrl = async (
    uid: string,
    fileName: string,
    img: File,
  ) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${uid}/${fileName}`);
    const downloadURL = await uploadBytes(storageRef, img).then(async () => {
      return await getDownloadURL(storageRef);
    });

    return downloadURL;
  };

  return setImageAndGetUrl;
};

export default useSetImageAndGetUrl;
