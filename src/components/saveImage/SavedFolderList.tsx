import { Folders, UserData } from "@/types";
import SavedFolderThumbnail from "./SavedFolderThumbnail";
import Link from "next/link";

const SavedFolderList = ({
  folders,
  userData,
}: {
  folders: Folders;
  userData: UserData;
}) => {
  return (
    <ul className="m-auto flex gap-12 overflow-scroll px-8 py-4">
      {folders.map((folder, i) => (
        <li key={i} className="min-w-[150px]">
          <Link
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
