import { UserData } from "@/types";
import { useState } from "react";
import { useRecoilState } from "recoil";
import _ from "lodash";
import { usersDataState } from "@/recoil/states";
import useGetExtraUserDataByDisplayId from "./useGetExtraUserDataByDisplayId";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";

const useGetUserByDisplayId = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const { getExtraUserDataByDisplayId } = useGetExtraUserDataByDisplayId();
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUser = async ({
    displayId,
  }: {
    displayId: string;
  }): Promise<UserData | null> => {
    const extraUserData = await getExtraUserDataByDisplayId({ displayId });

    if (!extraUserData?.data) {
      return null;
    }

    const { uid } = extraUserData.data;

    // 불러온 extraUserData의 uid에 해당하는 userData를 서버에 요청
    const userData = await fetch(`/api/user/${uid}`, {
      method: "GET",
    }).then(async (response) => {
      return await response.json();
    });

    if (userData.data) {
      const data: UserData = {
        ...userData.data,
        ...extraUserData.data,
        uid,
      };
      setUsersData((prev) => ({ ...prev, [uid]: data }));
      return data;
    } else {
      return null;
    }
  };

  const getUserByDisplayIdAsync = async ({
    displayId,
  }: {
    displayId: string;
  }): Promise<UserData | null> => {
    console.log("useGetUserByDisplayId");
    return await fetchUser({ displayId });
  };

  const getUserByDisplayId = async ({
    displayId,
  }: {
    displayId: string;
  }): Promise<UserData | null> => {
    if (isLoading) return null;
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: getUserByDisplayIdAsync,
        args: { displayId },
      });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getUserByDisplayId, isLoading };
};

export default useGetUserByDisplayId;
