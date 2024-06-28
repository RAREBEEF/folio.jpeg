"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilState, useRecoilValue } from "recoil";
import { authStatusState, gridState, loginModalState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MouseEvent, useMemo } from "react";
import { where } from "firebase/firestore";

const HomeImageList = () => {
  const [loginModal, setLoginModal] = useRecoilState(loginModalState);
  const authStatus = useRecoilValue(authStatusState);
  const params = useSearchParams();
  const listType = useMemo(
    () =>
      authStatus.status === "signedIn" && params.get("where") === "following"
        ? "following"
        : "all",
    [params, authStatus.status],
  );
  const grid = useRecoilValue(gridState);

  const needLogin = (e: MouseEvent<HTMLAnchorElement>) => {
    if (authStatus.status !== "signedIn" && authStatus.status !== "pending") {
      e.preventDefault();
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
    }
  };

  return (
    <div className="relative h-full bg-shark-50">
      <nav className="flex items-end justify-center gap-12 pt-12 text-xl font-semibold text-shark-950">
        <Link
          href="/"
          className={`border-shark-950 ${listType === "all" && "border-b-2"}`}
        >
          모든 이미지
        </Link>
        <Link
          onClick={needLogin}
          href="?where=following"
          className={`border-shark-950 ${listType === "following" && "border-b-2"}`}
        >
          팔로잉
        </Link>
      </nav>
      <ImageGrid type={listType === "following" ? "following" : "home"} />
      {grid && (
        <ImageInfiniteScroller
          type={listType === "following" ? "following" : "home"}
          // filter={{ orderBy: ["createdAt", "desc"], limit: grid.colCount * 2 }}
          filter={
            listType === "following"
              ? {
                  orderBy: ["createdAt", "desc"],
                  where: where(
                    "uid",
                    "in",
                    authStatus.data?.following &&
                      authStatus.data.following.length > 0
                      ? authStatus.data.following
                      : [""],
                  ),
                  limit: 2,
                }
              : {
                  orderBy: ["createdAt", "desc"],
                  limit: 2,
                }
          }
        />
      )}
    </div>
  );
};

export default HomeImageList;
