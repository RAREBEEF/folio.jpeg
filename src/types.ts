import { User } from "firebase/auth";

// 필터
// export type FilterWhere = [string, WhereFilterOp, string | Array<string>];
export interface Filter {
  orderBy?: ["createdAt" | "popularity", "desc" | "asc"];
  limit?: number;
  where?: any;
}

// 유저
export interface UserData extends User {
  // 불러오기 전은 undefined, 불러왔지만 존재하지 않으면 null
  displayId?: string | undefined | null;
  following?: Array<string>;
  follower?: Array<string>;
  fcmToken?: string | null;
}
export interface ExtraUserData {
  displayId: string;
  photoURL: string;
  following: Array<string>;
  follower: Array<string>;
  fcmToken: string | null;
}

type AuthStatusUserData = {
  pending: null;
  noExtraData: UserData;
  signedIn: UserData;
  signedOut: null;
  error: null;
}[AuthStatus["status"]];

export interface AuthStatus {
  status: "pending" | "noExtraData" | "signedIn" | "signedOut" | "error";
  data: AuthStatusUserData;
}

// 이미지 관련
export interface ImageDocData {
  createdAt: number;
  uid: string;
  fileName: string;
  originalName: string;
  title?: string;
  description?: string;
  byte: number;
  URL: string;
  size: {
    width: number;
    height: number;
  };
  aiTags: Array<string>;
  customTags: Array<string>;
  tags: Array<string>;
  feedback: Feedback;
  likes: Array<string>;
  themeColor: string;
  popularity: number;
  metadata: ImageMetadata;
  customMetadata: ImageMetadata;
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
  aiTags: Array<string>;
  customTags: Array<string>;
  tags: Array<string>;
  feedback: Feedback;
  byte: number;
  URL: string;
  themeColor: string;
  size: {
    width: number;
    height: number;
  };
  popularity: number;
  metadata: ImageMetadata;
  customMetadata: ImageMetadata;
};
export type ImageDataPages = Array<Array<ImageData>>;

// 그리드
export interface GridItem {
  id: string;
  page: number;
  height: number;
  x: number;
  y: number;
}
export interface Column {
  items: Array<GridItem>;
  height: number;
}
export type Grid = {
  cols: Array<Column>;
  colCount: number;
  colWidth: number;
  gap: number;
  height: number;
  page?: number;
} | null;

// 댓글
export interface Comment {
  id: string;
  content: string;
  createdAt: number;
  uid: string;
  replies: Array<Comment>;
  fcmTokens: Array<string>;
}
export type Comments = { [key in string]: Comment };

// 폴더
export interface Folder {
  id: string;
  createdAt: number;
  images: Array<string>;
  isPrivate: boolean;
  name: string;
  uid: string;
  updatedAt: number;
}
export type Folders = Array<Folder>;

// alert
export interface Alert {
  text: string | null;
  createdAt: number | null;
  type: "default" | "success" | "warning";
  show: boolean;
}
export interface InAppNotification {
  title: string;
  body: string | null;
  createdAt: number;
  profileImage: string;
  targetImage?: string | null;
  URL: string;
}

export type AnalysisResult =
  | {
      tags: Array<string>;
      themeColor: string;
      feedback: Feedback;
    }
  | "inappreciate";

export interface Feedback {
  detail: string;
  summary: { good: string; improve: string };
}

export interface UserFeedback {
  createdAt: number;
  feedback: Feedback | null;
}

export interface ImageMetadata {
  make: string | null;
  model: string | null;
  lensMake: string | null;
  lensModel: string | null;
  shutterSpeed: string | null;
  fNumber: number | null;
  ISO: number | null;
  focalLength: number | null;
}
