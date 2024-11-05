"use client";

import {
  authStatusState,
  loginModalState,
  userDataState,
  usersDataState,
} from "@/recoil/states";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import Loading from "@/components/loading/Loading";
import { useParams, useSearchParams } from "next/navigation";
import { MouseEvent, useEffect, useMemo } from "react";
import ProfileImage from "@/components/user/ProfileImage";
import Link from "next/link";
import SavedTab from "@/components/saveImage/SavedTab";
import UserImageList from "../imageList/UserImageList";
import { useRouter } from "next/navigation";
import FollowBtn from "./FollowBtn";
import Follow from "./Follow";
import useGetUserByDisplayId from "@/hooks/useGetUserByDisplayId";
import AiFeedback from "./AiFeedback";
import Share from "../Share";
import PenSvg from "@/icons/pen-solid.svg";
import Image from "next/image";
import IconWithTooltip from "../IconWithTooltip";
import ExternalLink from "../ExternalLink";
import ensureHttp from "@/tools/ensureHttp";

const UserDetail = () => {
  const { getUserByDisplayId, isLoading } = useGetUserByDisplayId();
  const { replace } = useRouter();
  const setLoginModal = useSetRecoilState(loginModalState);
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
  const authStatus = useRecoilValue(authStatusState);
  const [userData, setUserData] = useRecoilState(userDataState(displayId));
  const [usersData, setUsersData] = useRecoilState(usersDataState);

  useEffect(() => {
    // displayId가 없거나 userData가 이미 있거나 현재 불러오는 중이면 불러오지 않음
    if (!displayId || userData || isLoading || authStatus.status === "pending")
      return;

    // URL 파라미터에서 displayId 가져오기
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
      } else {
        // usersData에 데이터가 없으면
        // 해당 유저의 displayId로 extraUserData 불러오기
        (async () => {
          const data = await getUserByDisplayId({ displayId: curDisplayId });
          if (!data) {
            replace("/");
          } else {
            setUserData(data);
          }
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
    <div className="h-full bg-white">
      {!isLoading && userData ? (
        <div className="flex flex-col gap-4 pb-12">
          <div className="relative flex flex-col items-center gap-5 pb-4 pt-8">
            <div className="relative h-[336px] w-[80%]">
              {userData.bgPhotoURL && (
                <div className="w-full">
                  <div className="relative m-auto h-[336px] w-full overflow-hidden rounded-lg">
                    <Image
                      src={userData.bgPhotoURL}
                      alt={"banner image"}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 z-10 m-auto w-[40%] max-w-64 pb-6 pt-12">
                <ProfileImage URL={userData.photoURL} />
              </div>
            </div>

            <h3 className="relative flex w-[80%] flex-col items-center">
              <span className="text-2xl font-bold ">
                {userData.displayName}
              </span>
              <span className="text-base text-astronaut-500">
                @{userData.displayId}
              </span>

              <div className="absolute right-5 top-0 flex gap-2 text-xs">
                <Share />
                {authStatus.data?.uid === userData.uid && (
                  <button onClick={onProfileEditClick}>
                    <IconWithTooltip text="수정" tooltipDirection="top">
                      <PenSvg className="h-7 fill-astronaut-700 p-1 transition-all hover:fill-astronaut-500" />
                    </IconWithTooltip>
                  </button>
                )}
              </div>
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 ">
            {authStatus.data?.uid !== userData.uid && (
              <div className="text-sm">
                <FollowBtn userData={userData} />
              </div>
            )}
            <Follow displayId={displayId} />
          </div>

          {userData.introduce && (
            <div className="m-auto mt-5 w-fit whitespace-pre text-sm text-astronaut-400">
              {userData.introduce}
            </div>
          )}

          <div className="flex w-full justify-center gap-x-24 pb-8">
            {userData.links?.some((link) => link !== "") && (
              <div className="mt-5 flex flex-col gap-1">
                {userData.links.map((link, i) => (
                  <a
                    key={link + i}
                    href={ensureHttp(link)}
                    target="_blank"
                    className="fill-astronaut-500 text-sm text-astronaut-500"
                  >
                    <ExternalLink href={link} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <AiFeedback userData={userData} />

          <nav className="flex justify-center gap-12 text-lg font-semibold">
            <Link
              href={`/${displayId}?tab=uploaded`}
              scroll={false}
              className={`border-astronaut-950 ${tab === "uploaded" && "border-b-2"}`}
            >
              업로드한 이미지
            </Link>
            <Link
              href={`/${displayId}?tab=saved`}
              scroll={false}
              className={`border-astronaut-950 ${tab === "saved" && "border-b-2"}`}
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
