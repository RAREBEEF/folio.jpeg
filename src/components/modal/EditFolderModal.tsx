"use client";

import { ChangeEvent, KeyboardEvent, MouseEvent, useState } from "react";
import Button from "../Button";
import useInput from "@/hooks/useInput";
import Loading from "@/components/loading/Loading";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { alertsState, authStatusState, foldersState } from "@/recoil/states";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import { Folder, Folders, UserData } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { uniqueId } from "lodash";

const EditFolderModal = ({
  userData,
  closeModal,
  currentFolder,
}: {
  userData: UserData;
  closeModal: Function;
  currentFolder: Folder;
}) => {
  const { replace } = useRouter();
  const authStatus = useRecoilValue(authStatusState);
  const [folders, setFolders] = useRecoilState(
    foldersState(authStatus.data!.uid),
  );
  const setAlerts = useSetRecoilState(alertsState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { value: name, onChange: onNameChange } = useInput(currentFolder.name);
  const [isPrivate, setIsPrivate] = useState<"true" | "false">(
    `${currentFolder.isPrivate}`,
  );

  // 공개 여부 input change 이벤트
  const onIsPrivateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPrivate(e.target.value as "true" | "false");
  };

  // 폴더 추가
  const onAddFolder = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const hasPermission =
      authStatus.status === "signedIn" && authStatus.data.uid === userData.uid;
    const invalidName = name.includes("-") || name.includes("/");
    const nameChanged = currentFolder.name !== name;
    const privateChanged = `${currentFolder.isPrivate}` !== isPrivate;
    const noChanged = !nameChanged && !privateChanged;
    const duplicatedName =
      folders?.filter((folder) => folder.name === name).length !== 0;

    // 현재 로딩중일 경우 리턴
    if (isLoading) {
      return;
      // 인증 상태가 유효하지 않으면
    } else if (!hasPermission) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "폴더 수정 권한이 없습니다.",
        },
      ]);
      return;
      // 폴더명 입력은 필수
    } else if (!name) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "폴더명을 입력해 주세요.",
        },
      ]);
      return;
      // 사용 불가능한 문자 필터링
    } else if (invalidName) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "폴더명에 사용할 수 없는 문자가 포함되어 있습니다. (-,/)",
        },
      ]);
      return;
    } else if (noChanged) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "변경사항이 존재하지 않습니다.",
        },
      ]);
      return;
    }
    // 폴더명은 중복될 수 없다.
    else if (duplicatedName) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "중복된 폴더명입니다.",
        },
      ]);
      return;
    }

    // 모든 데이터가 유효하면 생성 시작
    setIsLoading(true);

    const uid = authStatus.data.uid;
    const now = Date.now();

    const newFolder = {
      ...currentFolder,
      isPrivate: isPrivate === "true" ? true : false,
      name,
      updatedAt: now,
    };

    (async () => {
      const docRef = doc(db, "users", uid, "folders", currentFolder.id);

      // 이전 상태 백업
      let prevFolders: Folders | null = folders;

      try {
        // 상태 업데이트
        setFolders((prev) => {
          if (!prev) {
            return [newFolder];
          } else {
            return [
              newFolder,
              ...prev.filter((folder) => folder.id !== currentFolder.id),
            ];
          }
        });

        // db에 폴더 데이터 추가
        await updateDoc(docRef, newFolder);
        closeModal();
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "폴더 수정이 완료되었습니다.",
          },
        ]);

        nameChanged &&
          replace(`/${userData.displayId}/${name.replaceAll(" ", "-")}`);
      } catch (error) {
        // 에러 시 백업 상태로 롤백
        setFolders(prevFolders);
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "warning",
            createdAt: Date.now(),
            text: "폴더 수정 중 문제가 발생하였습니다.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  // 사용 금지 문자 입력 제한
  const restrictingInputChar = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "/" || e.key === "-") e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-8 px-6 pb-6 pt-8">
      <label>
        <h3 className="pb-1 font-semibold">폴더명</h3>
        <input
          className="w-full rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none"
          type="text"
          value={name}
          onChange={onNameChange}
          onKeyDown={restrictingInputChar}
          maxLength={20}
        />
      </label>
      <div>
        <h3 className="pb-1 font-semibold">공개 여부</h3>
        <div className="ml-2 flex gap-8">
          <label className="inline-flex gap-1">
            <input
              onChange={onIsPrivateChange}
              checked={isPrivate === "false"}
              type="radio"
              value="false"
              name="isPrivate"
            />
            공개
          </label>
          <label className="inline-flex gap-1">
            <input
              onChange={onIsPrivateChange}
              checked={isPrivate === "true"}
              type="radio"
              value="true"
              name="isPrivate"
            />
            비공개
          </label>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={onAddFolder} disabled={isLoading}>
          <div>{isLoading ? <Loading height="24px" /> : "수정 완료"}</div>
        </Button>
      </div>
    </div>
  );
};

export default EditFolderModal;
