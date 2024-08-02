"use client";

import { Fragment, useEffect, useState } from "react";
import Auth from "./Auth";
import PushRequest from "../PushRequest";
import ExtraUserDataListener from "./ExtraUserDataListener";
import InAppNotificationListener from "./InAppNotificationListener";
import SaveImageListener from "./SaveImageListener";
import Alert from "./Alert";
import AuthModal from "../modal/AuthModal";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  authStatusState,
  deviceState,
  searchHistoryState,
} from "@/recoil/states";
import Router from "next/router";
import { usePathname } from "next/navigation";
import useTypeGuards from "@/hooks/useTypeGuards";
import logo from "@/images/logo.png";
import Image from "next/image";

const Init = () => {
  const authStatus = useRecoilValue(authStatusState);
  const { isArrayOfStrings } = useTypeGuards();
  const setSearchHistory = useSetRecoilState(searchHistoryState);
  const pathname = usePathname();
  const [device, setDevice] = useRecoilState(deviceState);
  const [initLoading, setInitLoading] = useState<boolean>(true);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = userAgent.match(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
    );
    setDevice(isMobile ? "mobile" : "pc");
  }, [setDevice]);

  useEffect(() => {
    const storedSearchHistory = localStorage.getItem(
      "sh-" + authStatus.data?.uid || "",
    );
    if (storedSearchHistory) {
      const parsedSearchHistory = JSON.parse(storedSearchHistory);
      if (isArrayOfStrings(parsedSearchHistory)) {
        setSearchHistory(parsedSearchHistory);
      }
    } else {
      setSearchHistory([]);
      localStorage.setItem(
        "sh-" + authStatus.data?.uid || "",
        JSON.stringify([]),
      );
    }
  }, [
    setSearchHistory,
    isArrayOfStrings,
    authStatus.status,
    authStatus.data?.uid,
  ]);

  useEffect(() => {
    const routeChangeHandler = () => {
      sessionStorage.setItem("prevPath", pathname);
    };

    Router.events.on("routeChangeStart", routeChangeHandler);

    return () => {
      Router.events.emit("routeChangeStart", routeChangeHandler);
    };
  }, [pathname]);

  useEffect(() => {
    if (!initLoading) return;

    document.body.style.overflow = "hidden";

    const initLoadEnd = () => {
      setInitLoading(false);
      document.body.style.overflow = "auto";
    };

    if (authStatus.status === "pending") {
      return;
    } else {
      initLoadEnd();
    }
  }, [authStatus.status, setInitLoading, initLoading]);

  return (
    <Fragment>
      <Auth />
      <PushRequest />
      <ExtraUserDataListener />
      <InAppNotificationListener />
      <SaveImageListener />
      <Alert />
      <AuthModal />
      {initLoading && (
        <div className="fixed left-0 top-0 z-[50] flex h-dvh w-dvw flex-col items-center justify-center bg-white">
          <hgroup className="flex grow flex-col items-center justify-center">
            <Image src={logo} width={200} height={200} alt="folio.JPEG logo" />
            <h1 className="absolute left-0 right-0 m-auto text-center opacity-0">
              folio.JPEG
            </h1>
          </hgroup>
          <footer className="pb-8 text-xs text-astronaut-600">
            © 2024. RAREBEEF All Rights Reserved.
          </footer>
        </div>
      )}
    </Fragment>
  );
};

export default Init;
