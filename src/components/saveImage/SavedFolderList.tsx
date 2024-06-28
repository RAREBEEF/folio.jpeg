import { Folders, UserData } from "@/types";
import SavedFolderThumbnail from "./SavedFolderThumbnail";
import Link from "next/link";
import { MouseEvent } from "react";

const SavedFolderList = ({
  folders,
  userData,
}: {
  folders: Folders;
  userData: UserData;
}) => {
  // 폴더 클릭 시 현재 보고있는 유저 페이지의 uid를 스토리지에 저장
  // 폴더 디테일 페이지에서 uid가 필요하기 때문
  const storePageUid = (e: MouseEvent<HTMLAnchorElement>) => {
    sessionStorage.setItem("curpi", userData.uid);
  };

  return (
    <ul className="m-auto flex gap-12 overflow-scroll px-8 py-4">
      {folders.map((folder, i) => (
        <li key={i} className="min-w-[150px]">
          <Link
            onClick={storePageUid}
            href={`/${userData.displayId}/${folder.name.replaceAll(" ", "-")}`} // 폴더명의 공백은 -로 치환
          >
            <SavedFolderThumbnail folder={folder} />
            <div>
              <div className="mt-2 text-lg font-semibold text-shark-700">
                {folder.name}
              </div>
              <div className="text-xs text-shark-500">
                이미지 {folder.images.length}장
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SavedFolderList;
