import { alertsState, authStatusState } from "@/recoil/states";
import { ImageData } from "@/types";
import { uniqueId } from "lodash";
import { useRecoilValue, useSetRecoilState } from "recoil";

const useUploadValidCheck = () => {
  const authStatus = useRecoilValue(authStatusState);
  const setAlerts = useSetRecoilState(alertsState);

  const uploadValidCheck = ({
    isEdit,
    isEditing,
    isInputUploading,
    error,
    file,
    imageData,
    title,
    desc,
    cameraModel,
    lensModel,
    shutterSpeed,
    ISO,
    fNumber,
    focalLength,
    id,
    size,
    byte,
    fileName,
    originalName,
  }: {
    isEdit: boolean;
    isEditing: boolean;
    isInputUploading: boolean;
    error: unknown;
    file: File | null;
    imageData: ImageData | null;
    title: string;
    desc: string;
    cameraModel: string;
    lensModel: string;
    shutterSpeed: string;
    ISO: string;
    fNumber: string;
    focalLength: string;
    id: string;
    size: {
      width: number;
      height: number;
    };
    byte: number;
    fileName: string;
    originalName: string;
  }) => {
    if (isEdit && isEditing) {
      return false;
    } else if (error !== null) {
      switch (error) {
        case "fileType":
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              text: "유효하지 않은 파일 형식입니다.",
              createdAt: Date.now(),
              type: "warning",
              show: true,
            },
          ]);
        case "fileSize":
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              text: "이미지의 최소 사이즈는 50*50 입니다.",
              createdAt: Date.now(),
              type: "warning",
              show: true,
            },
          ]);
          return false;
        default:
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              createdAt: Date.now(),
              type: "warning",
              show: true,
              text: "이미지 업로드 중 문제가 발생하였습니다.",
            },
          ]);
          return false;
      }
    } else if (authStatus.status !== "signedIn" || !authStatus.data) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "로그인 후 다시 시도해 주세요.",
        },
      ]);
      return false;
    } else if (isInputUploading) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "이미지 압축 및 변환 중입니다.",
        },
      ]);
      return false;
    } else if (!isEdit && !file) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "이미지를 첨부해 주세요.",
        },
      ]);
      return false;
    } else if (isEdit) {
      if (!imageData) {
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            createdAt: Date.now(),
            type: "warning",
            show: true,
            text: "수정할 이미지가 존재하지 않습니다.",
          },
        ]);
        return false;
      } else if (authStatus.data?.uid !== imageData.uid) {
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            createdAt: Date.now(),
            type: "warning",
            show: true,
            text: "이미지를 수정할 권한이 없습니다.",
          },
        ]);
        return false;
      } else if (
        title.trim() === imageData.title &&
        desc.trim() === imageData.description &&
        cameraModel === imageData.metadata.model &&
        lensModel === imageData.metadata.lensModel &&
        shutterSpeed === imageData.metadata.shutterSpeed &&
        ISO === imageData.metadata.ISO?.toString() &&
        fNumber === imageData.metadata.fNumber?.toString() &&
        focalLength === imageData.metadata.focalLength?.toString()
      ) {
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            createdAt: Date.now(),
            type: "warning",
            show: true,
            text: "변경 사항이 존재하지 않습니다.",
          },
        ]);
        return false;
      }
    } else {
      if (!id || !size || !byte || !fileName || !originalName) {
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            createdAt: Date.now(),
            type: "warning",
            show: true,
            text: "이미지 데이터를 불러오는 중 문제가 발생하였습니다.",
          },
        ]);
        return false;
      }
    }

    return true;
  };

  return { uploadValidCheck };
};

export default useUploadValidCheck;
