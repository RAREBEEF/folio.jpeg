import useGetImages from "@/hooks/useGetImages";
import { imageDataPagesState } from "@/recoil/states";
import { Folder, ImageData, UserData } from "@/types";
import { where } from "firebase/firestore";
import _ from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

const SavedFolderThumbnail = ({ folder }: { folder: Folder }) => {
  const isInitialMount = useRef(true);
  const { getImages, isLoading, isError } = useGetImages({
    gridType: "user-saved-" + folder.uid + "-" + folder.id,
  });
  const imageDataPages = useRecoilValue(
    imageDataPagesState("user-saved-" + folder.uid + "-" + folder.id),
  );
  const [thumbnailImgs, setThumbnailImgs] = useState<Array<ImageData | null>>([
    null,
    null,
    null,
    null,
  ]);

  // 썸네일에 사용할 이미지 불러오기
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } else if (
      isLoading ||
      folder.images.length <= 0 ||
      imageDataPages.length > 0 ||
      isError
    ) {
      return;
    }

    // 저장한 이미지 id 배열에서 가장 앞 4장의 이미지만 불러오기
    (async () => {
      await getImages({
        filter: { where: where("id", "in", folder.images.slice(0, 4)) },
      });
    })();
  }, [
    folder.images,
    folder.name,
    getImages,
    isLoading,
    imageDataPages,
    isError,
    thumbnailImgs,
  ]);

  // 불러온 이미지를 썸네일 이미지 상태에 저장
  useEffect(() => {
    if (!imageDataPages || !imageDataPages[0]) {
      setThumbnailImgs([null, null, null, null]);
      return;
    }

    setThumbnailImgs((prev) => {
      const newImgs = _.cloneDeep(prev);
      imageDataPages[0].forEach((img, i) => {
        newImgs[i] = img;
      });
      return newImgs;
    });
  }, [imageDataPages]);

  return (
    <div className="aspect-square w-full select-none">
      {
        <div className="grid grid-cols-2 gap-2">
          {thumbnailImgs.map((img, i) => (
            <div
              style={{
                background: img?.themeColor,
              }}
              className="relative aspect-square grow overflow-hidden rounded-lg bg-gradient-to-br from-shark-100 to-shark-300"
              key={i}
            >
              {img && (
                <Image
                  src={img.URL}
                  alt={img.id}
                  layout="fill"
                  objectFit="cover"
                />
              )}
            </div>
          ))}
        </div>
      }
    </div>
  );
};
export default SavedFolderThumbnail;
