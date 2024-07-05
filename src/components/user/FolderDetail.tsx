"use client";

import _ from "lodash";
import { Folder, Folders, UserData } from "@/types";
import SavedImageList from "../imageList/SavedImageList";
import Button from "../Button";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/fb";
import { useRecoilState, useRecoilValue } from "recoil";
import { alertState, authStatusState, foldersState } from "@/recoil/states";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/components/modal/Modal";
import EditFolderModal from "@/components/modal/EditFolderModal";
import useGetFolders from "@/hooks/useGetFolders";
import useGetExtraUserDataByDisplayId from "@/hooks/useGetExtraUserDataByDisplayId";

const FolderDetail = ({}: {}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [alert, setAlert] = useRecoilState(alertState);
  const authStatus = useRecoilValue(authStatusState);
  const { replace } = useRouter();
  const { folderName: folderNameParam, displayId: dpid } = useParams();
  const [pageUid, setPageUid] = useState<string>("");
  const [folders, setFolders] = useRecoilState(foldersState(pageUid));
  const { getExtraUserDataByDisplayId, isLoading: isExtraUserDataLoading } =
    useGetExtraUserDataByDisplayId();
  const { getFolders, isLoading: isFolderLoading } = useGetFolders();
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const folderName = useMemo(
    (): string =>
      decodeURIComponent(
        JSON.stringify(folderNameParam)
          .replaceAll('"', "")
          .replaceAll("-", " "),
      ),
    [folderNameParam],
  );
  const displayId = useMemo(
    (): string => decodeURIComponent(JSON.stringify(dpid).replaceAll('"', "")),
    [dpid],
  );

  // 폴더 주인의 uid 초기화
  useEffect(() => {
    if (typeof displayId !== "string" || isExtraUserDataLoading) return;

    // 세션 스토리지에 저장된 pageUid 존재하면 (유저페이지에서 폴더를 클릭해 링크 이동했을 때)
    const storedUid = sessionStorage.getItem("curpi");
    if (storedUid) {
      setPageUid(storedUid);
      sessionStorage.removeItem("curpi");
      // 저장된 pageUid 없으면 (유저페이지 외 다른 경로로 폴더 페이지에 들어왔을 때)
      // db에서 uid를 새로 불러온다.
    } else {
      if (!folders && !pageUid) {
        (async () => {
          const extraUserData = await getExtraUserDataByDisplayId({
            displayId,
          });
          if (extraUserData?.data) {
            setPageUid(extraUserData.data.uid);
          } else {
            // extraUserData 없으면 홈으로
            replace("/");
          }
        })();
      }
    }
  }, [
    displayId,
    folders,
    getExtraUserDataByDisplayId,
    isExtraUserDataLoading,
    pageUid,
    replace,
  ]);

  // 폴더 목록 초기화
  useEffect(() => {
    if (isFolderLoading) return;

    // 현재 폴더 주인의 폴더 목록 데이터가 없지만 uid는 있다면
    if (!folders && pageUid) {
      // db에서 해당 유저의 폴더 목록 데이터 불러오기
      (async () => {
        await getFolders({ uid: pageUid })
          .then((folders) => {
            // 폴더 목록 데이터가 존재하지 않거나 불러온 폴더의 uid와 현재 갖고 있는 uid가 일치하지 않으면
            if (!folders || folders.length <= 0 || folders[0].uid !== pageUid) {
              // 홈으로 이동
              replace("/");
            } else {
              //  데이터가 정상이면 폴더 목록 상태 업데이트
              setFolders(folders);
            }
          })
          .catch((error) => {
            replace("/");
          });
      })();
    }
  }, [folders, getFolders, isFolderLoading, pageUid, replace, setFolders]);

  // 현재 폴더 초기화(폴더 목록에서 현재 폴더 찾기)
  useEffect(() => {
    // 폴더 목록이 없으면 돌아간다.
    if (!folders) return;

    // 폴더 목록에서 폴더이름과 uid가 일치하는 폴더 찾기
    const curFolder = folders.find(
      (folder) => folder.name === folderName && folder.uid === pageUid,
    );

    if (!curFolder) {
      replace(`/${displayId}`);
      return;
    }

    // 현재 폴더 상태 업데이트
    setCurrentFolder(curFolder);
  }, [displayId, folders, pageUid, folderName, replace]);

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
