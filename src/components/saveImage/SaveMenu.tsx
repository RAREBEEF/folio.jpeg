import XSvg from "@/icons/xmark-solid.svg";
import Button from "../Button";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { Folder, Folders, ImageDataPages, ImageItem } from "@/types";
import { ChangeEvent, MouseEvent, useState } from "react";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import _ from "lodash";
import {
  alertState,
  authStatusState,
  foldersState,
  gridImageIdsState,
  imageDataPagesState,
} from "@/recoil/states";

const SaveMenuModal = ({
  closeSaveMenu,
  savedFolder,
  imageItem,
}: {
  closeSaveMenu: Function;
  savedFolder: Folder;
  imageItem: ImageItem;
}) => {
  const [alert, setAlert] = useRecoilState(alertState);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    savedFolder.id,
  );
  const authStatus = useRecoilValue(authStatusState);
  const [folders, setFolders] = useRecoilState(
    foldersState(authStatus.data?.uid || ""),
  );
  const [prevFolderImagePage, setPrevFolderImagePage] = useRecoilState(
    imageDataPagesState(
      "user-saved-" +
        (authStatus.data?.uid || "") +
        "-" +
        (savedFolder?.id || ""),
    ),
  );
  const [prevFolderGridImageIds, setPrevFolderGridImageIds] = useRecoilState(
    gridImageIdsState(
      "user-saved-" +
        (authStatus.data?.uid || "") +
        "-" +
        (savedFolder?.id || ""),
    ),
  );

  const [selectedFolderImagePage, setSelectedFolderImagePage] = useRecoilState(
    imageDataPagesState(
      "user-saved-" + (authStatus.data?.uid || "") + "-" + selectedFolderId,
    ),
  );
  const [selectedFolderGridImageIds, setSelectedFolderGridImageIds] =
    useRecoilState(
      gridImageIdsState(
        "user-saved-" + (authStatus.data?.uid || "") + "-" + selectedFolderId,
      ),
    );

  // 저장 취소 버튼 클릭
  const onUnsaveClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!folders || !savedFolder || !authStatus.data) return;

    const uid = authStatus.data.uid;
    const imageId = imageItem.id;
    const folderId = savedFolder.id;
    const updatedAt = Date.now();

    // 이전 상태 백업
    let prevFolders: Folders;
    let prevFolderImagePage: ImageDataPages;
    let prevFolderGridImageIds: Array<string>;

    // 폴더 상태 업데이트
    setFolders((prev) => {
      if (!prev) return [];

      prevFolders = prev;
      const newFolders = _.cloneDeep(prev);

      const targetFolderIndex = newFolders.findIndex(
        (folder) => folder.id === folderId,
      );

      if (targetFolderIndex == -1) return prev;

      const targetFolder = newFolders[targetFolderIndex];
      const prevImages = newFolders[targetFolderIndex].images;

      targetFolder.images = prevImages.filter((id) => id !== imageId);

      return newFolders;
    });
    setPrevFolderImagePage((prev) => {
      prevFolderImagePage = prev;

      const newCustomFolderImagePage = _.cloneDeep(prev);

      for (let page = 0; page <= newCustomFolderImagePage.length; page++) {
        const images = newCustomFolderImagePage[page];
        for (let i = 0; i <= images.length; i++) {
          const image = images[i];
          if (image.id === imageId) {
            newCustomFolderImagePage[page].splice(i, 1);
            return newCustomFolderImagePage;
          }
        }
      }

      return newCustomFolderImagePage;
    });
    setPrevFolderGridImageIds((prev) => {
      prevFolderGridImageIds = prev;
      const newCustomFolderGridImageIds = _.cloneDeep(prev);
      return newCustomFolderGridImageIds.filter((id) => id !== imageId);
    });

    const docRef = doc(db, "users", uid, "folders", folderId);
    await updateDoc(docRef, { images: arrayRemove(imageId), updatedAt })
      .then(() => {
        setAlert({
          show: true,
          type: "success",
          createdAt: Date.now(),
          text: "저장 목록에서 삭제되었습니다.",
        });
      })
      .catch((error) => {
        // 에러 시 백업 상태로 롤백
        setFolders(prevFolders);
        setPrevFolderImagePage(prevFolderImagePage);
        setPrevFolderGridImageIds(prevFolderGridImageIds);
        setAlert({
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "목록 업데이트 중 문제가 발생했습니다.",
        });
      });
  };

  const onSaveChange = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (
      !folders ||
      !savedFolder ||
      !authStatus.data ||
      savedFolder.id === selectedFolderId
    )
      return;

    const uid = authStatus.data.uid;
    const imageId = imageItem.id;
    const prevFolderId = savedFolder.id;
    const updatedAt = Date.now();

    // 이전 상태 백업
    let prevFolders: Folders;
    let prevFolderImagePage: ImageDataPages;
    let prevFolderGridImageIds: Array<string>;
    let selectedFolderImagePage: ImageDataPages;
    let selectedFolderGridImageIds: Array<string>;

    // 폴더 상태 업데이트
    // 이전 폴더에서 이미지 삭제 후 선택한 폴더에 이미지 추가
    setFolders((prev) => {
      if (!prev) return [];

      prevFolders = prev;
      const newFolders = _.cloneDeep(prev);

      const prevFolderIndex = newFolders.findIndex(
        (folder) => folder.id === prevFolderId,
      );
      const selectedFolderIndex = newFolders.findIndex(
        (folder) => folder.id === selectedFolderId,
      );

      if (prevFolderIndex === -1 || selectedFolderIndex === -1) return prev;

      const prevFolder = newFolders[prevFolderIndex];
      const prevFolderImages = prevFolder.images;
      prevFolder.images = prevFolderImages.filter((id) => id !== imageId);

      const selectedFolder = newFolders[selectedFolderIndex];
      const selectedFolderImages = [...selectedFolder.images, imageId];

      selectedFolder.images = selectedFolderImages;

      return newFolders;
    });
    // 이전 폴더의 상태 업데이트
    // 이전 폴더의 이미지 목록에서 삭제
    setPrevFolderImagePage((prev) => {
      prevFolderImagePage = prev;

      const newFolderImagePage = _.cloneDeep(prev);

      for (let page = 0; page <= newFolderImagePage.length; page++) {
        const images = newFolderImagePage[page];
        if (!images) {
          return prev;
        }
        for (let i = 0; i <= images.length; i++) {
          const image = images[i];
          if (image.id === imageId) {
            newFolderImagePage[page].splice(i, 1);
            return newFolderImagePage;
          }
        }
      }

      return newFolderImagePage;
    });
    // 이전 폴더의 이미지 id 목록에서 id 삭제
    setPrevFolderGridImageIds((prev) => {
      prevFolderGridImageIds = prev;
      const newFolderGridImageIds = _.cloneDeep(prev);
      return newFolderGridImageIds.filter((id) => id !== imageId);
    });

    // 새로 선택한 폴더의 이미지 목록에 추가
    setSelectedFolderImagePage((prev) => {
      selectedFolderImagePage = prev; // 이전 상태
      const newImagePage = _.cloneDeep(prev);

      if (newImagePage.length <= 0) {
        return [[imageItem]];
      } else {
        newImagePage[0].push(imageItem);
        return newImagePage;
      }
    });
    // 새로 선택한 폴더의 이미지 id 목록에 추가
    setSelectedFolderGridImageIds((prev) => {
      selectedFolderGridImageIds = prev; // 이전 상태
      const newIds = _.cloneDeep(prev);
      newIds.push(imageItem.id);
      return newIds;
    });

    // db 업데이트
    const prevFolderDocRef = doc(db, "users", uid, "folders", prevFolderId);
    const selectedFolderDocRef = doc(
      db,
      "users",
      uid,
      "folders",
      selectedFolderId,
    );
    await Promise.all([
      updateDoc(prevFolderDocRef, { images: arrayRemove(imageId), updatedAt }),
      updateDoc(selectedFolderDocRef, {
        images: arrayUnion(imageId),
        updatedAt,
      }),
    ])
      .then(() => {
        setAlert({
          show: true,
          type: "success",
          createdAt: Date.now(),
          text: "폴더가 변경되었습니다.",
        });
        closeSaveMenu();
      })
      .catch((error) => {
        // 에러 시 백업 상태로 롤백
        setFolders(prevFolders);
        setPrevFolderImagePage(prevFolderImagePage);
        setPrevFolderGridImageIds(prevFolderGridImageIds);
        setSelectedFolderImagePage(selectedFolderImagePage);
        setSelectedFolderGridImageIds(selectedFolderGridImageIds);
        setAlert({
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "폴더 변경 중 문제가 발생했습니다.",
        });
      });
  };

  const onSelectedFolderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedFolderId(e.target.value);
  };
  return (
    <div className="absolute left-0 top-0 flex h-full w-full scale-105 flex-col justify-between gap-2 rounded-lg border-2 bg-shark-50 p-2 text-sm text-shark-700 shadow-inner sm:text-xs">
      <div className="flex justify-between">
        <h3 className="font-semibold">저장 관리</h3>
        <button
          className="h-5 w-5"
          onClick={() => {
            closeSaveMenu();
          }}
        >
          <XSvg />
        </button>
      </div>
      <div className="flex justify-center gap-2 text-center">
        {folders && (
          <select
            onChange={onSelectedFolderChange}
            value={selectedFolderId}
            className="rounded-lg outline-none"
            name="folder"
            id="folder-select"
          >
            {folders.map((folder, i) => (
              <option key={i} id={folder.id} value={folder.id}>
                {folder.name === "_DEFAULT" ? "미분류" : folder.name}
              </option>
            ))}
          </select>
        )}
        <Button
          disabled={savedFolder.id === selectedFolderId}
          onClick={onSaveChange}
        >
          <div>저장</div>
        </Button>
      </div>
      <div className="flex w-full justify-end">
        <Button onClick={onUnsaveClick}>
          <div>삭제</div>
        </Button>
      </div>
    </div>
  );
};

export default SaveMenuModal;
