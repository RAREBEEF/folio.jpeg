import {
  gridImageIdsState,
  imageDataPagesState,
  lastVisibleState,
} from "@/recoil/states";
import { useResetRecoilState } from "recoil";

const useResetGrid = (type: string) => {
  const resetImageDataPages = useResetRecoilState(imageDataPagesState(type));
  const resetLastVisible = useResetRecoilState(lastVisibleState(type));
  const resetGridImageIds = useResetRecoilState(gridImageIdsState(type));

  const reset = () => {
    resetImageDataPages();
    resetLastVisible();
    resetGridImageIds();
  };

  return reset;
};

export default useResetGrid;
