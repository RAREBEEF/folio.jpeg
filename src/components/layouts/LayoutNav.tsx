"use client";

import { useRecoilState, useRecoilValue } from "recoil";
import Angles from "@/icons/angles-solid.svg";
import Link from "next/link";
import SnsLinks from "@/components/SnsLinks";
import {
  authStatusState,
  inAppNotificationState,
  loginModalState,
  navState,
} from "@/recoil/states";
import { MouseEvent, useEffect, useState } from "react";
import _ from "lodash";
import HomeSvg from "@/icons/house-solid.svg";
import ImageSvg from "@/icons/image-solid.svg";
import ProfileSvg from "@/icons/user-solid.svg";
import NotificationSvg from "@/icons/bell-solid.svg";
import Modal from "@/components/modal/Modal";
import NotificationsModal from "@/components/modal/NotificationsModal";

const LayoutNav = () => {
  const [loginModal, setLoginModal] = useRecoilState(loginModalState);
  const authStatus = useRecoilValue(authStatusState);
  const [nav, setNav] = useRecoilState(navState);
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const [showNotificationModal, setShowNotificationModal] =
    useState<boolean>(false);
  const notification = useRecoilValue(inAppNotificationState);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    if (nav.show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [nav.show]);

  useEffect(() => {
    const windowResizeListener = _.debounce((e: Event) => {
      if (innerWidth !== window.innerWidth && window.innerWidth <= 550) {
        setNav({ show: false });
      }
      setInnerWidth(window.innerWidth);
    }, 100);

    window.addEventListener("resize", windowResizeListener);

    return () => {
      window.removeEventListener("resize", windowResizeListener);
    };
  }, [innerWidth, setNav]);

  const checkAuthBeforeNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    if (authStatus.status === "pending") {
      e.preventDefault();
    } else if (authStatus.status !== "signedIn") {
      e.preventDefault();
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
    }
  };

  const onNotificationClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (authStatus.status === "pending") {
      e.preventDefault();
    } else if (authStatus.status !== "signedIn") {
      e.preventDefault();
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
    } else {
      setShowNotificationModal(true);
    }
  };
  const onCloseNotification = () => {
    setShowNotificationModal(false);
  };

  const onNavOutsideClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setNav({ show: false });
  };

  // 안읽은 알림 카운트
  useEffect(() => {
    const notifications = notification.list || [];
    const lastCheck = notification.lastCheck || 0;

    setNotificationCount(
      notifications.filter((notification) => notification.createdAt > lastCheck)
        .length,
    );
  }, [notification.lastCheck, notification.list]);

  return (
    // <div
    //   className={`fixed top-0 z-40 flex h-full pt-16 ${nav.show ? "w-full" : "w-[50px]"}`}
    // >
    //   <nav
    //     className={`relative flex h-full shrink-0 flex-col overflow-hidden overflow-y-scroll bg-shark-950 pb-24 text-shark-50 transition-all transition-all ${nav.show ? "w-[200px]" : "w-[50px]"}`}
    //   >
    <div
      className={`fixed bottom-0 top-0 z-40 flex h-full pt-16 xs:top-auto xs:h-[60px] xs:w-screen xs:border-t xs:border-shark-500 xs:bg-shark-950 xs:pt-0 ${nav.show ? "w-full xs:w-screen" : "w-[50px] xs:w-screen"}`}
    >
      <nav
        className={`relative flex h-full shrink-0 flex-col overflow-hidden overflow-y-scroll bg-shark-950 text-shark-50 transition-all xs:h-[50px] xs:transition-none ${nav.show ? "w-[200px] xs:w-screen" : "w-[50px] xs:w-screen"}`}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            setNav((prev) => ({ show: !prev.show }));
          }}
          className={`absolute right-[10px] top-[5px] h-[30px] w-[30px] transition-all xs:hidden ${
            nav.show ? "scale-x-[-100%]" : "scale-x-100"
          }`}
        >
          <Angles className="fill-white" />
        </button>

        <ul
          className={`absolute mt-16 flex w-full grow origin-top-left flex-col gap-6 pb-16 text-end text-lg font-bold xs:mt-0 xs:h-full xs:flex-row xs:items-center xs:px-8 xs:pb-0`}
        >
          <li className="w-full text-center">
            <Link
              href="/"
              className="m-auto flex h-[30px] w-fit items-center justify-center"
            >
              {nav.show ? (
                <div>Home</div>
              ) : (
                <HomeSvg className="aspect-square w-[30px] fill-shark-50" />
              )}
            </Link>
          </li>
          <li className="w-full text-center">
            <Link
              onClick={checkAuthBeforeNavigate}
              href="/upload"
              className="m-auto flex h-[30px] w-fit items-center justify-center"
            >
              {nav.show ? (
                <div>Upload</div>
              ) : (
                <ImageSvg className="aspect-square w-[30px] fill-shark-50" />
              )}
            </Link>
          </li>
          <li className="w-full text-center">
            <Link
              onClick={checkAuthBeforeNavigate}
              href={`/${authStatus.data?.displayId}`}
              className="m-auto flex h-[30px] w-fit items-center justify-center"
            >
              {nav.show ? (
                <div>Profile</div>
              ) : (
                <ProfileSvg className="aspect-square w-[30px] fill-shark-50" />
              )}
            </Link>
          </li>
          <li className="w-full text-center">
            <button
              onClick={onNotificationClick}
              className="relative m-auto flex h-[30px] w-fit items-center justify-center"
            >
              {nav.show ? (
                <div>Notifications</div>
              ) : (
                <NotificationSvg className="aspect-square w-[30px] fill-shark-50" />
              )}
              <div
                className={`absolute text-center ${nav.show ? "left-full" : "right-0"} top-0 aspect-square w-4 rounded-full bg-[firebrick] text-xs tracking-tighter`}
              >
                {Math.min(notificationCount, 99)}
              </div>
            </button>
          </li>
        </ul>
      </nav>
      {showNotificationModal && (
        <Modal close={onCloseNotification} title="알림">
          <NotificationsModal close={onCloseNotification} />
        </Modal>
      )}
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        className="h-full w-full grow"
        onClick={onNavOutsideClick}
      ></div>
    </div>
  );
};

export default LayoutNav;
