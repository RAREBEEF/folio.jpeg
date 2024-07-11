"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { where } from "firebase/firestore";
import { UserData } from "@/types";

const UserImageList = ({ userData }: { userData: UserData }) => {
  const grid = useRecoilValue(gridState);

  return (
    <div className="bg-ebony-clay-50 relative h-full">
      <ImageGrid type={"user-" + userData.uid} />
      {grid && (
        <ImageInfiniteScroller
          type={"user-" + userData.uid}
          filter={{
            orderBy: ["createdAt", "desc"],
            where: where("uid", "==", userData.uid),
            limit: grid.colCount * 2,
          }}
        />
      )}
    </div>
  );
};

export default UserImageList;
