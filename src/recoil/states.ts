import { atom, atomFamily } from "recoil";
import { Comments, Grid, ImageDataPages, ImageItem } from "@/types";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

// 네비게이션 상태
export const navState = atom({
  key: "navState",
  default: { show: true },
});

// 이미지 상태
export const imageDataPagesState = atom({
  key: "photos",
  default: [] as ImageDataPages,
});

export const imageItemState = atomFamily({
  key: "imageItemState",
  default: (id: string): ImageItem | null => {
    return null;
  },
});

// 댓글 상태
export const commentsState = atomFamily({
  key: "commentsState",
  default: (imageId: string): Comments | null => {
    return null;
  },
});

export const lastVisibleState = atom<QueryDocumentSnapshot<
  DocumentData,
  DocumentData
> | null>({
  key: "lastVisibleState",
  default: null,
});

// 그리드 상태
export const gridState = atom<Grid>({
  key: "gridState",
  default: {
    cols: [],
    gap: 15,
    colCount: 3,
    colWidth: 200,
    height: 0,
  },
});
export const gridImageIdsState = atom<Array<string>>({
  key: "gridImageIdsState",
  default: [],
});
