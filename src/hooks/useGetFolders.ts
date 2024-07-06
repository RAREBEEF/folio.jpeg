import { db } from "@/fb";
import { authStatusState } from "@/recoil/states";
import { Folder, Folders } from "@/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";

const useGetFolders = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);

  const getFoldersAsync = async ({ uid }: { uid: string }) => {
    console.log("useGetFolders");
    const foldersRef = collection(db, "users", uid, "folders");
    const queries = [];
    if (!authStatus.data || authStatus.data?.uid !== uid) {
      queries.push(where("isPrivate", "==", false));
    }
    const q = query(foldersRef, ...queries);
    const docSnap = await getDocs(q);
    const folders: Folders = [];
    docSnap.forEach((doc) => {
      const folder = doc.data() as Folder;
      folders.push(folder);
    });

    return folders;
  };
  const getFolders = async ({ uid }: { uid: string }) => {
    if (isLoading) return null;
    setIsLoading(true);

    try {
      return await fetchWithRetry({ asyncFn: getFoldersAsync, args: { uid } });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getFolders, isLoading };
};

export default useGetFolders;
