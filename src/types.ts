// 이미지 관련
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
  likes: Array<string>;
}

export interface ImageData extends ImageDocData {
  id: string;
}

export type ImageItem = {
  id: string;
  fileName: string;
  originalName: string;
  title?: string;
  description?: string;
  createdAt: number;
  uid: string;
  likes: Array<string>;
  tags: Array<string>;
  byte: number;
  url: string;
  size: {
    width: number;
    height: number;
  };
  grid: {
    page: number;
    height: number;
    x: number;
    y: number;
  } | null;
};

export type ImageDataPages = Array<Array<ImageData>>;

// 그리드
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

// 댓글
export interface Comment {
  id: string;
  content: string;
  createdAt: number;
  uid: string;
  replies: Array<Comment>;
}

export type Comments = { [key in string]: Comment };
