import { atom, atomFamily } from "recoil";
import { Grid, ImageDataPages, ImageItem } from "@/types";

export const navState = atom({
  key: "navState",
  default: { show: true },
});

// export const imageIdsState = atom({
//   key: "imageIdsState",
//   default: [] as Array<string>,
// });

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
export const imageDataPagesState = atom({
  key: "photos",
  default: [] as ImageDataPages,
});

export const imageItemState = atomFamily({
  key: "ImageItemState",
  default: (id: string): ImageItem => {
    return {
      id: id,
      fileName: "",
      height: 0,
      x: 0,
      y: 0,
      createdAt: 0,
      uid: "",
      likes: [] as Array<string>,
      tags: [] as Array<string>,
      size: {
        width: 0,
        height: 0,
      },
      url: "",
      page: 0,
      originalName: "",
      byte: 0,
    };
  },
});
