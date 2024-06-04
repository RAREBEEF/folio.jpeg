"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";

const HomeImageList = () => {
  const grid = useRecoilValue(gridState);

  return (
    <div className="relative h-full bg-shark-50">
      <ImageGrid type="home" />
      {grid && (
        <ImageInfiniteScroller
          type="home"
          // filter={{ orderBy: ["createdAt", "desc"], limit: grid.colCount * 2 }}
          filter={{ orderBy: ["createdAt", "desc"], limit: 2 }}
        />
      )}
    </div>
  );
};

export default HomeImageList;
