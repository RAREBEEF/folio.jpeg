import Image from "next/image";
import { ImageItem } from "@/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { gridState, imageItemState } from "@/recoil/states";

const ImageGridColsItem = ({ item }: { item: ImageItem }) => {
  const [imageItem, setImageItem] = useRecoilState(imageItemState(item.id));
  const grid = useRecoilValue(gridState);
  const [loadEnd, setLoadEnd] = useState<boolean>(false);

  useEffect(() => {
    setImageItem(item);
    setLoadEnd(true);
  }, [item, setImageItem]);

  return (
    <li
      className="relative"
      style={{
        transform: `translateX(${imageItem.x}px) translateY(${imageItem.y}px)`,
      }}
    >
      {!!loadEnd ? (
        <Image
          priority
          src={imageItem.url}
          alt="test"
          width={grid.colWidth}
          height={imageItem.height}
          style={{ width: grid.colWidth, height: imageItem.height }}
          className="overflow-hidden rounded-xl"
        />
      ) : (
        <div
          className="rounded-xl bg-shark-100"
          style={{
            width: `${grid.colWidth}px`,
            height: `${imageItem.height}px`,
          }}
        />
      )}
    </li>
  );
};

export default ImageGridColsItem;
