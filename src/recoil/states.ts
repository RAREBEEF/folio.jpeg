import { atom, atomFamily } from "recoil";
import {
  Alert,
  AuthStatus,
  Comments,
  Folder,
  Folders,
  Grid,
  ImageData,
  ImageDataPages,
  ImageItem,
  InAppNotification,
  UploadStatus,
  UserData,
} from "@/types";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

// user 상태
export const authStatusState = atom({
  key: "authStatusState",
  default: { status: "pending", data: null } as AuthStatus,
});
export const userDataState = atomFamily({
  key: "userDataState",
  default: (displayId: string): UserData | null => {
    return null;
  },
});
export const usersDataState = atom({
  key: "usersDataState",
  default: {} as { [key in string]: UserData },
});

// ui 상태
export const loginModalState = atom({
  key: "loginModalState",
  default: { show: false } as { show: boolean; showInit?: boolean },
});
export const saveModalState = atom({
  key: "saveModalState",
  default: { show: false, image: null } as {
    show: boolean;
    image: ImageData | null;
    imageSavedFolder: Folder | null;
  },
});
export const navState = atom({
  key: "navState",
  default: { show: false },
});

// images 상태
export const imageDataPagesState = atomFamily({
  key: "imagePages",
  default: (type: string): ImageDataPages => {
    return [];
  },
});
export const gridImageIdsState = atomFamily({
  key: "gridImageIdsState",
  default: (type: string): Array<string> => {
    return [];
  },
});
export const imageItemState = atomFamily({
  key: "imageItemState",
  default: (id: string): ImageItem | null => {
    return null;
  },
});
export const lastVisibleState = atomFamily({
  key: "lastVisibleState",
  default: (
    type: string,
  ): QueryDocumentSnapshot<DocumentData, DocumentData> | null => {
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

// 폴더 상태
export const foldersState = atomFamily({
  key: "commentsState",
  default: (uid: string): Folders | null => {
    return null;
  },
});

// grid 상태
export const gridState = atom<Grid>({
  key: "gridState",
  default: null,
});

// alert(앱 내 오류, 경고, 작업 성공 등의 안내창)
export const alertsState = atom<Array<Alert>>({
  key: "alertsState",
  default: [],
});

export const uploadStatusState = atom<Array<UploadStatus>>({
  key: "uploadStatusState",
  default: [],
});

// 유저간 커뮤니케이션으로 발생하는 알림
export const inAppNotificationState = atom<{
  list: Array<InAppNotification>;
  lastCheck: number;
}>({
  key: "inAppNotification",
  default: {
    list: [],
    lastCheck: 0,
  },
});

export const deviceState = atom<"mobile" | "pc">({
  key: "deviceState",
  default: "pc",
});
