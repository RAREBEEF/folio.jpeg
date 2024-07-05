import { db } from "@/fb";
import { UserData, ExtraUserData } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useRecoilState } from "recoil";
import _ from "lodash";
import { usersDataState } from "@/recoil/states";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";

const useGetUsersByUids = () => {
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

  const getUsersByUidAsync = async ({
    uids,
  }: {
    uids: Array<string>;
  }): Promise<Array<UserData>> => {
    const fetches = uids.map((uid) => fetchUser({ uid }));
    const results = await Promise.all(fetches);
    return results.filter((result) => result !== null) as Array<UserData>;
  };

  const getUsersByUid = async ({
    uids,
  }: {
    uids: Array<string>;
  }): Promise<Array<UserData>> => {
    if (uids.length <= 0 || isLoading) return [];

    setIsLoading(true);
    try {
      return await fetchWithRetry({
        asyncFn: getUsersByUidAsync,
        args: { uids },
      });
    } catch (error) {
      showErrorAlert();
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { getUsersByUid, isLoading };
};

export default useGetUsersByUids;
