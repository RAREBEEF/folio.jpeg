import Image from "next/image";
import { ImageItem } from "@/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { gridState, imageItemState } from "@/recoil/states";
import Link from "next/link";

const ImageGridColsItem = ({ item }: { item: ImageItem }) => {
  const [imageItem, setImageItem] = useRecoilState(imageItemState(item.id));
  const grid = useRecoilValue(gridState);

  // detail 페이지에서 업데이트한 imageItem이
  // grid로 돌아오면 기존 상태로 다시 덮어씌워져
  // 업데이트가 롤백되는 현상을 방지하기 위해
  // 기존 state가 이미 있으면 grid 데이터만 업데이트하고 나머지는 유지
  useEffect(() => {
    // 기존 state가 없음
    // 새로 상태 할당
    if (!imageItem) {
      setImageItem(item);
      // 기존 state가 있음 (detail 페이지에서 먼저 생성된 경우)
      // 기존 상태에서 grid 데이터만 업데이트
    } else {
      setImageItem((prev) => {
        if (!prev) return null;

        const grid = item.grid;
        return { ...prev, grid };
      });
    }
    // 의존성에 imageItem 추가하지 말것!
  }, [item, setImageItem]);

  return (
    !!item.grid && (
      <li
        className="relative"
        style={{
          transform: `translateX(${item.grid.x}px) translateY(${item.grid.y}px)`,
        }}
      >
        {!!imageItem && !!imageItem.grid ? (
          <Link href={`/image/${imageItem.id}`}>
            <Image
              priority
              src={imageItem.url}
              alt="test"
              width={grid.colWidth}
              height={imageItem.grid.height}
              style={{ width: grid.colWidth, height: imageItem.grid.height }}
              className="overflow-hidden rounded-xl"
            />
          </Link>
        ) : (
          <div
            className="rounded-xl bg-shark-100"
            style={{
              width: `${grid.colWidth}px`,
              height: `${item.grid.height}px`,
            }}
          />
        )}
      </li>
    )
  );
};

export default ImageGridColsItem;
