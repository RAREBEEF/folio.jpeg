import XSvg from "@/icons/xmark-solid.svg";
import Button from "../Button";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { ChangeEvent, MouseEvent, useMemo, useState } from "react";
import _ from "lodash";
import { authStatusState, foldersState, saveModalState } from "@/recoil/states";
import Select from "../Select";
import useSave from "@/hooks/useSave";

const SaveMenu = () => {
  const [saveModal, setSaveModal] = useRecoilState(saveModalState);
  const savedFolder = useMemo(
    () => saveModal.imageSavedFolder,
    [saveModal.imageSavedFolder],
  );
  const imageData = useMemo(() => saveModal.image, [saveModal.image]);
  const { unsave, changeFolder, onSelectedFolderChange, selectedFolderId } =
    useSave({
      imageData,
    });

  const authStatus = useRecoilValue(authStatusState);
  const [folders, setFolders] = useRecoilState(
    foldersState(authStatus.data?.uid || ""),
  );

  // 저장 삭제 버튼 클릭
  const onUnsaveClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await unsave();
  };

  const onSaveChange = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await changeFolder();
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-2 p-8 pt-0 text-sm">
      <div className="flex grow items-center justify-center gap-2 text-center">
        {folders && (
          <Select onChange={onSelectedFolderChange} value={selectedFolderId}>
            {folders.map((folder, i) => (
              <option key={i} id={folder.id} value={folder.id}>
                {folder.name === "_DEFAULT" ? "미분류" : folder.name}
              </option>
            ))}
          </Select>
        )}
        <Button
          disabled={!savedFolder || savedFolder.id === selectedFolderId}
          onClick={onSaveChange}
        >
          <div>폴더 변경</div>
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

export default SaveMenu;
