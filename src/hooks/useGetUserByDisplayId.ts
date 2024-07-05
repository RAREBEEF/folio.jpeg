import { UserData } from "@/types";
import { useState } from "react";
import { useRecoilState } from "recoil";
import _ from "lodash";
import { usersDataState } from "@/recoil/states";
import useGetExtraUserDataByDisplayId from "./useGetExtraUserDataByDisplayId";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";

const useGetUserBydisplayId = () => {
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
    return await getExtraUserDataByDisplayId({ displayId }).then(
      async (extraUserData) => {
        if (!extraUserData?.data) {
          return null;
        }

        const { uid } = extraUserData.data;

        // 불러온 extraUserData의 uid에 해당하는 userData를 서버에 요청
        const userData = await fetch("/api/get-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid }),
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
      },
    );
  };

  const getUserByDisplayIdAsync = async ({
    displayId,
  }: {
    displayId: string;
  }): Promise<UserData | null> => {
    console.log("유저데이터 불러오기");
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

export default useGetUserBydisplayId;
