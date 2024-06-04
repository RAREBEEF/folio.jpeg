import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/fb";
import { ExtraUserData } from "@/types";
import { useState } from "react";

/**
 * 유저의 추가 정보를 불러오는 함수를 반환하는 커스텀 훅
 */
const useGetExtraUserData = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /**
   * 유저의 추가 정보를 불러오는 비동기 함수
   */
  const getExtraUserData = async (
    displayId: string,
  ): Promise<null | { uid: string; displayId: string; photoURL: string }> => {
    setIsLoading(true);
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
    setIsLoading(false);
    return !uid || !extraUserData
      ? null
      : {
          uid,
          ...(extraUserData as ExtraUserData),
        };
  };

  return { getExtraUserData, isLoading };
};

export default useGetExtraUserData;
