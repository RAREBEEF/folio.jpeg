import { atom, atomFamily } from "recoil";
import {
  Alert,
  AuthStatus,
  Comments,
  Folders,
  Grid,
  ImageDataPages,
  ImageItem,
  InAppNotification,
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

// alert
export const alertState = atom<Alert>({
  key: "alertState",
  default: { text: null, createdAt: null, type: "default", show: false },
});

export const inAppNotificationsState = atom<{
  notifications: Array<InAppNotification>;
}>({
  key: "inAppNotifications",
  default: {
    notifications: [],
  },
});

export const inAppNotificationHistoryState = atom<{
  notificationHistory: Array<InAppNotification>;
  lastPage: boolean;
}>({
  key: "inAppNotificationHistory",
  default: {
    notificationHistory: [],
    lastPage: false,
  },
});
