import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/fb";
import { ExtraUserData } from "@/types";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";

/**
 * 유저의 추가 정보를 불러오는 함수를 반환하는 커스텀 훅
 */
const useGetExtraUserDataByDisplayId = () => {
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /**
   * 유저의 추가 정보를 불러오는 비동기 함수
   */
  const getExtraUserDataByDisplayId = async ({
    displayId,
  }: {
    displayId: string;
  }): Promise<null | {
    status: "success" | "notFound" | "error";
    data: null | { uid: string; displayId: string; photoURL: string };
  }> => {
    setIsLoading(true);

    try {
      const usersRef = collection(db, "users");
      // displayId는 고유값이므로 limit=1 로 쿼리
      const q = query(usersRef, where("displayId", "==", displayId), limit(1));
      const querySnapshot = await getDocs(q);

      let uid: string | null = null;
      let extraUserData: ExtraUserData | null = null;

      querySnapshot.forEach((doc) => {
        uid = doc.id;
        extraUserData = doc.data() as ExtraUserData;
      });

      // 유저가 없으면 null, 있으면 데이터 반환
      return !uid || !extraUserData
        ? { status: "notFound", data: null }
        : {
            status: "success",
            data: {
              uid,
              ...(extraUserData as ExtraUserData),
            },
          };
    } catch (error) {
      console.log("에러용");
      showErrorAlert();
      return { status: "error", data: null };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getExtraUserDataByDisplayId: getExtraUserDataByDisplayId,
    isLoading,
  };
};

export default useGetExtraUserDataByDisplayId;
