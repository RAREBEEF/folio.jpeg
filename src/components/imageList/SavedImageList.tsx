"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { where } from "firebase/firestore";
import { Folder } from "@/types";

const SavedImageList = ({ type, folder }: { type: string; folder: Folder }) => {
  const grid = useRecoilValue(gridState);

  return (
    <div className="relative h-full bg-shark-50">
      <ImageGrid type={type} />
      {grid && folder.images.length > 0 && (
        <ImageInfiniteScroller
          type={type}
          filter={{
            // orderBy: ["createdAt", "desc"],
            where: where("id", "in", folder.images),
            // limit: grid.colCount * 5,
            // limit: 2,
          }}
          folder={folder}
        />
      )}
    </div>
  );
};

export default SavedImageList;
