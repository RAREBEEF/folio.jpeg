"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { useParams } from "next/navigation";
import { and, or, where } from "firebase/firestore";
import { ImageItem } from "@/types";
import { useEffect, useState } from "react";

const RecommendImageList = ({ imageItem }: { imageItem: ImageItem }) => {
  const [keywords, setKeywords] = useState<Array<string>>([]);
  const { id } = useParams();
  const grid = useRecoilValue(gridState);

  useEffect(() => {
    setKeywords(() => {
      const keywords = [];
      keywords.push(...imageItem.tags);

      // 제목
      if (imageItem.title) {
        const titleKeywords = imageItem.title.split(" ");
        keywords.push(...titleKeywords);
      }
      // 내용
      if (imageItem.description) {
        const descKeywords = imageItem.description.split(" ");
        keywords.push(...descKeywords);
      }

      return keywords;
    });
  }, [imageItem]);

  return (
    <div className="relative h-full bg-shark-50">
      <ImageGrid type={`recommend-${id}`} />
      {grid && keywords.length !== 0 && (
        <ImageInfiniteScroller
          type={`recommend-${id}`}
          // filter={{ orderBy: ["createdAt", "desc"], limit: grid.colCount * 2 }}
          filter={{
            orderBy: ["createdAt", "desc"],
            limit: 2,
            // where: or(
            //   where("tags", "array-contains-any", imageItem.tags),
            //   where("uid", "==", imageItem.uid),
            // ),
            where: and(
              where("tags", "array-contains-any", keywords),
              where("id", "!=", imageItem.id),
            ),
          }}
        />
      )}
    </div>
  );
};

export default RecommendImageList;
