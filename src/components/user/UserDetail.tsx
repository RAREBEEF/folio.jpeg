"use client";

import {
  authStatusState,
  loginModalState,
  userDataState,
  usersDataState,
} from "@/recoil/states";
import { useRecoilState, useRecoilValue } from "recoil";
import Loading from "@/components/loading/Loading";
import { useParams, useSearchParams } from "next/navigation";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import ProfileImage from "@/components/user/ProfileImage";
import Link from "next/link";
import SavedTab from "@/components/saveImage/SavedTab";
import UserImageList from "../imageList/UserImageList";
import Button from "../Button";
import { useRouter } from "next/navigation";
import FollowBtn from "./FollowBtn";
import Follow from "./Follow";
import useGetUserBydisplayId from "@/hooks/useGetUserByDisplayId";
import Feedback from "./Feedback";

const UserDetail = () => {
  const { getUserByDisplayId } = useGetUserBydisplayId();
  const { replace } = useRouter();
  const [loginModal, setLoginModal] = useRecoilState(loginModalState);
  const params = useSearchParams();
  const { displayId: dpid } = useParams();
  const displayId = useMemo(
    (): string => JSON.stringify(dpid).replaceAll('"', ""),
    [dpid],
  );
  const tab = useMemo(
    () => (params.get("tab") === "uploaded" ? "uploaded" : "saved"),
    [params],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const [userData, setUserData] = useRecoilState(userDataState(displayId));
  const [usersData, setUsersData] = useRecoilState(usersDataState);

  useEffect(() => {
    // displayId가 없거나 userData가 이미 있거나 현재 불러오는 중이면 불러오지 않음
    if (!displayId || userData || isLoading || authStatus.status === "pending")
      return;

    setIsLoading(true);

    // url 파라미터에서 displayId 가져오기
    const curDisplayId = displayId;

    // 현재 페이지가 내 페이지이면 지금 갖고있는 내 userData를 userData 상태에 할당
    if (
      authStatus.status === "signedIn" &&
      authStatus.data &&
      authStatus.data.displayId === curDisplayId
    ) {
      const myData = authStatus.data;
      setUserData(myData);
      setUsersData((prev) => ({ ...prev, [myData.uid]: myData }));
      setIsLoading(false);
    } else {
      // 내 페이지가 아니면 해당 유저의 정보를 불러와서 userData 상태에 할당
      // usersData에서 데이터 찾아보기
      const users = Object.entries(usersData);
      const userIndex = users.findIndex(([uid, userData]) => {
        userData.displayId === displayId;
      });

      // usersData에 데이터가 있으면
      if (userIndex !== -1) {
        const data = users[userIndex][1];
        setUserData(data);
        setIsLoading(false);
      } else {
        // usersData에 데이터가 없으면
        // 해당 유저의 displayId로 extraUserData 불러오기
        (async () => {
          const data = await getUserByDisplayId(curDisplayId);
          setUserData(data);
          setIsLoading(false);
        })();
      }
    }
  }, [
    authStatus.data,
    authStatus.status,
    displayId,
    isLoading,
    userData,
    replace,
    setUserData,
    setUsersData,
    usersData,
    getUserByDisplayId,
  ]);

  const onProfileEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoginModal({ show: true, showInit: true });
  };

  return (
    <div className="h-full bg-shark-50">
      {!isLoading && userData ? (
        <div className="flex flex-col gap-4 pb-12">
          <div className="relative flex flex-col items-center gap-5 pb-4 pt-12">
            {authStatus.data?.uid === userData.uid && (
              <div className="absolute right-2 top-2 text-xs">
                <Button onClick={onProfileEditClick}>
                  <div>프로필 수정</div>
                </Button>
              </div>
            )}
            <div className="w-[50%] max-w-72">
              <ProfileImage url={userData.photoURL} />
            </div>
            <h3 className="flex flex-col items-center">
              <span className="text-2xl font-bold text-shark-950">
                {userData.displayName}
              </span>
              <span className="text-base text-shark-500">
                @{userData.displayId}
              </span>
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pb-8">
            {authStatus.data && authStatus.data?.uid !== userData.uid && (
              <div className="text-sm">
                <FollowBtn userData={userData} />
              </div>
            )}
            <Follow displayId={displayId} />
          </div>

          <Feedback />

          <nav className="flex justify-center gap-12 text-lg font-semibold">
            <Link
              href={`/${displayId}?tab=uploaded`}
              scroll={false}
              className={`border-shark-950 ${tab === "uploaded" && "border-b-2"}`}
            >
              업로드한 이미지
            </Link>
            <Link
              href={`/${displayId}?tab=saved`}
              scroll={false}
              className={`border-shark-950 ${tab === "saved" && "border-b-2"}`}
            >
              저장한 이미지
            </Link>
          </nav>
          <div>
            {tab === "uploaded" ? (
              <UserImageList userData={userData} />
            ) : (
              <SavedTab userData={userData} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center">
          <Loading height="24px" />
        </div>
      )}
    </div>
  );
};

export default UserDetail;
