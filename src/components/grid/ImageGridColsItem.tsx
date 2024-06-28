import Image from "next/image";
import { GridItem, ImageDataPages } from "@/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect } from "react";
import { gridState, imageItemState } from "@/recoil/states";
import Link from "next/link";
import SaveButton from "../saveImage/SaveButton";
import { usePathname } from "next/navigation";

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
          <Image
            style={{
              background: imageItem.themeColor,
            }}
            className="overflow-hidden rounded-xl"
            priority
            quality={50}
            src={imageItem.url}
            alt={imageItem.fileName}
            width={grid!.colWidth}
            height={gridItem.height}
            placeholder="empty"
          />
        </Link>
      ) : (
        <div
          className="rounded-xl bg-gradient-to-br from-shark-100 to-shark-300"
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
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-full justify-end rounded-t-xl pr-2 pt-2 group-hover:flex"
        >
          <SaveButton imageItem={imageItem} />
        </div>
      )}
    </li>
  );
};

export default ImageGridColsItem;
