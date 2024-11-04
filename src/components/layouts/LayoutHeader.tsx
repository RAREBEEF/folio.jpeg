"use client";

import Link from "next/link";
import { MouseEvent, Suspense } from "react";
import { auth } from "@/fb";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authStatusState, loginModalState } from "@/recoil/states";
import _ from "lodash";
import logo from "@/images/logo.png";
import Image from "next/image";
import Search from "../Search";
import useDevicePushToken from "@/hooks/useDevicePushToken";
import { useRouter } from "next/navigation";

const LayoutHeader = () => {
  const { push } = useRouter();
  const setLoginModal = useSetRecoilState(loginModalState);
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);
  const { deleteDeviceData } = useDevicePushToken();

  const onLoginClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoginModal({ show: true });
  };
  const onLogoutClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await deleteDeviceData({ all: false });
    await auth.signOut();
    push("/signin");
    setAuthStatus({ status: "signedOut", data: null });
  };

  return (
    // LayoutHeader의 높이만큼 LayoutContent의 mt 조절하기
    <header
      id="header"
      className="bg-red fixed top-0 z-40 flex h-16 w-full min-w-[300px] items-end bg-white pb-[7px] text-astronaut-50 shadow-lg"
    >
      <div className="flex w-full items-center justify-between">
        <h1 className="font-bold ">
          <Link href="/" className="relative flex w-[50px] items-center">
            <div className="flex h-[50px] w-[50px] items-center justify-center">
              <Image
                src={logo}
                alt="folio.JPEG"
                className="h-[40px] w-auto overflow-hidden rounded-lg"
              />
            </div>
          </Link>
        </h1>
        <Suspense>
          <Search />
        </Suspense>
        {authStatus.status === "signedIn" ||
        authStatus.status === "noExtraData" ? (
          <button
            onClick={onLogoutClick}
            className="mr-6 rounded-lg bg-white px-2 py-1 text-sm font-semibold"
          >
            <div className="whitespace-nowrap text-astronaut-600 hover:text-astronaut-800">
              로그아웃
            </div>
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="mr-6 rounded-lg bg-white px-2 py-1 text-sm font-semibold"
          >
            <div className="whitespace-nowrap text-astronaut-600 hover:text-astronaut-800">
              로그인
            </div>
          </button>
        )}
      </div>
    </header>
  );
};

export default LayoutHeader;
