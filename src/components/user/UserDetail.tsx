"use client";

import {
  authStatusState,
  pageUserDataState,
  usersDataState,
} from "@/recoil/states";
import { useRecoilState, useRecoilValue } from "recoil";
import Loading from "../Loading";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useGetExtraUserData from "@/hooks/useGetExtraUserData";
import { UserData } from "@/types";
import ProfileImage from "../ProfileImage";
import Link from "next/link";
import SavedTab from "./SavedTab";
import UserImageList from "../imageList/UserImageList";

const UserDetail = () => {
  const params = useSearchParams();
  const { displayId } = useParams();
  const tab = useMemo(
    () => (params.get("tab") === "uploaded" ? "uploaded" : "saved"),
    [params],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getExtraUserData } = useGetExtraUserData();
  const authStatus = useRecoilValue(authStatusState);
  const [pageUserData, setPageUserData] = useRecoilState(
    pageUserDataState(JSON.stringify(displayId).replaceAll('"', "")),
  );
  const [usersData, setUsersData] = useRecoilState(usersDataState);

  useEffect(() => {
    // displayId가 없거나 pageUserData가 이미 있거나 현재 불러오는 중이면 불러오지 않음
    if (!displayId || pageUserData || isLoading) return;

    setIsLoading(true);

    // url 파라미터에서 displayId 가져오기
    const curDisplayId = JSON.stringify(displayId).replaceAll('"', "");

    // 현재 페이지가 내 페이지이면 지금 갖고있는 내 userData를 pageUserData 상태에 할당
    if (
      authStatus.status === "signedIn" &&
      authStatus.data &&
      authStatus.data.displayId === curDisplayId
    ) {
      setPageUserData(authStatus.data);
      setIsLoading(false);
    } else {
      // 내 페이지가 아니면 해당 유저의 정보를 불러와서 pageUserData 상태에 할당
      // 해당 유저의 displayId로 extraUserData 불러오기
      (async () => {
        await getExtraUserData(curDisplayId).then(async (extraUserData) => {
          if (!extraUserData) return;

          const { uid } = extraUserData;

          // 불러온 extraUserData의 uid에 해당하는 userData를 서버에 요청
          await fetch("/api/get-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uid }),
          }).then(async (response) => {
            const { data: userData } = await response.json();

            const data = { ...userData, ...extraUserData };

            setUsersData((prev) => ({ ...prev, [uid]: data }));
            setPageUserData(data);
            setIsLoading(false);
          });
        });
      })();
    }
  }, [
    authStatus.data,
    authStatus.status,
    displayId,
    getExtraUserData,
    isLoading,
    pageUserData,
    setPageUserData,
    setUsersData,
  ]);

  return (
    <div className="h-full bg-shark-50">
      {!isLoading && pageUserData ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-5 p-12">
            <div className="w-[50%] max-w-72">
              <ProfileImage url={pageUserData?.photoURL} />
            </div>
            <h3 className="flex flex-col items-center">
              <span className="text-2xl font-bold text-shark-950">
                {pageUserData.displayName}
              </span>
              <span className="text-base text-shark-500">
                @{pageUserData.displayId}
              </span>
            </h3>
            {/* <h3>uid: {pageUserData.uid}</h3>
            <h3>displayName: {pageUserData.displayName}</h3>
            <h3>displayId: {pageUserData.displayId}</h3> */}
          </div>

          {/* <hr className="border" /> */}

          <nav className="flex justify-center gap-12 text-lg font-semibold">
            <Link
              href={`/${displayId}?tab=uploaded`}
              className={`border-shark-950 ${tab === "uploaded" && "border-b-2"}`}
            >
              업로드한 이미지
            </Link>
            <Link
              href={`/${displayId}?tab=saved`}
              className={`border-shark-950 ${tab === "saved" && "border-b-2"}`}
            >
              저장한 이미지
            </Link>
          </nav>
          <div className="">
            {tab === "uploaded" ? (
              <UserImageList pageUserData={pageUserData} />
            ) : (
              <SavedTab pageUserData={pageUserData} />
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
