"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { where } from "firebase/firestore";
import { UserData } from "@/types";
import OrderByFilter from "./OrderByFilter";
import { ChangeEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const UserImageList = ({ userData }: { userData: UserData }) => {
  const { replace } = useRouter();
  const params = useSearchParams();
  const [orderBy, setOrderBy] = useState<"popularity" | "createdAt">(
    (params.get("orderBy") as "popularity" | "createdAt") || "createdAt",
  );
  const grid = useRecoilValue(
    gridState("user-" + userData.uid + "-" + orderBy),
  );

  const onOrderByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as "popularity" | "createdAt");
    replace(`?tab=uploaded&orderBy=${e.target.value}`, { scroll: false });
  };

  return (
    <div className="relative h-full bg-white">
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
      <ImageGrid type={"user-" + userData.uid + "-" + orderBy} />
      {grid && (
        <ImageInfiniteScroller
          type={"user-" + userData.uid + "-" + orderBy}
          filter={{
            orderBy: [orderBy, "desc"],
            where: where("uid", "==", userData.uid),
            limit:
              process.env.NODE_ENV === "development" ? 1 : grid.colCount * 2,
          }}
        />
      )}
    </div>
  );
};

export default UserImageList;
