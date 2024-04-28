import { useRecoilValue } from "recoil";
import ImageGridColsItem from "./ImageGridColsItem";
import { gridState } from "@/recoil/states";

const ImageGridCols = () => {
  const grid = useRecoilValue(gridState);

  return grid.cols.map((col, i) => (
    <ul
      key={i}
      className="relative m-auto bg-black *:absolute *:left-0 *:top-0"
    >
      {col.items.map((item, i) => (
        <ImageGridColsItem item={item} key={i} />
      ))}
    </ul>
  ));
};

export default ImageGridCols;
