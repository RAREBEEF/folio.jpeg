import { MouseEvent, useEffect, useRef, useState } from "react";
import Button from "../Button";
import Modal from "@/components/modal/Modal";
import AddFolderModal from "@/components/modal/AddFolderModal";
import { useRecoilState, useRecoilValue } from "recoil";
import { authStatusState, foldersState } from "@/recoil/states";
import { Folder, Folders, UserData } from "@/types";
import Loading from "@/components/loading/Loading";
import SavedImageList from "../imageList/SavedImageList";
import SavedFolderList from "./SavedFolderList";
import useGetFolders from "@/hooks/useGetFolders";

const SavedTab = ({ userData }: { userData: UserData }) => {
  const isInitialMount = useRef(true);
  const authStatus = useRecoilValue(authStatusState);
  const { getFolders } = useGetFolders();
  const [folders, setFolders] = useRecoilState(foldersState(userData.uid));
  const [showAddFolderModal, setShowAddFolderModal] = useState<boolean>(false);
  const [defaultFolder, setDefaultFolder] = useState<Folder | null>(null);
  const [customFolders, setCustomFolders] = useState<Folders>([]);

  // 폴더 데이터 불러오기(내 페이지가 아닐 때만)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } else if (
      !folders &&
      (!authStatus.data || authStatus.data.uid !== userData.uid)
    ) {
      (async () => {
        const folders = await getFolders({ uid: userData.uid });
        setFolders(folders);
      })();
    }
  }, [authStatus.data, folders, getFolders, userData.uid, setFolders]);

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
      <ul className="mt-4 border-y-2 pb-6">
        <div className="flex items-center justify-end px-8 pt-4">
          {/* <h4 className="text-lg font-semibold ">폴더 목록</h4> */}
          <div className="text-xs">
            {/* {authStatus.data && authStatus.data.uid === userData.uid && ( */}
            <Button onClick={onAddFolderClick}>
              <div>폴더 생성</div>
            </Button>
            {/* )} */}
          </div>
        </div>
        {folders == null ? (
          <Loading />
        ) : customFolders.length <= 0 ? (
          <div className="m-auto flex gap-12 overflow-scroll px-8 py-4">
            <div className="text-astronaut-500 flex min-h-[150px] w-full items-center justify-center text-sm">
              생성된 폴더가 없습니다.
            </div>
          </div>
        ) : (
          <SavedFolderList folders={customFolders} userData={userData} />
        )}
      </ul>
      {defaultFolder && (
        <ul className="mt-12">
          <h4 className="text-center text-lg font-semibold ">미분류 이미지</h4>
          <SavedImageList
            type={"user-saved-" + userData.uid + "-" + "_DEFAULT"}
            folder={defaultFolder}
          />
        </ul>
      )}
      {showAddFolderModal && (
        <Modal close={closeModal} title="폴더 생성">
          <AddFolderModal closeModal={closeModal} userData={userData} />
        </Modal>
      )}
    </div>
  );
};

export default SavedTab;
