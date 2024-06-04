import { MouseEvent, useEffect, useState } from "react";
import Button from "../Button";
import Modal from "../Modal";
import AddFolderModal from "./AddFolderModal";
import { useRecoilState, useRecoilValue } from "recoil";
import { authStatusState, foldersState } from "@/recoil/states";
import { Folder, Folders, UserData } from "@/types";
import Loading from "../Loading";
import SavedImageList from "../imageList/SavedImageList";
import SavedFolderList from "./SavedFolderList";
import useGetFolders from "@/hooks/useGetFolders";

const SavedTab = ({ pageUserData }: { pageUserData: UserData }) => {
  const authStatus = useRecoilValue(authStatusState);
  const { getFolders } = useGetFolders();
  const [folders, setFolders] = useRecoilState(foldersState(pageUserData.uid));
  const [showAddFolderModal, setShowAddFolderModal] = useState<boolean>(false);
  const [defaultFolder, setDefaultFolder] = useState<Folder | null>(null);
  const [customFolders, setCustomFolders] = useState<Folders>([]);

  // 폴더 데이터 불러오기(내 페이지가 아닐 때만)
  useEffect(() => {
    if (
      !folders &&
      (!authStatus.data || authStatus.data.uid !== pageUserData.uid)
    ) {
      (async () => {
        const folders = await getFolders(pageUserData.uid);
        setFolders(folders);
      })();
    }
  }, [authStatus.data, folders, getFolders, pageUserData.uid, setFolders]);

  // 기본 폴더와 커스텀 폴더를 구분하여 상태에 저장
  useEffect(() => {
    if (!folders) return;

    const customFolders = [] as Folders;

    folders.forEach((folder) => {
      if (folder.id === "_DEFAULT") {
        setDefaultFolder(folder);
      } else {
        customFolders.push(folder);
      }
    });

    setCustomFolders(customFolders);
  }, [folders]);

  const onAddFolderClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddFolderModal((prev) => !prev);
  };

  const closeModal = () => {
    setShowAddFolderModal(false);
  };

  return (
    <div>
      <ul className="">
        {defaultFolder && (
          <SavedImageList
            type={"user-saved-" + pageUserData.uid + "-" + "_DEFAULT"}
            folder={defaultFolder}
          />
        )}
      </ul>
      <ul className="sticky bottom-0 border-2 bg-shark-50">
        <div className="flex items-center justify-between px-12 pt-4 xs:px-8">
          <h4 className="font-semibold text-shark-950">폴더 목록</h4>
          <div className="text-xs">
            {authStatus.data && authStatus.data.uid === pageUserData.uid && (
              <Button onClick={onAddFolderClick}>
                <div>폴더 생성</div>
              </Button>
            )}
          </div>
        </div>
        {folders == null ? (
          <Loading />
        ) : customFolders.length <= 0 ? (
          <p>폴더 없음</p>
        ) : (
          <SavedFolderList
            folders={customFolders}
            pageUserData={pageUserData}
          />
        )}
      </ul>
      {showAddFolderModal && (
        <Modal close={closeModal} title="폴더 생성">
          <AddFolderModal closeModal={closeModal} pageUserData={pageUserData} />
        </Modal>
      )}
    </div>
  );
};

export default SavedTab;
