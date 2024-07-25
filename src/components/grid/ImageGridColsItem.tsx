import Image from "next/image";
import { GridItem, ImageDataPages } from "@/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { deviceState, gridState, imageDataState } from "@/recoil/states";
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
  const device = useRecoilValue(deviceState);
  const pathname = usePathname();
  const [imageData, setImageData] = useRecoilState(imageDataState(gridItem.id));
  const grid = useRecoilValue(gridState);
  const [isImageBroken, setIsImageBroken] = useState<boolean>(false);

  useEffect(() => {
    setImageData((prev) => {
      if (prev) {
        return prev;
      } else {
        const imageData = imageDataPages[gridItem.page].find(
          (image) => image.id === gridItem.id,
        );

        return imageData || null;
      }
    });
  }, [gridItem.id, gridItem.page, imageDataPages, setImageData]);

  // 스크롤 복원을 위해 스크롤 위치 저장
  const onBeforeRouting = () => {
    // 뒤로가기 등을 통한 라우팅에서만 스크롤 복원이 작동하도록 한다.
    // 즉, 그리드에서 이미지를 직접 클릭해서 들어가는 경우에는 스크롤 복원을 하지 않음. (추천 이미지를 통한 페이지 이동이 반복적으로 중첩되는 경우 등에서 불필요한 복원이 발생할 수 있음)
    // 따라서 현재 직접 클릭을 통해 이동하려는 페이지에 스크롤 복원 데이터가 있고, 해당 복원이 작동할 예정인 경우(현재 경로 === restoreWhenFrom) 해당 복원데이터를 삭제한다.
    const targetPath = `/image/${imageData?.id}`;
    const storedScroll = sessionStorage.getItem(targetPath);
    if (storedScroll) {
      const scroll = JSON.parse(storedScroll);
      if (pathname === scroll.restoreWhenFrom) {
        sessionStorage.removeItem(targetPath);
      }
    }

    // 복원 위치 저장
    sessionStorage.setItem(
      pathname,
      JSON.stringify({
        scrollY: window.scrollY,
        restoreWhenFrom: `/image/${imageData?.id}`,
      }),
    );
  };

  return (
    <li
      className="group relative select-none"
      style={{
        transform: `translateX(${gridItem.x}px) translateY(${gridItem.y}px)`,
      }}
    >
      {imageData ? (
        <Link
          onClick={onBeforeRouting}
          className="relative"
          href={`/image/${imageData.id}`}
        >
          {isImageBroken ? (
            <BrokenSvg
              style={{
                width: grid?.colWidth,
                height: gridItem.height,
              }}
              className="overflow-hidden rounded-xl bg-astronaut-100 fill-astronaut-500 p-[20%]"
            />
          ) : (
            <Image
              style={{
                background: imageData.themeColor,
              }}
              className="overflow-hidden rounded-xl"
              priority
              quality={50}
              src={imageData.URL}
              alt={imageData.fileName}
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
          className="rounded-xl bg-gradient-to-br from-astronaut-100 to-astronaut-300"
          style={{
            width: `${grid!.colWidth}px`,
            height: `${gridItem.height}px`,
          }}
        />
      )}
      {device !== "mobile" && imageData && (
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0))",
          }}
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-full justify-end rounded-t-xl pr-2 pt-2 group-hover:flex"
        >
          <div className="h-8 w-8 origin-top-right transition-all hover:scale-105">
            <SaveButton imageData={imageData} />
          </div>
        </div>
      )}
    </li>
  );
};

export default ImageGridColsItem;
