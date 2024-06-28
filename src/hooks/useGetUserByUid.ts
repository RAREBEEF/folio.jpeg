import { db } from "@/fb";
import { UserData, ExtraUserData } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useRecoilState } from "recoil";
import _ from "lodash";
import { usersDataState } from "@/recoil/states";
import useErrorAlert from "./useErrorAlert";

const useGetUserByUid = () => {
  const showErrorAlert = useErrorAlert();
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUser = async (uid: string): Promise<UserData | null> => {
    const docRef = doc(db, "users", uid);

    const [userData, extraUserData]: [{ data: UserData }, ExtraUserData] =
      await Promise.all([
        fetch("/api/get-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid }),
        }).then(async (response) => {
          return await response.json();
        }),
        getDoc(docRef).then((doc) => {
          return doc.data() as ExtraUserData;
        }),
      ]);

    if (userData.data) {
      setUsersData((prev) => ({
        [uid]: { ...userData.data, ...extraUserData },
        ...prev,
      }));

      return { ...userData.data, ...extraUserData, uid };
    } else {
      return null;
    }
  };

  const getUserByUid = async (uid: string): Promise<UserData | null> => {
    setIsLoading(true);
    try {
      const userData = fetchUser(uid);
      setIsLoading(false);
      return userData;
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getUserByUid, isLoading };
};

export default useGetUserByUid;
