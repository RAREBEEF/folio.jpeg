import { db } from "@/fb";
import { authStatusState } from "@/recoil/states";
import { Folder, Folders } from "@/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { useRecoilValue } from "recoil";

const useGetFolders = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);

  const getFolders = async (uid: string) => {
    setIsLoading(true);

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

    setIsLoading(false);
    return folders;
  };

  return { getFolders, isLoading };
};

export default useGetFolders;
