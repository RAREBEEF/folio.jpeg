import { auth, db } from "@/fb";
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

const useFollow = (targetUid: string) => {
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
  const [targetuserData, setTargetuserData] = useRecoilState(
    userDataState(targetDisplayId),
  );
  const [myuserData, setMyuserData] = useRecoilState(
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

    let prevTargetuserData: UserData | null;
    let prevMyuserData: UserData | null;
    let prevUsersData: { [key in string]: UserData };
    let prevAuthStatus: AuthStatus;

    // 유저 관련 상태 모두 업데이트하기
    setTargetuserData((prev) => {
      prevTargetuserData = prev;
      if (!prev) return prev;

      return { ...prev, follower: [myUid, ...(prev.follower || [])] };
    });
    setMyuserData((prev) => {
      prevMyuserData = prev;
      if (!prev) return prev;

      return { ...prev, following: [targetUid, ...(prev.following || [])] };
    });
    setUsersData((prev) => {
      prevUsersData = prev;
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
      prevAuthStatus = prev;
      if (!prev) return prev;
      const newAuthStatus = _.cloneDeep(prev);

      return {
        ...newAuthStatus,
        data: newAuthStatus.data
          ? {
              ...newAuthStatus.data,
              following: [targetUid, ...(newAuthStatus.data?.following || [])],
            }
          : null,
      };
    });

    // db 업데이트하기
    const targetDocRef = doc(db, "users", targetUid);
    const myDocRef = doc(db, "users", myUid);
    await Promise.all([
      updateDoc(myDocRef, {
        following: arrayUnion(targetUid),
      }),
      updateDoc(targetDocRef, {
        follower: arrayUnion(myUid),
      }),
    ])
      .then(async () => {
        // 팔로우 대상에게 푸시 전송
        await sendFcm({
          data: {
            title: `${authStatus.data?.displayName}님이 회원님을 팔로우하기 시작했습니다.`,
            body: null,
            image: authStatus.data?.photoURL,
            click_action: authStatus.data?.displayId
              ? `/${authStatus.data?.displayId}`
              : "/",
            fcmTokens: targetuserData?.fcmToken
              ? [targetuserData?.fcmToken]
              : null,
            tokenPath: targetuserData?.fcmToken ? null : `users/${targetUid}`,
            uids: [targetUid],
          },
        });
      })
      .catch((error) => {
        // 에러 시 롤백
        setAlreadyFollowing(false);
        setTargetuserData(prevTargetuserData);
        setMyuserData(prevMyuserData);
        setUsersData(prevUsersData);
        setAuthStatus(prevAuthStatus);
        showErrorAlert();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const unfollow = async () => {
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

    let prevTargetuserData: UserData | null;
    let prevMyuserData: UserData | null;
    let prevUsersData: { [key in string]: UserData };
    let prevAuthStatus: AuthStatus;

    // 유저 관련 상태 모두 업데이트하기
    setTargetuserData((prev) => {
      prevTargetuserData = prev;
      if (!prev) return prev;

      return {
        ...prev,
        follower: prev.follower?.filter((uid) => uid !== myUid),
      };
    });
    setMyuserData((prev) => {
      prevMyuserData = prev;
      if (!prev) return prev;

      return {
        ...prev,
        following: prev.following?.filter((uid) => uid !== targetUid),
      };
    });
    setUsersData((prev) => {
      prevUsersData = prev;
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
      prevAuthStatus = prev;
      if (!prev) return prev;
      const newAuthStatus = _.cloneDeep(prev);

      return {
        ...newAuthStatus,
        data: newAuthStatus.data
          ? {
              ...newAuthStatus.data,
              following: newAuthStatus.data?.following?.filter(
                (uid) => uid !== targetUid,
              ),
            }
          : null,
      };
    });

    // db 업데이트하기
    const targetDocRef = doc(db, "users", targetUid);
    const myDocRef = doc(db, "users", myUid);

    await Promise.all([
      updateDoc(myDocRef, {
        following: arrayRemove(targetUid),
      }),
      updateDoc(targetDocRef, {
        follower: arrayRemove(myUid),
      }),
    ])
      .then(() => {
        setAlreadyFollowing(false);
      })
      .catch((error) => {
        // 에러 시 롤백
        setAlreadyFollowing(true);
        setTargetuserData(prevTargetuserData);
        setMyuserData(prevMyuserData);
        setUsersData(prevUsersData);
        setAuthStatus(prevAuthStatus);
        showErrorAlert();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { follow, unfollow, alreadyFollowing, isLoading };
};

export default useFollow;
