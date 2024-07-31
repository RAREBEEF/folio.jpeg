"use client";

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import Angles from "@/icons/angles-solid.svg";
import Link from "next/link";
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
import { usePathname } from "next/navigation";

const LayoutNav = () => {
  const pathname = usePathname();
  const setLoginModal = useSetRecoilState(loginModalState);
  const authStatus = useRecoilValue(authStatusState);
  const [nav, setNav] = useRecoilState(navState);
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const [showNotificationModal, setShowNotificationModal] =
    useState<boolean>(false);
  const notification = useRecoilValue(inAppNotificationState);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [curPath, setCurPath] = useState<
    null | "home" | "image" | "upload" | "edit" | "profile" | "notification"
  >(null);

  useEffect(() => {
    if (showNotificationModal) {
      setCurPath("notification");
      return;
    }

    const regex = /^\/([^/]+)(?:\/|$)/;
    const curPath = pathname.match(regex);
    const myDisplayId = authStatus.data?.displayId || "";

    if (!curPath) {
      setCurPath("home");
      return;
    }
    switch (curPath[1]) {
      case "image":
        setCurPath("image");
        break;
      case "upload":
        setCurPath("upload");
        break;
      case "edit":
        setCurPath("edit");
        break;
      case myDisplayId:
        setCurPath("profile");
        break;
      default:
        setCurPath(null);
        break;
    }
  }, [authStatus.data?.displayId, pathname, showNotificationModal]);

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
    <div
      id="nav"
      className={`fixed bottom-0 top-16 z-40 flex h-full xs:top-auto xs:h-16 xs:w-screen xs:bg-white xs:pt-0 ${nav.show ? "w-full xs:w-screen" : "w-[50px] xs:w-screen"}`}
    >
      <nav
        className={`relative flex h-full shrink-0 flex-col overflow-hidden overflow-y-scroll bg-white text-astronaut-500 shadow-[10px_0_15px_-3px_rgb(0_0_0_/_0.1),4px_-0_6px_-4px_rgb(0_0_0_/_0.1)] transition-all xs:h-16 xs:shadow-[0_-10px_15px_-3px_rgb(0_0_0_/_0.1),0_-4px_6px_-4px_rgb(0_0_0_/_0.1)] xs:transition-none ${nav.show ? "w-[200px] xs:w-screen" : "w-[50px] xs:w-screen"}`}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            setNav((prev) => ({ show: !prev.show }));
          }}
          className={`absolute right-[10px] top-[10px] h-[30px] w-[30px] transition-all xs:hidden ${
            nav.show ? "scale-x-[-100%]" : "scale-x-100"
          }`}
        >
          <Angles className="fill-astronaut-500" />
        </button>

        <ul
          className={`absolute mt-16 flex w-full grow origin-top-left flex-col gap-4 pb-16 text-end text-lg font-bold xs:mt-0 xs:h-full xs:flex-row xs:items-center xs:px-8 xs:pb-0`}
        >
          <li
            className={`w-full ${!nav.show && `flex aspect-square items-center ${curPath === "home" && "bg-white "}`} xs:inline xs:aspect-auto`}
          >
            <Link
              href="/"
              className="m-auto flex h-[30px] w-fit items-center justify-center"
            >
              {nav.show ? (
                <div
                  className={`${curPath === "home" ? "text-astronaut-300" : "text-astronaut-500 hover:text-astronaut-300"}`}
                >
                  Home
                </div>
              ) : (
                <HomeSvg
                  className={`aspect-square w-[30px] ${curPath === "home" ? "fill-astronaut-500" : "fill-astronaut-300 hover:fill-astronaut-400 "}`}
                />
              )}
            </Link>
          </li>
          <li
            className={`w-full ${!nav.show && `flex aspect-square items-center ${curPath === "upload" && "bg-white"}`} xs:inline xs:aspect-auto`}
          >
            <Link
              onClick={checkAuthBeforeNavigate}
              href="/upload"
              className="m-auto flex h-[30px] w-fit items-center justify-center"
            >
              {nav.show ? (
                <div
                  className={`${curPath === "upload" ? "text-astronaut-300" : "text-astronaut-500 hover:text-astronaut-300"}`}
                >
                  Upload
                </div>
              ) : (
                <ImageSvg
                  className={`aspect-square w-[30px] ${curPath === "upload" ? "fill-astronaut-500" : "fill-astronaut-300 hover:fill-astronaut-400 "}`}
                />
              )}
            </Link>
          </li>
          <li
            className={`w-full ${!nav.show && `flex aspect-square items-center ${curPath === "profile" && "bg-white"}`} xs:inline xs:aspect-auto`}
          >
            <Link
              onClick={checkAuthBeforeNavigate}
              href={`/${authStatus.data?.displayId}`}
              className="m-auto flex h-[30px] w-fit items-center justify-center"
            >
              {nav.show ? (
                <div
                  className={`${curPath === "profile" ? "text-astronaut-300" : "text-astronaut-500 hover:text-astronaut-300"}`}
                >
                  Profile
                </div>
              ) : (
                <ProfileSvg
                  className={`aspect-square w-[30px] ${curPath === "profile" ? "fill-astronaut-500" : "fill-astronaut-300 hover:fill-astronaut-400 "}`}
                />
              )}
            </Link>
          </li>
          <li
            className={`w-full ${!nav.show && `flex aspect-square items-center ${curPath === "notification" && "bg-white"}`} xs:inline xs:aspect-auto`}
          >
            <button
              onClick={onNotificationClick}
              className="group relative m-auto flex h-[30px] w-fit items-center justify-center"
            >
              {nav.show ? (
                <div
                  className={`${curPath === "notification" ? "text-astronaut-300" : "text-astronaut-500 hover:text-astronaut-300"}`}
                >
                  Notifications
                </div>
              ) : (
                <NotificationSvg
                  className={`aspect-square w-[30px] ${curPath === "notification" ? "fill-astronaut-500" : "fill-astronaut-300 group-hover:fill-astronaut-400 "}`}
                />
              )}
              <div
                className={`absolute select-none text-center ${nav.show ? "left-full bg-astronaut-500 text-white" : "right-0 bg-white"} top-0 aspect-square w-4 rounded-full bg-white text-xs tracking-tighter`}
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
