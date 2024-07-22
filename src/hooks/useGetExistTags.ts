import { db } from "@/fb";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";

const useGetExistTags = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getExistTagsAsync = async () => {
    console.log("useGetExistTags");

    let existTags: { [key in string]: number } = {};
    const docRef = doc(db, "tags", "data");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      existTags = docSnap.data().list;
    }

    return existTags;
  };

  const getExistTags = async () => {
    console.log("useGetExistTags");
    if (isLoading) return;
    setIsLoading(true);

    try {
      const data = await fetchWithRetry({ asyncFn: getExistTagsAsync });
      return data;
    } catch (error) {
      showErrorAlert();
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { getExistTags, isLoading };
};

export default useGetExistTags;
