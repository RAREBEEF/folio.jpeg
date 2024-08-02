import { db } from "@/fb";
import {
  authStatusState,
  loginModalState,
  userDataState,
  usersDataState,
} from "@/recoil/states";
import { AuthStatus, UserData } from "@/types";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import useSendFcm from "./useSendFcm";
import useErrorAlert from "./useErrorAlert";

const useFollow = ({ targetUid }: { targetUid: string }) => {
  const showErrorAlert = useErrorAlert();
  const sendFcm = useSendFcm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setLoginModal = useSetRecoilState(loginModalState);
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);
  const [alreadyFollowing, setAlreadyFollowing] = useState<boolean>(false);
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [targetDisplayId, setTargetDisplayId] = useState<string>(
    usersData[targetUid]?.displayId || "",
  );
  const [targetUserData, setTargetUserData] = useRecoilState(
    userDataState(targetDisplayId),
  );
  const [myUserData, setMyUserData] = useRecoilState(
    userDataState(authStatus.data?.displayId || ""),
  );

  const checkAlreadyFollowing = useCallback(
    (targetUid: string) => {
      const alreadyFollowing =
        authStatus.data?.following?.includes(targetUid) || false;
      setAlreadyFollowing(alreadyFollowing);
    },
    [authStatus.data],
  );

  // 현재 대상의 데이터 초기화
  useEffect(() => {
    const displayId = usersData[targetUid]?.displayId;
    if (displayId) {
      setTargetDisplayId(displayId);
    }
  }, [targetUid, usersData]);

  useEffect(() => {
    checkAlreadyFollowing(targetUid);
  }, [checkAlreadyFollowing, targetUid, authStatus.data]);

  const follow = async () => {
    console.log("useFollow");
    if (
      typeof targetUid !== "string" ||
      isLoading ||
      targetUid === authStatus.data?.uid
    ) {
      return;
      // 로그인 및 프로필 설정이 완료되지 않은 경우에는 모달을 출력한다.
    } else if (authStatus.status !== "signedIn" || !authStatus.data) {
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
      return;
    }

    setIsLoading(true);
    setAlreadyFollowing(true);

    const myUid = authStatus.data.uid;

    let prevTargetUserData: UserData | null = targetUserData;
    let prevMyUserData: UserData | null = myUserData;
    let prevUsersData: { [key in string]: UserData } = usersData;
    let prevAuthStatus: AuthStatus = authStatus;

    // 유저 관련 상태 모두 업데이트하기
    setTargetUserData((prev) => {
      if (!prev) return prev;

      return { ...prev, follower: [myUid, ...(prev.follower || [])] };
    });
    setMyUserData((prev) => {
      if (!prev) return prev;

      return { ...prev, following: [targetUid, ...(prev.following || [])] };
    });
    setUsersData((prev) => {
      if (!prev || (!prev[targetUid] && !prev[myUid])) return prev;

      const newUsersData = _.cloneDeep(prev);
      if (prev[targetUid]) {
        newUsersData[targetUid].follower = [
          myUid,
          ...(newUsersData[targetUid].follower || []),
        ];
      }
      if (prev[myUid]) {
        newUsersData[myUid].following = [
          targetUid,
          ...(newUsersData[myUid].following || []),
        ];
      }

      return newUsersData;
    });
    setAuthStatus((prev) => {
      if (!prev) return prev;

      return prev.status === "signedIn"
        ? {
            status: prev.status,
            data: {
              ...prev.data,
              following: [targetUid, ...(prev.data?.following || [])],
            },
          }
        : prev;
    });

    // db 업데이트하기
    const targetDocRef = doc(db, "users", targetUid);
    const myDocRef = doc(db, "users", myUid);

    try {
      await Promise.all([
        updateDoc(myDocRef, {
          following: arrayUnion(targetUid),
        }),
        updateDoc(targetDocRef, {
          follower: arrayUnion(myUid),
        }),
      ]);
      // 팔로우 대상에게 푸시 전송
      await sendFcm({
        data: {
          title: `${authStatus.data?.displayName}님이 회원님을 팔로우하기 시작했습니다.`,
          body: null,
          profileImage: authStatus.data?.photoURL,
          targetImage: null,
          click_action: authStatus.data?.displayId
            ? `/${authStatus.data?.displayId}`
            : "/",
          fcmTokens: targetUserData?.fcmToken
            ? [targetUserData?.fcmToken]
            : null,
          tokenPath: targetUserData?.fcmToken ? null : `users/${targetUid}`,
          uids: [targetUid],
        },
      });
    } catch (error) {
      // 에러 시 롤백
      setAlreadyFollowing(false);
      setTargetUserData(prevTargetUserData);
      setMyUserData(prevMyUserData);
      setUsersData(prevUsersData);
      setAuthStatus(prevAuthStatus);
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  const unfollow = async () => {
    console.log("useFollow");
    if (typeof targetUid !== "string" || isLoading) return;
    if (authStatus.status !== "signedIn" || !authStatus.data) {
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
      return;
    }
    const myUid = authStatus.data.uid;
    setIsLoading(true);
    setAlreadyFollowing(false);

    let prevTargetUserData: UserData | null = targetUserData;
    let prevMyUserData: UserData | null = myUserData;
    let prevUsersData: { [key in string]: UserData } = usersData;
    let prevAuthStatus: AuthStatus = authStatus;

    // 유저 관련 상태 모두 업데이트하기
    setTargetUserData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        follower: prev.follower?.filter((uid) => uid !== myUid),
      };
    });
    setMyUserData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        following: prev.following?.filter((uid) => uid !== targetUid),
      };
    });
    setUsersData((prev) => {
      if (!prev || (!prev[targetUid] && !prev[myUid])) return prev;

      const newUsersData = _.cloneDeep(prev);
      if (prev[targetUid]) {
        newUsersData[targetUid].follower = newUsersData[
          targetUid
        ].follower?.filter((uid) => uid !== myUid);
      }
      if (prev[myUid]) {
        newUsersData[myUid].following = newUsersData[myUid].follower?.filter(
          (uid) => uid !== targetUid,
        );
      }

      return newUsersData;
    });
    setAuthStatus((prev) => {
      if (!prev) return prev;

      return prev.status === "signedIn"
        ? {
            status: prev.status,
            data: {
              ...prev.data,
              following: prev.data?.following?.filter(
                (uid) => uid !== targetUid,
              ),
            },
          }
        : prev;
    });

    // db 업데이트하기
    const targetDocRef = doc(db, "users", targetUid);
    const myDocRef = doc(db, "users", myUid);

    try {
      await Promise.all([
        updateDoc(myDocRef, {
          following: arrayRemove(targetUid),
        }),
        updateDoc(targetDocRef, {
          follower: arrayRemove(myUid),
        }),
      ]);
      setAlreadyFollowing(false);
    } catch (error) {
      // 에러 시 롤백
      setAlreadyFollowing(true);
      setTargetUserData(prevTargetUserData);
      setMyUserData(prevMyUserData);
      setUsersData(prevUsersData);
      setAuthStatus(prevAuthStatus);
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  return { follow, unfollow, alreadyFollowing, isLoading };
};

export default useFollow;
