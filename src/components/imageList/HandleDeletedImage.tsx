import { db } from "@/fb";
import { Folder } from "@/types";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";

/* 저장된 이미지의 로딩이 모두 끝나면 존재하지 않는 이미지의 id를 추려서 삭제한다. */
/* 이러한 처리는 백엔드에서 하는게 좋겠지만 당장은 구현이 힘드니 여기에 임시로 구현한다.  */
const HandleDeletedImage = ({
  folder,
  loadedImgIds,
}: {
  folder: Folder;
  loadedImgIds: Array<string>;
}) => {
  useEffect(() => {
    if (!folder) return;
    const notFonundImgIds = folder.images.filter(
      (id) => !loadedImgIds.includes(id),
    );
    if (notFonundImgIds.length <= 0) return;
    (async () => {
      const docRef = doc(db, "users", folder.uid, "folders", folder.id);
      await updateDoc(docRef, {
        images: arrayRemove(...notFonundImgIds),
      }).catch((error) => {});
    })();
  }, [loadedImgIds, folder]);

  return null;
};

export default HandleDeletedImage;
