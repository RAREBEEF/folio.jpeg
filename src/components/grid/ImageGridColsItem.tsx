import Image from "next/image";
import { GridItem, ImageDataPages } from "@/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { gridState, imageItemState } from "@/recoil/states";
import Link from "next/link";
import SaveButton from "../saveImage/SaveButton";
import { usePathname } from "next/navigation";
import BrokenSvg from "@/icons/link-slash-solid.svg";

const ImageGridColsItem = ({
  gridItem,
  imageDataPages,
}: {
  gridItem: GridItem;
  imageDataPages: ImageDataPages;
}) => {
  const pathname = usePathname();
  const [imageItem, setImageItem] = useRecoilState(imageItemState(gridItem.id));
  const grid = useRecoilValue(gridState);
  const [isImageBroken, setIsImageBroken] = useState<boolean>(false);

  useEffect(() => {
    setImageItem((prev) => {
      if (prev) {
        return prev;
      } else {
        const imageItem = imageDataPages[gridItem.page].find(
          (image) => image.id === gridItem.id,
        );

        return imageItem || null;
      }
    });
  }, [gridItem.id, gridItem.page, imageDataPages, setImageItem]);

  // 스크롤 복원을 위해 스크롤 위치 저장
  const onBeforeRouting = () => {
    sessionStorage.setItem(pathname, window.scrollY.toString());
  };

  return (
    <li
      className="group relative select-none"
      style={{
        transform: `translateX(${gridItem.x}px) translateY(${gridItem.y}px)`,
      }}
    >
      {imageItem ? (
        <Link
          onClick={onBeforeRouting}
          className="relative"
          href={`/image/${imageItem.id}`}
        >
          {isImageBroken ? (
            <BrokenSvg
              style={{
                width: grid?.colWidth,
                height: gridItem.height,
              }}
              className="bg-astronaut-100 fill-astronaut-500 overflow-hidden rounded-xl p-[20%]"
            />
          ) : (
            <Image
              style={{
                background: imageItem.themeColor,
              }}
              className="overflow-hidden rounded-xl"
              priority
              quality={50}
              src={imageItem.URL}
              alt={imageItem.fileName}
              width={grid!.colWidth}
              height={gridItem.height}
              placeholder="empty"
              onError={() => {
                setIsImageBroken(true);
              }}
            />
          )}
        </Link>
      ) : (
        <div
          className="from-astronaut-100 to-astronaut-300 rounded-xl bg-gradient-to-br"
          style={{
            width: `${grid!.colWidth}px`,
            height: `${gridItem.height}px`,
          }}
        />
      )}
      {imageItem && (
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0))",
          }}
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-full justify-end rounded-t-xl pr-2 pt-2 group-hover:flex xs:hidden group-hover:xs:hidden"
        >
          <div className="h-8 w-8 origin-top-right transition-all hover:scale-105">
            <SaveButton imageItem={imageItem} />
          </div>
        </div>
      )}
    </li>
  );
};

export default ImageGridColsItem;
