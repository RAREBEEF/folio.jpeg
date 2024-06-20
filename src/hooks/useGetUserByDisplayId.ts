import { db } from "@/fb";
import { UserData, ExtraUserData } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useRecoilState } from "recoil";
import _ from "lodash";
import { usersDataState } from "@/recoil/states";
import useGetExtraUserData from "./useGetExtraUserData";

const useGetUserBydisplayId = () => {
  const { getExtraUserData } = useGetExtraUserData();
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUser = async (displayId: string): Promise<UserData | null> => {
    return await getExtraUserData(displayId).then(async (extraUserData) => {
      if (!extraUserData) {
        return null;
      }

      const { uid } = extraUserData;

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
        const data: UserData = { ...userData.data, ...extraUserData, uid };
        setUsersData((prev) => ({ ...prev, [uid]: data }));
        return data;
      } else {
        return null;
      }
    });
  };

  const getUserByDisplayId = async (
    displayId: string,
  ): Promise<UserData | null> => {
    if (isLoading) return null;
    console.log("load user");
    setIsLoading(true);
    const userData = fetchUser(displayId);
    setIsLoading(false);

    return userData;
  };

  return { getUserByDisplayId, isLoading };
};

export default useGetUserBydisplayId;
