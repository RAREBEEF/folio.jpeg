"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authStatusState, gridState, loginModalState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, MouseEvent, useMemo, useState } from "react";
import { where } from "firebase/firestore";
import OrderByFilter from "./OrderByFilter";
import { useRouter } from "next/navigation";

const HomeImageList = () => {
  const { replace } = useRouter();
  const setLoginModal = useSetRecoilState(loginModalState);
  const authStatus = useRecoilValue(authStatusState);
  const params = useSearchParams();
  const listType = useMemo(
    () =>
      authStatus.status === "signedIn" && params.get("where") === "following"
        ? "following"
        : "all",
    [params, authStatus.status],
  );
  const [orderBy, setOrderBy] = useState<"popularity" | "createdAt">(
    (params.get("orderBy") as "popularity" | "createdAt") || "createdAt",
  );
  const grid = useRecoilValue(
    gridState(
      (listType === "following" ? "following" : "home") + "-" + orderBy,
    ),
  );

  const onOrderByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as "popularity" | "createdAt");
    replace(`?where=${listType}&orderBy=${e.target.value}`, { scroll: false });
  };

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
    <div className="relative h-full bg-white">
      <nav className="flex items-end justify-center gap-12 pt-12 text-xl font-semibold  xs:pt-8">
        <Link
          href={`?where=all&orderBy=${orderBy}`}
          className={`border-astronaut-950 ${listType === "all" && "border-b-2"}`}
        >
          모든 이미지
        </Link>
        <Link
          onClick={needLogin}
          href={`?where=following&orderBy=${orderBy}`}
          className={`border-astronaut-950 ${listType === "following" && "border-b-2"}`}
        >
          팔로잉
        </Link>
      </nav>
      {grid && (
        <div
          style={{
            width:
              grid.colCount * grid.colWidth + grid.gap * (grid.colCount + 1),
          }}
          className="m-auto flex justify-end px-4 pt-4 opacity-50"
        >
          <OrderByFilter onChange={onOrderByChange} value={orderBy} />
        </div>
      )}
      <ImageGrid
        type={(listType === "following" ? "following" : "home") + "-" + orderBy}
      />
      {grid && (
        <ImageInfiniteScroller
          type={
            (listType === "following" ? "following" : "home") + "-" + orderBy
          }
          filter={
            listType === "following"
              ? {
                  orderBy: [orderBy, "desc"],
                  where: where(
                    "uid",
                    "in",
                    authStatus.data?.following &&
                      authStatus.data.following.length > 0
                      ? authStatus.data.following
                      : [""],
                  ),
                  limit:
                    process.env.NODE_ENV === "development"
                      ? 1
                      : grid.colCount * 2,
                }
              : {
                  orderBy: [orderBy, "desc"],
                  limit:
                    process.env.NODE_ENV === "development"
                      ? 1
                      : grid.colCount * 2,
                }
          }
        />
      )}
    </div>
  );
};

export default HomeImageList;
