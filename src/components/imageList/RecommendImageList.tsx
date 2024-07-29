"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { useParams } from "next/navigation";
import { and, or, where } from "firebase/firestore";
import { ImageData } from "@/types";

const RecommendImageList = ({ imageData }: { imageData: ImageData }) => {
  const { id } = useParams();
  const grid = useRecoilValue(gridState);

  return (
    <div className="relative h-full bg-white">
      <ImageGrid type={`recommend-${id}`} />
      {grid && (
        <ImageInfiniteScroller
          type={`recommend-${id}`}
          filter={{
            // orderBy: ["createdAt", "desc"],
            limit: Math.min(grid.colCount * 2, 1),
            where: and(
              where("tags", "array-contains-any", imageData.imgTags),
              where("id", "!=", imageData.id),
            ),
          }}
        />
      )}
    </div>
  );
};

export default RecommendImageList;
