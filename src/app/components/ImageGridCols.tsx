import { useRecoilValue } from "recoil";
import { gridState } from "./ImageGrid";
import ImageGridColsItem from "./ImageGridColsItem";
import { Suspense } from "react";

const ImageGridCols = () => {
  const grid = useRecoilValue(gridState);

  return (
    <Suspense fallback={<div>loading</div>}>
      {grid.cols.map((col, i) => (
        <ul
          key={i}
          className="relative m-auto bg-black *:absolute *:left-0 *:top-0"
        >
          {col.items.map((item, i) => (
            <ImageGridColsItem item={item} key={i} />
          ))}
        </ul>
      ))}
    </Suspense>
  );
};

export default ImageGridCols;
