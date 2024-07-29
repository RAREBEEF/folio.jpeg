import { ChangeEvent, useEffect, useMemo, useState } from "react";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";
import { Folders, ImageDataPages, ImageData } from "@/types";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertsState,
  authStatusState,
  foldersState,
  gridImageIdsState,
  imageDataPagesState,
  loginModalState,
  saveModalState,
} from "@/recoil/states";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import useImagePopularity from "./useImagePopularity";
import _, { uniqueId } from "lodash";

const useSave = ({ imageData }: { imageData: ImageData | null }) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const setAlerts = useSetRecoilState(alertsState);
  const setLoginModal = useSetRecoilState(loginModalState);
  const [saveModal, setSaveModal] = useRecoilState(saveModalState);
  const savedFolder = useMemo(
    () => saveModal.imageSavedFolder,
    [saveModal.imageSavedFolder],
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    savedFolder?.id || "",
  );
  const showErrorAlert = useErrorAlert();
  const { fetchWithRetry } = useFetchWithRetry();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const { adjustPopularity } = useImagePopularity({
    imageId: imageData?.id || "",
  });
  const [folders, setFolders] = useRecoilState(
    foldersState(authStatus.data?.uid || ""),
  );
  const [defaultFolderImagePage, setDefaultFolderImagePage] = useRecoilState(
    imageDataPagesState(
      "user-saved-" + (authStatus.data?.uid || "") + "-" + "_DEFAULT",
    ),
  );
  const [defaultFolderGridImageIds, setDefaultFolderGridImageIds] =
    useRecoilState(
      gridImageIdsState(
        "user-saved-" + (authStatus.data?.uid || "") + "-" + "_DEFAULT",
      ),
    );
  const [prevFolderImagePage, setPrevFolderImagePage] = useRecoilState(
    imageDataPagesState(
      "user-saved-" +
        (authStatus.data?.uid || "") +
        "-" +
        (savedFolder?.id || ""),
    ),
  );
  const [prevFolderGridImageIds, setPrevFolderGridImageIds] = useRecoilState(
    gridImageIdsState(
      "user-saved-" +
        (authStatus.data?.uid || "") +
        "-" +
        (savedFolder?.id || ""),
    ),
  );
  const [selectedFolderImagePage, setSelectedFolderImagePage] = useRecoilState(
    imageDataPagesState(
      "user-saved-" + (authStatus.data?.uid || "") + "-" + selectedFolderId,
    ),
  );
  const [selectedFolderGridImageIds, setSelectedFolderGridImageIds] =
    useRecoilState(
      gridImageIdsState(
        "user-saved-" + (authStatus.data?.uid || "") + "-" + selectedFolderId,
      ),
    );

  const saveAsync = async () => {
    console.log("useSave");
    if (authStatus.status !== "signedIn" || !authStatus.data) {
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
      return;
    } else if (!folders || !authStatus.data || !imageData) {
      return;
    }
    // 이미 저장된 이미지인지 체크
    const targetId = imageData.id;

    for (const folder of folders) {
      const { images } = folder;

      const targetIndex = images.findIndex((id) => id === targetId);

      // 이미 저장된 이미지는 저장관리 모달을 띄우고 리스너 종료
      if (targetIndex !== -1) {
        setSaveModal({
          show: true,
          image: imageData,
          imageSavedFolder: folder,
        });
        return;
      }
    }

    // 아직 저장이 안된 이미지는 기본 폴더에 이미지 저장
    const uid = authStatus.data.uid;
    const updatedAt = Date.now();
    const defaultFolderIndex = folders.findIndex(
      (folder) => folder.id === "_DEFAULT",
    );
    const defaultFolder = folders[defaultFolderIndex];

    // 이전 상태 백업
    let prevFolders = [...folders];
    let prevDefaultFolderImagePage: ImageDataPages;
    let prevDefaultFolderGridImageIds: Array<string>;

    // 폴더 상태 업데이트
    const newImages = [...defaultFolder.images, imageData.id];
    const newFolders = [...folders];
    newFolders.splice(defaultFolderIndex, 1, {
      ...defaultFolder,
      updatedAt,
      images: newImages,
    });
    setFolders(newFolders);
    setDefaultFolderImagePage((prev) => {
      prevDefaultFolderImagePage = prev; // 이전 상태
      const newImagePage = _.cloneDeep(prev);

      if (newImagePage.length <= 0) {
        return [[imageData]];
      } else {
        newImagePage[0].unshift(imageData);
        return newImagePage;
      }
    });
    setDefaultFolderGridImageIds((prev) => {
      prevDefaultFolderGridImageIds = prev; // 이전 상태
      const newIds = _.cloneDeep(prev);
      newIds.unshift(imageData.id);
      return newIds;
    });

    // db 업데이트
    const docRef = doc(db, "users", uid, "folders", "_DEFAULT");
    await updateDoc(docRef, { images: newImages, updatedAt })
      .catch((error) => {
        // 에러 시 백업 상태로 롤백
        setFolders(prevFolders);
        setDefaultFolderImagePage(prevDefaultFolderImagePage);
        setDefaultFolderGridImageIds(prevDefaultFolderGridImageIds);
      })
      .then(async () => {
        if (authStatus.data && imageData.uid !== authStatus.data.uid) {
          await adjustPopularity(2);
        }
        // 저장 완료 알림 띄우기
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "저장되었습니다.",
          },
        ]);
      });
  };

  const unsaveAsync = async () => {
    console.log("useSave");
    if (!folders || !savedFolder || !imageData || !authStatus.data) return;

    const uid = authStatus.data.uid;
    const imageId = imageData.id;
    const folderId = savedFolder.id;
    const updatedAt = Date.now();

    // 이전 상태 백업
    let prevFolders: Folders;
    let prevFolderImagePage: ImageDataPages;
    let prevFolderGridImageIds: Array<string>;

    // 폴더 상태 업데이트
    setFolders((prev) => {
      if (!prev) return [];

      prevFolders = prev;
      const newFolders = _.cloneDeep(prev);

      const targetFolderIndex = newFolders.findIndex(
        (folder) => folder.id === folderId,
      );

      if (targetFolderIndex == -1) return prev;

      const targetFolder = newFolders[targetFolderIndex];
      const prevImages = newFolders[targetFolderIndex].images;

      targetFolder.images = prevImages.filter((id) => id !== imageId);

      return newFolders;
    });
    setPrevFolderImagePage((prev) => {
      prevFolderImagePage = prev;

      const newCustomFolderImagePage = _.cloneDeep(prev);

      for (let page = 0; page <= newCustomFolderImagePage.length; page++) {
        const images = newCustomFolderImagePage[page];
        for (let i = 0; i <= images.length; i++) {
          const image = images[i];
          if (image.id === imageId) {
            newCustomFolderImagePage[page].splice(i, 1);
            return newCustomFolderImagePage;
          }
        }
      }

      return newCustomFolderImagePage;
    });
    setPrevFolderGridImageIds((prev) => {
      prevFolderGridImageIds = prev;
      const newCustomFolderGridImageIds = _.cloneDeep(prev);
      return newCustomFolderGridImageIds.filter((id) => id !== imageId);
    });

    const docRef = doc(db, "users", uid, "folders", folderId);
    await updateDoc(docRef, { images: arrayRemove(imageId), updatedAt })
      .then(async () => {
        await adjustPopularity(-2);
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "저장 목록에서 삭제되었습니다.",
          },
        ]);
        setSaveModal({ show: false, image: null, imageSavedFolder: null });
      })
      .catch((error) => {
        // 에러 시 백업 상태로 롤백
        setFolders(prevFolders);
        setPrevFolderImagePage(prevFolderImagePage);
        setPrevFolderGridImageIds(prevFolderGridImageIds);
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "warning",
            createdAt: Date.now(),
            text: "목록 업데이트 중 문제가 발생했습니다.",
          },
        ]);
      });
  };

  const changeFolderAsync = async () => {
    console.log("useSave");
    if (
      !folders ||
      !savedFolder ||
      !authStatus.data ||
      savedFolder.id === selectedFolderId ||
      !imageData
    )
      return;

    const uid = authStatus.data.uid;
    const imageId = imageData.id;
    const prevFolderId = savedFolder.id;
    const updatedAt = Date.now();

    // 이전 상태 백업
    let prevFolders: Folders;
    let prevFolderImagePage: ImageDataPages;
    let prevFolderGridImageIds: Array<string>;
    let selectedFolderImagePage: ImageDataPages;
    let selectedFolderGridImageIds: Array<string>;

    // 폴더 상태 업데이트
    // 이전 폴더에서 이미지 삭제 후 선택한 폴더에 이미지 추가
    setFolders((prev) => {
      if (!prev) return [];

      prevFolders = prev;
      const newFolders = _.cloneDeep(prev);

      const prevFolderIndex = newFolders.findIndex(
        (folder) => folder.id === prevFolderId,
      );
      const selectedFolderIndex = newFolders.findIndex(
        (folder) => folder.id === selectedFolderId,
      );

      if (prevFolderIndex === -1 || selectedFolderIndex === -1) return prev;

      const prevFolder = newFolders[prevFolderIndex];
      const prevFolderImages = prevFolder.images;
      prevFolder.images = prevFolderImages.filter((id) => id !== imageId);

      const selectedFolder = newFolders[selectedFolderIndex];
      const selectedFolderImages = [...selectedFolder.images, imageId];

      selectedFolder.images = selectedFolderImages;

      return newFolders;
    });
    // 이전 폴더의 상태 업데이트
    // 이전 폴더의 이미지 목록에서 삭제
    setPrevFolderImagePage((prev) => {
      prevFolderImagePage = prev;

      const newFolderImagePage = _.cloneDeep(prev);

      for (let page = 0; page <= newFolderImagePage.length; page++) {
        const images = newFolderImagePage[page];
        if (!images) {
          return prev;
        }
        for (let i = 0; i <= images.length; i++) {
          const image = images[i];
          if (image.id === imageId) {
            newFolderImagePage[page].splice(i, 1);
            return newFolderImagePage;
          }
        }
      }

      return newFolderImagePage;
    });
    // 이전 폴더의 이미지 id 목록에서 id 삭제
    setPrevFolderGridImageIds((prev) => {
      prevFolderGridImageIds = prev;
      const newFolderGridImageIds = _.cloneDeep(prev);
      return newFolderGridImageIds.filter((id) => id !== imageId);
    });

    // 새로 선택한 폴더의 이미지 목록에 추가
    setSelectedFolderImagePage((prev) => {
      selectedFolderImagePage = prev; // 이전 상태
      const newImagePage = _.cloneDeep(prev);

      if (newImagePage.length <= 0) {
        return [[imageData]];
      } else {
        newImagePage[0].push(imageData);
        return newImagePage;
      }
    });
    // 새로 선택한 폴더의 이미지 id 목록에 추가
    setSelectedFolderGridImageIds((prev) => {
      selectedFolderGridImageIds = prev; // 이전 상태
      const newIds = _.cloneDeep(prev);
      newIds.push(imageData.id);
      return newIds;
    });

    // db 업데이트
    const prevFolderDocRef = doc(db, "users", uid, "folders", prevFolderId);
    const selectedFolderDocRef = doc(
      db,
      "users",
      uid,
      "folders",
      selectedFolderId,
    );
    await Promise.all([
      updateDoc(prevFolderDocRef, { images: arrayRemove(imageId), updatedAt }),
      updateDoc(selectedFolderDocRef, {
        images: arrayUnion(imageId),
        updatedAt,
      }),
    ])
      .then(() => {
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "폴더가 변경되었습니다.",
          },
        ]);
        setSaveModal({ show: false, image: null, imageSavedFolder: null });
      })
      .catch((error) => {
        // 에러 시 백업 상태로 롤백
        setFolders(prevFolders);
        setPrevFolderImagePage(prevFolderImagePage);
        setPrevFolderGridImageIds(prevFolderGridImageIds);
        setSelectedFolderImagePage(selectedFolderImagePage);
        setSelectedFolderGridImageIds(selectedFolderGridImageIds);
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "warning",
            createdAt: Date.now(),
            text: "폴더 변경 중 문제가 발생했습니다.",
          },
        ]);
      });
  };

  const save = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await fetchWithRetry({ asyncFn: saveAsync });
    } catch (error) {
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  const unsave = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await fetchWithRetry({ asyncFn: unsaveAsync });
    } catch (error) {
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  const changeFolder = async () => {
    if (isLoading) return;

    try {
      await fetchWithRetry({ asyncFn: changeFolderAsync });
    } catch (error) {
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  // 해당 이미지가 이미 저장되었는지 여부 확인
  // 저장 여부는 각 버튼의 ui를 관리하기 때문에
  // recoil과는 별도로 이미지 그리드 아이템마다 별도로 관리되는 로컬 상태로 구분
  useEffect(() => {
    if (!folders || !authStatus.data || !imageData) {
      setIsSaved(false);
      return;
    }

    const targetId = imageData.id;

    for (const folder of folders) {
      const { images } = folder;

      const targetIndex = images.findIndex((id) => id === targetId);

      if (targetIndex !== -1) {
        setIsSaved(true);
        return;
      }
    }

    setIsSaved(false);
  }, [authStatus.data, folders, imageData]);

  const onSelectedFolderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedFolderId(e.target.value);
  };

  return {
    isLoading,
    isSaved,
    save,
    unsave,
    changeFolder,
    onSelectedFolderChange,
    selectedFolderId,
  };
};

export default useSave;
