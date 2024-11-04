import {
  gridImageIdsState,
  gridState,
  imageDataPagesState,
  lastVisibleState,
} from "@/recoil/states";
import { useResetRecoilState } from "recoil";

const useResetGrid = ({ gridType }: { gridType: string }) => {
  const resetImageDataPages = useResetRecoilState(
    imageDataPagesState(gridType),
  );
  const resetLastVisible = useResetRecoilState(lastVisibleState(gridType));
  const resetGridImageIds = useResetRecoilState(gridImageIdsState(gridType));
  const resetGrid = useResetRecoilState(gridState(gridType));

  const reset = () => {
    resetImageDataPages();
    resetLastVisible();
    resetGridImageIds();
    resetGrid();
  };

  return reset;
};

export default useResetGrid;
