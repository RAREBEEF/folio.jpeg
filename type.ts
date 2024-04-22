export interface ImageDocData {
  createdAt: number;
  creatorId: string;
  likes: Array<string>;
  name: string;
  tags: Array<string>;
  size: {
    width: number;
    height: number;
  };
}

export interface ImageData extends ImageDocData {
  id: string;
}

export type ImageDataList = Array<ImageData>;

export interface ColumnItem {
  id: string;
  name: string;
  height: number;
  x: number;
  y: number;
}

export type ImageItem = {
  id: string;
  name: string;
  height: number;
  x: number;
  y: number;
  createdAt: number;
  creatorId: string;
  likes: Array<string>;
  tags: Array<string>;
  size: {
    width: number;
    height: number;
  };
  url: string;
} | null;

export interface Column {
  items: Array<ColumnItem>;
  height: number;
}

export interface Grid {
  cols: Array<Column>;
  colCount: number;
  colWidth: number;
  gap: number;
  height: number;
}
