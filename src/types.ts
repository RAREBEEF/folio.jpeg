export interface ImageDocData {
  createdAt: number;
  uid: string;
  fileName: string;
  originalName: string;
  title?: string;
  description?: string;
  byte: number;
  url: string;
  size: {
    width: number;
    height: number;
  };
  tags: Array<string>;
  comments: Array<Comment>;
  likes: Array<string>;
}

export interface Comment {
  content: string;
  createdAt: number;
  uid: string;
  comments: Array<Comment>;
}

export interface ImageData extends ImageDocData {
  id: string;
}

export type ImageItem = {
  id: string;
  page: number;
  fileName: string;
  originalName: string;
  title?: string;
  description?: string;
  height: number;
  x: number;
  y: number;
  createdAt: number;
  uid: string;
  likes: Array<string>;
  tags: Array<string>;
  size: {
    width: number;
    height: number;
  };
  byte: number;
  url: string;
};

export type ImageDataPages = Array<Array<ImageData>>;

export interface Column {
  items: Array<ImageItem>;
  height: number;
}

export interface Grid {
  cols: Array<Column>;
  colCount: number;
  colWidth: number;
  gap: number;
  height: number;
}

export interface Comment {
  uid: string;
  createdAt: number;
  content: string;
  comments: Array<Comment>;
}
