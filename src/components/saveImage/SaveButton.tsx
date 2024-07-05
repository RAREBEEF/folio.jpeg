import {
  alertState,
  authStatusState,
  foldersState,
  gridImageIdsState,
  imageDataPagesState,
  loginModalState,
  saveModalState,
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

const SaveButton = ({
  imageItem,
  color = "white",
}: {
  imageItem: ImageItem;
  color?: "white" | "gray";
}) => {
  const [saveModal, setSaveModal] = useRecoilState(saveModalState);
  const [loginModal, setLoginModal] = useRecoilState(loginModalState);
  const [alert, setAlert] = useRecoilState(alertState);
  const [saved, setSaved] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const [folders, setFolders] = useRecoilState(
    foldersState(authStatus.data?.uid || ""),
  );
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
  // 저장 여부는 각 버튼의 ui를 관리하기 때문에
  // recoil과는 별도로 이미지 그리드 아이템마다 별도로 관리되는 로컬 상태로 구분
  useEffect(() => {
    if (!folders || !authStatus.data) {
      setSaved(false);
      return;
    }

    const targetId = imageItem.id;

    for (const folder of folders) {
      const { images } = folder;

      const targetIndex = images.findIndex((id) => id === targetId);

      if (targetIndex !== -1) {
        setSaved(true);
        return;
      }
    }

    setSaved(false);
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
    } else if (!folders || !authStatus.data) {
      return;
    }

    // 이미 저장된 이미지인지 체크
    const targetId = imageItem.id;

    for (const folder of folders) {
      const { images } = folder;

      const targetIndex = images.findIndex((id) => id === targetId);

      // 이미 저장된 이미지는 저장관리 모달을 띄우고 리스너 종료
      if (targetIndex !== -1) {
        setSaveModal({
          show: true,
          image: imageItem,
          imageSavedFolder: folder,
        });
        return;
      }
    }

    // 아직 저장이 안된 이미지는 기본 폴더에 이미지 저장
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

  // const onShowSaveMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault();
  //   setSaveModal({ show: true, image: imageItem });
  // };

  // const closeSaveMenu = () => {
  //   setSaveModal({ show: false, image: null });
  // };

  return (
    <button onClick={onSaveClick} className="pointer-events-auto h-full">
      {/* <button onClick={onSaveClick} className=""> */}
      {saved ? (
        <UnsaveIcon
          className={`w-full ${color === "white" ? "fill-shark-50" : "fill-shark-500"}`}
        />
      ) : (
        <SaveIcon
          className={`w-full ${color === "white" ? "fill-shark-50" : "fill-shark-500"}`}
        />
      )}
      {/* </button> */}
    </button>
  );
};
export default SaveButton;
