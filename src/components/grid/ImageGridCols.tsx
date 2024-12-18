import { useRecoilValue } from "recoil";
import ImageGridColsItem from "./ImageGridColsItem";
import { gridState } from "@/recoil/states";
import { ImageDataPages } from "@/types";

const ImageGridCols = ({
  imageDataPages,
  type,
}: {
  imageDataPages: ImageDataPages;
  type: string;
}) => {
  const grid = useRecoilValue(gridState(type));

  return grid!.cols.map((col, i) => (
    <ul key={i} className="relative m-auto *:absolute *:left-0 *:top-0">
      {col.items.map((gridItem, i) => (
        <ImageGridColsItem
          type={type}
          gridItem={gridItem}
          imageDataPages={imageDataPages}
          key={gridItem.id}
        />
      ))}
    </ul>
  ));
};

export default ImageGridCols;
