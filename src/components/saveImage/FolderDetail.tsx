"use client";

import _ from "lodash";
import { Folder, Folders, UserData } from "@/types";
import SavedImageList from "../imageList/SavedImageList";
import Button from "../Button";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/fb";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertState,
  authStatusState,
  foldersState,
  usersDataState,
} from "@/recoil/states";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/components/modal/Modal";
import EditFolderModal from "@/components/modal/EditFolderModal";
import useGetFolders from "@/hooks/useGetFolders";
import useGetExtraUserDataByDisplayId from "@/hooks/useGetExtraUserDataByDisplayId";

const FolderDetail = ({}: {}) => {
  const isInitialMount = useRef(true);
  const { folderName: folderNameParam, displayId: dpid } = useParams();
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

  const { replace } = useRouter();
  const authStatus = useRecoilValue(authStatusState);
  const setAlert = useSetRecoilState(alertState);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const usersData = useRecoilValue(usersDataState);
  const [authorUid, setAuthorUid] = useState<string | null>(null);
  const { getExtraUserDataByDisplayId, isLoading: isExtraUserDataLoading } =
    useGetExtraUserDataByDisplayId();

  const [folders, setFolders] = useRecoilState(foldersState(authorUid || ""));
  const { getFolders, isLoading: isFolderLoading } = useGetFolders();
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);

  // 폴더 주인의 유저데이터
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } else if (!displayId || isExtraUserDataLoading || authorUid) {
      return;
    }

    // usersData에서 폴더 주인 데이터 탐색
    const users = Object.entries(usersData);
    const curUserIndex = users.findIndex(
      ([id, userData]) => userData.displayId === displayId,
    );

    // 못찾았으면 서버에 요청
    if (curUserIndex === -1) {
      (async () => {
        const extraUserData = await getExtraUserDataByDisplayId({
          displayId,
        });
        if (extraUserData?.data) {
          setAuthorUid(extraUserData.data.uid);
        } else {
          // extraUserData 없으면 홈으로
          replace("/");
        }
      })();
      // 찾았으면 할당
    } else {
      const [curUid] = users[curUserIndex];
      setAuthorUid(curUid);
    }
  }, [
    authorUid,
    displayId,
    getExtraUserDataByDisplayId,
    isExtraUserDataLoading,
    replace,
    usersData,
  ]);

  // 폴더 목록 초기화
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } else if (isFolderLoading) return;

    // 현재 폴더 주인의 폴더 목록 데이터가 없지만 uid는 있다면
    if (!folders && authorUid) {
      // db에서 해당 유저의 폴더 목록 데이터 불러오기
      (async () => {
        await getFolders({ uid: authorUid })
          .then((folders) => {
            // 폴더 목록 데이터가 존재하지 않거나 불러온 폴더의 uid와 현재 갖고 있는 uid가 일치하지 않으면
            if (
              !folders ||
              folders.length <= 0 ||
              folders[0].uid !== authorUid
            ) {
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
  }, [authorUid, folders, getFolders, isFolderLoading, replace, setFolders]);

  // 현재 폴더 초기화(폴더 목록에서 현재 폴더 찾기)
  useEffect(() => {
    // 폴더 목록이 없으면 돌아간다.
    if (!folders) return;

    // 폴더 목록에서 폴더이름과 uid가 일치하는 폴더 찾기
    const curFolder = folders.find(
      (folder) => folder.name === folderName && folder.uid === authorUid,
    );

    if (!curFolder) {
      replace(`/${displayId}`);
      return;
    }

    // 현재 폴더 상태 업데이트
    setCurrentFolder(curFolder);
  }, [displayId, folderName, folders, replace, authorUid]);

  const onDeleteFolderClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      !currentFolder ||
      authStatus.status !== "signedIn" ||
      authStatus.data!.uid !== currentFolder.uid ||
      !authorUid
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

    const docRef = doc(db, "users", authorUid, "folders", currentFolder.id);
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
    <div className="bg-ebony-clay-50 relative h-full">
      {currentFolder && (
        <div className="flex h-full flex-col">
          <div className="border-ebony-clay-950 flex min-h-20 items-center border-b p-4 pl-10">
            <h2 className="text-ebony-clay-700 text-2xl font-semibold">
              {currentFolder.name}
            </h2>
            {authStatus.data?.uid === currentFolder.uid && (
              <div className="flex shrink-0 grow justify-end gap-2">
                <Button onClick={onFolderEditClick}>
                  <div className="text-xs">폴더 수정</div>
                </Button>
                <Button onClick={onDeleteFolderClick}>
                  <div className="text-xs">폴더 삭제</div>
                </Button>
              </div>
            )}
          </div>
          <SavedImageList
            type={"user-saved-" + authorUid + "-" + currentFolder.id}
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
