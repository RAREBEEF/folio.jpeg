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
  const grid = useRecoilValue(gridState);
  const [orderBy, setOrderBy] = useState<"popularity" | "createdAt">(
    (params.get("orderBy") as "popularity" | "createdAt") || "createdAt",
  );

  const onOrderByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as "popularity" | "createdAt");
    replace(`?tab=uploaded&orderBy=${e.target.value}`, { scroll: false });
  };

  return (
    <div className="relative h-full bg-astronaut-50">
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
            limit: Math.min(grid.colCount * 2, 1),
          }}
        />
      )}
    </div>
  );
};

export default UserImageList;
