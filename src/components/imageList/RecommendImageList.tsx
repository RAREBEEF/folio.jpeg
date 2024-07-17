"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { useParams } from "next/navigation";
import { and, or, where } from "firebase/firestore";
import { ImageItem } from "@/types";

const RecommendImageList = ({ imageItem }: { imageItem: ImageItem }) => {
  const { id } = useParams();
  const grid = useRecoilValue(gridState);

  return (
    <div className="bg-astronaut-50 relative h-full">
      <ImageGrid type={`recommend-${id}`} />
      {grid && (
        <ImageInfiniteScroller
          type={`recommend-${id}`}
          filter={{
            orderBy: ["createdAt", "desc"],
            limit: grid.colCount * 2,
            where: and(
              where("tags", "array-contains-any", imageItem.tags),
              where("id", "!=", imageItem.id),
            ),
          }}
        />
      )}
    </div>
  );
};

export default RecommendImageList;
