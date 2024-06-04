"use client";

import Link from "next/link";
import { MouseEvent } from "react";
import Auth from "../Auth";
import { auth } from "@/fb";
import { useRecoilState } from "recoil";
import { authStatusState, loginModalState } from "@/recoil/states";
import _ from "lodash";

const LayoutHeader = () => {
  const [loginModal, setLoginModal] = useRecoilState(loginModalState);
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
    <header className="fixed top-0 z-50 flex h-16 w-full min-w-[300px] items-center justify-between bg-shark-950 text-shark-50">
      <h1 className="w-[200px] text-center text-2xl font-bold">
        <Link href="/">FOLIO.jpeg</Link>
      </h1>
      {authStatus.status === "signedIn" ||
      authStatus.status === "noExtraData" ? (
        <button
          onClick={onLogoutClick}
          className="mr-6 rounded-lg bg-shark-50 px-2 py-1 text-sm"
        >
          <div className="text-shark-950">로그아웃</div>
        </button>
      ) : (
        <button
          onClick={onLoginClick}
          className="mr-6 rounded-lg bg-shark-50 px-2 py-1 text-sm"
        >
          <div className="text-shark-950">로그인</div>
        </button>
      )}
      <Auth />
    </header>
  );
};

export default LayoutHeader;
