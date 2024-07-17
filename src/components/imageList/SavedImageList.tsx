"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { where } from "firebase/firestore";
import { Folder } from "@/types";
import { Fragment } from "react";

const SavedImageList = ({ type, folder }: { type: string; folder: Folder }) => {
  const grid = useRecoilValue(gridState);

  return (
    <div className="bg-astronaut-50 relative h-full">
      {folder.images.length <= 0 ? (
        <div className="text-astronaut-500 flex h-full min-h-[200px] items-center justify-center text-center text-sm">
          이미지가 존재하지 않습니다.
        </div>
      ) : (
        <Fragment>
          <ImageGrid type={type} />
          {grid && (
            <ImageInfiniteScroller
              type={type}
              filter={{
                orderBy: ["createdAt", "desc"],
                where: where("id", "in", folder.images),
                limit: grid.colCount * 2,
              }}
              folder={folder}
            />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default SavedImageList;
