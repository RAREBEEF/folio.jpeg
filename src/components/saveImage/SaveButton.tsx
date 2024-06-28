import {
  alertState,
  authStatusState,
  foldersState,
  gridImageIdsState,
  imageDataPagesState,
  loginModalState,
} from "@/recoil/states";
import { useRecoilState, useRecoilValue } from "recoil";
import Button from "../Button";
import { Folder, Folders, ImageDataPages, ImageItem } from "@/types";
import { MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import _ from "lodash";
import UnsaveIcon from "@/icons/bookmark-solid.svg";
import SaveIcon from "@/icons/bookmark-regular.svg";
import SaveMenu from "./SaveMenu";

const SaveButton = ({ imageItem }: { imageItem: ImageItem }) => {
  const [showSaveMenu, setShowSaveMenu] = useState<boolean>(false);
  const [loginModal, setLoginModal] = useRecoilState(loginModalState);
  const [alert, setAlert] = useRecoilState(alertState);
  const [saved, setSaved] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const [folders, setFolders] = useRecoilState(
    foldersState(authStatus.data?.uid || ""),
  );
  const [savedFolder, setSavedFolder] = useState<Folder | null>(null);
  const [defaultFolderImagePage, setDefaultFolderImagePage] = useRecoilState(
    imageDataPagesState(
      "user-saved-" + (authStatus.data?.uid || "") + "-" + "_DEFAULT",
    ),
  );
  const [defaultFolderGridImageIds, setDefaultFolderGridImageIds] =
    useRecoilState(
      gridImageIdsState(
        "user-saved-" + (authStatus.data?.uid || "") + "-" + "_DEFAULT",
      ),
    );

  // 해당 이미지가 이미 저장되었는지 여부 확인
  useEffect(() => {
    if (!folders || !authStatus.data) {
      setSaved(false);
      setSavedFolder(null);
      setShowSaveMenu(false);
      return;
    }

    let isSaved = false;
    const targetId = imageItem.id;

    for (const folder of folders) {
      const { images } = folder;

      const targetIndex = images.findIndex((id) => id === targetId);

      if (targetIndex !== -1) {
        isSaved = true;
        setSavedFolder(folder);
        break;
      }
    }

    setSaved(isSaved);
  }, [authStatus.data, folders, imageItem.id]);

  // 저장 버튼 클릭
  const onSaveClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (authStatus.status === "signedOut") {
      setLoginModal({ show: true });
      return;
    } else if (authStatus.status === "noExtraData") {
      setLoginModal({ show: true, showInit: true });
      return;
    }

    if (!folders || !authStatus.data) return;

    const uid = authStatus.data.uid;
    const updatedAt = Date.now();
    const defaultFolderIndex = folders.findIndex(
      (folder) => folder.id === "_DEFAULT",
    );
    const defaultFolder = folders[defaultFolderIndex];

    // 이전 상태 백업
    let prevFolders = [...folders];
    let prevDefaultFolderImagePage: ImageDataPages;
    let prevDefaultFolderGridImageIds: Array<string>;

    // 폴더 상태 업데이트
    const newImages = [...defaultFolder.images, imageItem.id];
    const newFolders = [...folders];
    newFolders.splice(defaultFolderIndex, 1, {
      ...defaultFolder,
      updatedAt,
      images: newImages,
    });
    setFolders(newFolders);
    setDefaultFolderImagePage((prev) => {
      prevDefaultFolderImagePage = prev; // 이전 상태
      const newImagePage = _.cloneDeep(prev);

      if (newImagePage.length <= 0) {
        return [[imageItem]];
      } else {
        newImagePage[0].unshift(imageItem);
        return newImagePage;
      }
    });
    setDefaultFolderGridImageIds((prev) => {
      prevDefaultFolderGridImageIds = prev; // 이전 상태
      const newIds = _.cloneDeep(prev);
      newIds.unshift(imageItem.id);
      return newIds;
    });

    // db 업데이트
    const docRef = doc(db, "users", uid, "folders", "_DEFAULT");
    await updateDoc(docRef, { images: newImages, updatedAt })
      .catch((error) => {
        // 에러 시 백업 상태로 롤백
        setFolders(prevFolders);
        setDefaultFolderImagePage(prevDefaultFolderImagePage);
        setDefaultFolderGridImageIds(prevDefaultFolderGridImageIds);
      })
      .then(() => {
        // 저장 완료 알림 띄우기
        setAlert({
          show: true,
          type: "success",
          createdAt: Date.now(),
          text: "저장되었습니다.",
        });
      });
  };

  const onShowSaveMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowSaveMenu(true);
  };

  const closeSaveMenu = () => {
    setShowSaveMenu(false);
  };

  return (
    <div className="pointer-events-auto w-8 origin-top-right">
      <button
        onClick={saved ? onShowSaveMenuClick : onSaveClick}
        className=" transition-all hover:scale-105"
      >
        {saved ? (
          <UnsaveIcon className="w-full fill-shark-50" />
        ) : (
          <SaveIcon className="w-full fill-shark-50" />
        )}
      </button>
      {showSaveMenu && savedFolder && (
        <SaveMenu
          imageItem={imageItem}
          savedFolder={savedFolder}
          closeSaveMenu={closeSaveMenu}
        />
      )}
    </div>
  );
};
export default SaveButton;
