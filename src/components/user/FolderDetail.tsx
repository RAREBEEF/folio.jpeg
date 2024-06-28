"use client";

import _ from "lodash";
import { Folder, Folders, UserData } from "@/types";
import SavedImageList from "../imageList/SavedImageList";
import Button from "../Button";
import { MouseEvent, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/fb";
import { useRecoilState, useRecoilValue } from "recoil";
import { alertState, authStatusState, foldersState } from "@/recoil/states";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal/Modal";
import EditFolderModal from "@/components/modal/EditFolderModal";

const FolderDetail = ({
  currentFolder,
  pageUid,
  displayId,
}: {
  currentFolder: Folder | null;
  pageUid: string;
  displayId: string;
}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const { replace } = useRouter();
  const [folders, setFolders] = useRecoilState(foldersState(pageUid));
  const [alert, setAlert] = useRecoilState(alertState);
  const authStatus = useRecoilValue(authStatusState);

  const onDeleteFolderClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      !currentFolder ||
      authStatus.status !== "signedIn" ||
      authStatus.data!.uid !== currentFolder.uid
    ) {
      setAlert({
        text: "폴더를 삭제할 수 없습니다.",
        createdAt: Date.now(),
        type: "warning",
        show: true,
      });
      return;
    }

    const ok = window.confirm("폴더를 삭제하시겠습니까?");

    if (!ok) return;

    // 기존 상태 백업
    let prevFolders: Folders | null;

    setFolders((prev) => {
      prevFolders = prev;

      if (!prev) return prev;

      const newFolders = _.cloneDeep(prev);

      const targetIndex = newFolders.findIndex(
        (folder) => folder.id === currentFolder.id,
      );

      newFolders.splice(targetIndex, 1);

      return newFolders;
    });

    const docRef = doc(db, "users", pageUid, "folders", currentFolder.id);
    await deleteDoc(docRef)
      .then(() => {
        setAlert({
          text: "폴더를 삭제하였습니다.",
          createdAt: Date.now(),
          type: "success",
          show: true,
        });
        replace(`/${displayId}`);
      })
      .catch((error) => {
        // 오류 시 백업 상태로 롤백
        setFolders(prevFolders);
        setAlert({
          text: "폴더 삭제 중 문제가 발생하였습니다..",
          createdAt: Date.now(),
          type: "warning",
          show: true,
        });
      });
  };

  const onFolderEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      authStatus.status !== "signedIn" ||
      !authStatus.data ||
      !currentFolder
    ) {
      return;
    }

    setShowEditModal(true);
  };

  const onCloseEditModal = () => {
    setShowEditModal(false);
  };

  return (
    <div className="relative h-full bg-shark-50">
      {currentFolder && (
        <div className="flex h-full flex-col">
          {authStatus.data?.uid === currentFolder.uid && (
            <div className="flex w-full justify-end gap-2 p-4">
              <Button onClick={onFolderEditClick}>
                <div className="text-xs">폴더 수정</div>
              </Button>
              <Button onClick={onDeleteFolderClick}>
                <div className="text-xs">폴더 삭제</div>
              </Button>
            </div>
          )}
          <SavedImageList
            type={"user-saved-" + pageUid + "-" + currentFolder.id}
            folder={currentFolder}
          />
        </div>
      )}
      {showEditModal && (
        <Modal close={onCloseEditModal} title="폴더 수정">
          <EditFolderModal
            currentFolder={currentFolder as Folder}
            closeModal={onCloseEditModal}
            userData={authStatus.data as UserData}
          />
        </Modal>
      )}
    </div>
  );
};

export default FolderDetail;
