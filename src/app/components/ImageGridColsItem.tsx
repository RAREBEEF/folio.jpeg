import Image from "next/image";
import { ColumnItem } from "../../../type";
import { atomFamily, useRecoilState, useRecoilValue } from "recoil";
import { gridState, imageDataListState } from "./ImageGrid";
import { useEffect } from "react";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

export const imageItemState = atomFamily({
  key: "ImageItemState",
  default: (id: string) => {
    return {
      id: id,
      name: "",
      height: 0,
      x: 0,
      y: 0,
      createdAt: 0,
      creatorId: "",
      likes: [] as Array<string>,
      tags: [] as Array<string>,
      size: {
        width: 0,
        height: 0,
      },
      url: "",
    };
  },
});

const ImageGridColsItem = ({ item }: { item: ColumnItem }) => {
  const imageDataList = useRecoilValue(imageDataListState);
  const [imageItem, setImageItem] = useRecoilState(imageItemState(item.id));
  const grid = useRecoilValue(gridState);

  // TODO: atomFamily로 이미지 state 생성하기
  useEffect(() => {
    const fetchPhotoUrl = async () => {
      try {
        const storage = getStorage();

        getDownloadURL(ref(storage, `images/${item.name}`)).then((url) => {
          const image = imageDataList.find(
            (imageData) => imageData.id === item.id,
          );
          setImageItem((prev) => ({ ...prev, ...image, url, ...item }));
        });
      } catch (error) {
        console.error("Error fetching photo URL:", error);
      }
    };

    fetchPhotoUrl();
  }, [imageDataList, item, setImageItem]);

  return (
    <li
      className="relative overflow-hidden rounded-xl"
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
        />
      ) : (
        <div
          className="bg-shark-100"
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
