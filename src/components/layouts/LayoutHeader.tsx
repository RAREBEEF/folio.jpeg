"use client";

import Link from "next/link";
import { MouseEvent } from "react";
import { auth } from "@/fb";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authStatusState, loginModalState } from "@/recoil/states";
import _ from "lodash";
import logo from "@/images/logo-no-bg.png";
import Image from "next/image";

const LayoutHeader = () => {
  const setLoginModal = useSetRecoilState(loginModalState);
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);

  const onLoginClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoginModal({ show: true });
  };
  const onLogoutClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await auth.signOut().then(() => {
      setAuthStatus({ status: "signedOut", data: null });
    });
  };

  return (
    // LayoutHeader의 높이만큼 LayoutContent의 mt 조절하기
    <header className="bg-ebony-clay-950 text-ebony-clay-50 fixed top-0 z-40 flex h-16 w-full min-w-[300px] items-center justify-between">
      <h1 className="font-bold xs:pl-2">
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
      {authStatus.status === "signedIn" ||
      authStatus.status === "noExtraData" ? (
        <button
          onClick={onLogoutClick}
          className="bg-ebony-clay-50 mr-6 rounded-lg px-2 py-1 text-sm"
        >
          <div className="text-ebony-clay-950">로그아웃</div>
        </button>
      ) : (
        <button
          onClick={onLoginClick}
          className="bg-ebony-clay-50 mr-6 rounded-lg px-2 py-1 text-sm"
        >
          <div className="text-ebony-clay-950">로그인</div>
        </button>
      )}
    </header>
  );
};

export default LayoutHeader;
