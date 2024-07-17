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
import { useRouter } from "next/navigation";

const UserImageList = ({ userData }: { userData: UserData }) => {
  const { replace } = useRouter();
  const grid = useRecoilValue(gridState);
  const [orderBy, setOrderBy] = useState<"popularity" | "createdAt">(
    "createdAt",
  );

  const onOrderByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as "popularity" | "createdAt");
    replace(`?tab=uploaded&orderBy=${orderBy}`, { scroll: false });
  };

  return (
    <div className="bg-astronaut-50 relative h-full">
      <div className="flex justify-end px-4 pt-4 opacity-50">
        <OrderByFilter onChange={onOrderByChange} value={orderBy} />
      </div>
      <ImageGrid type={"user-" + userData.uid + "-" + orderBy} />
      {grid && (
        <ImageInfiniteScroller
          type={"user-" + userData.uid + "-" + orderBy}
          filter={{
            orderBy: [orderBy, "desc"],
            where: where("uid", "==", userData.uid),
            limit: grid.colCount * 2,
          }}
        />
      )}
    </div>
  );
};

export default UserImageList;
