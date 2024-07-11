import { db } from "@/fb";
import { UserData, ExtraUserData } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useRecoilState } from "recoil";
import _ from "lodash";
import { usersDataState } from "@/recoil/states";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";

const useGetUserByUid = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUser = async ({
    uid,
  }: {
    uid: string;
  }): Promise<UserData | null> => {
    const docRef = doc(db, "users", uid);

    const [userData, extraUserData]: [{ data: UserData }, ExtraUserData] =
      await Promise.all([
        fetch(`/api/user/${uid}`, {
          method: "GET",
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

  const getUserByUidAsync = async ({
    uid,
  }: {
    uid: string;
  }): Promise<UserData | null> => {
    console.log("useGetUserByUid");
    return await fetchUser({ uid });
  };

  const getUserByUid = async ({
    uid,
  }: {
    uid: string;
  }): Promise<UserData | null> => {
    if (isLoading) return null;
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: getUserByUidAsync,
        args: { uid },
      });
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
