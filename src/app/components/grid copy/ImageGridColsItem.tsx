import Image from "next/image";
import { ColumnItem } from "@/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect } from "react";
import { gridState, imageDataListState, imageItemState } from "@/recoil/states";

const ImageGridColsItem = ({ item }: { item: ColumnItem }) => {
  const imageDataList = useRecoilValue(imageDataListState);
  const [imageItem, setImageItem] = useRecoilState(imageItemState(item.id));
  const grid = useRecoilValue(gridState);

  useEffect(() => {
    const image = imageDataList[item.page].find(
      (imageData) => imageData.id === item.id,
    );
    setImageItem((prev) => ({ ...prev, ...image, ...item }));
  }, [imageDataList, item, setImageItem]);

  return (
    <li
      className="relative"
      style={{
        transform: `translateX(${item.x}px) translateY(${item.y}px)`,
      }}
    >
      {!!imageItem.url ? (
        <Image
          priority
          src={imageItem.url}
          alt="test"
          width={grid.colWidth}
          height={item.height}
          style={{ width: grid.colWidth, height: item.height }}
          className="overflow-hidden rounded-xl"
        />
      ) : (
        <div
          className="rounded-xl bg-shark-100"
          style={{
            width: `${grid.colWidth}px`,
            height: `${item.height}px`,
          }}
        />
      )}
    </li>
  );
};

export default ImageGridColsItem;
