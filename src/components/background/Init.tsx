"use client";

import { Fragment, useEffect } from "react";
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

const Init = () => {
  const authStatus = useRecoilValue(authStatusState);
  const { isArrayOfStrings } = useTypeGuards();
  const setSearchHistory = useSetRecoilState(searchHistoryState);
  const pathname = usePathname();
  const [device, setDevice] = useRecoilState(deviceState);

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

  return (
    <Fragment>
      <Auth />
      <PushRequest />
      <ExtraUserDataListener />
      <InAppNotificationListener />
      <SaveImageListener />
      <Alert />
      <AuthModal />
    </Fragment>
  );
};

export default Init;
