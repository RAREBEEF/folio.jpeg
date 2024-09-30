import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import { ref } from "firebase/storage";
import { ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";
import exifr from "exifr";
import { ImageMetadata } from "@/types";
import { useSetRecoilState } from "recoil";
import { alertsState } from "@/recoil/states";
import { uniqueId } from "lodash";

const calcShutterSpeed = (shutterSpeedValue: number) => {
  const exposureTime = Math.pow(2, -shutterSpeedValue);
  const shutterSpeed = 1 / (1 / exposureTime);

  if (shutterSpeed >= 1) {
    return Math.round(shutterSpeed).toString();
  } else {
    const numerator = 1;
    const denominator = Math.round(1 / exposureTime);
    return `${numerator}/${denominator}`;
  }
};

/**
 * 이미지를 스토리지에 업로드하고 다운로드 URL을 포함한 이미지 데이터를 반환하는 비동기 함수 (를 반환하는 커스텀훅)
 */
const usePostImageFile = () => {
  const setAlert = useSetRecoilState(alertsState);
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isInputUploading, setIsInputUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [originFile, setOriginFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");
  const [originPreviewURL, setOriginPreviewURL] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [originalName, setOriginalName] = useState<string>("");
  const [byte, setByte] = useState<number>(0);
  const [originByte, setOriginByte] = useState<number>(0);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [originSize, setOriginSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const [error, setError] = useState<unknown>(null);
  const [imgMetaData, setImgMetaData] = useState<ImageMetadata>({
    make: null,
    model: null,
    lensMake: null,
    lensModel: null,
    shutterSpeed: null,
    fNumber: null,
    ISO: null,
    focalLength: null,
    createDate: null,
  });

  // 첨부파일 리셋 함수
  const onResetAllField = () => {
    setFile(null);
    setOriginFile(null);
    setPreviewURL("");
    setOriginPreviewURL("");
    setId("");
    setFileName("");
    setOriginalName("");
    setByte(0);
    setOriginByte(0);
    setSize({ width: 0, height: 0 });
    setOriginSize({ width: 0, height: 0 });
    setError(null);
    setImgMetaData({
      make: null,
      model: null,
      lensMake: null,
      lensModel: null,
      shutterSpeed: null,
      fNumber: null,
      ISO: null,
      focalLength: null,
      createDate: null,
    });
  };

  // 첨부파일 선택
  const onFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList || fileList.length === 0) return;
    setIsInputUploading(true);

    onResetAllField();

    // 원본 이미지 데이터 저장
    setOriginFile(fileList[0]);
    setOriginByte(fileList[0].size);
    setOriginalName(fileList[0].name);

    // 메타데이터
    const exifData = await exifr.parse(fileList[0]);
    setImgMetaData({
      make: exifData?.Make || null,
      model: exifData?.Model || null,
      lensMake: exifData?.LensMake || null,
      lensModel: exifData?.LensModel || null,
      shutterSpeed: exifData?.ShutterSpeedValue
        ? `${calcShutterSpeed(exifData?.ShutterSpeedValue)}s`
        : null,
      fNumber: `f/${exifData?.FNumber}` || null,
      ISO: exifData?.ISO || null,
      focalLength: `${exifData?.FocalLength}mm` || null,
      createDate:
        `${new Date(exifData.CreateDate).toLocaleString("en-US")}` || null,
    });

    // 미리보기 이미지 경로
    const previewImg = new Image();
    const _URL = window.URL || window.webkitURL;
    const objectURL = _URL.createObjectURL(fileList[0]);

    // 미리보기 이미지 로드
    previewImg.onload = () => {
      // 최소 사이즈 미달
      if (previewImg.width < 50 || previewImg.height < 50) {
        onResetAllField();
        setError("fileSize");
        setAlert((prev) => [
          ...prev,
          {
            id: uniqueId(),
            type: "warning",
            text: "이미지의 최소 사이즈는 50*50 입니다.",
            show: true,
            createdAt: Date.now(),
          },
        ]);
      } else {
        setOriginSize({ width: previewImg.width, height: previewImg.height });
        setOriginPreviewURL(objectURL);
      }
    };
    previewImg.src = objectURL;

    onSelectImage(fileList[0]);
  };

  // 이미지 편집 리셋
  const resetImg = () => {
    if (!originFile) {
      return;
    }
    onSelectImage(originFile);
  };

  // 이미지 압축
  const compressor = async ({ targetImage }: { targetImage: File }) => {
    const compressedImage = await imageCompression(targetImage, {
      maxSizeMB: 10,
      useWebWorker: false,
      fileType: "image/webp",
    });
    return compressedImage;
  };

  /**
   * 이미지가 변경될 때(input될 때 혹은 크롭될 때) 처리할 내용
   * */
  const onSelectImage = async (file: File) => {
    if (!file) return;

    // 파일 형식 체크
    const fileType = file.type.replace("image/", "");
    if (!["jpg", "jpeg", "gif", "webp", "png"].includes(fileType)) {
      onResetAllField();
      setError("fileType");
      setIsInputUploading(false);
      setAlert((prev) => [
        ...prev,
        {
          id: uniqueId(),
          type: "warning",
          text: "유효하지 않은 파일 형식입니다.",
          show: true,
          createdAt: Date.now(),
        },
      ]);
      return;
    }

    // 스토리지에 중복된 파일명을 방지하기 위해 해시 id를 생성하고 id를 파일명으로 사용
    const id = uuidv4();
    setId(id);
    setFileName(id + "." + fileType);
    // }

    // 미리보기 이미지 경로
    const previewImg = new Image();
    const _URL = window.URL || window.webkitURL;
    const objectURL = _URL.createObjectURL(file);

    // 미리보기 이미지 로드
    previewImg.onload = () => {
      // 최소 사이즈 미달
      if (previewImg.width < 50 || previewImg.height < 50) {
        onResetAllField();
        setError("fileSize");
        setIsInputUploading(false);
        setAlert((prev) => [
          ...prev,
          {
            id: uniqueId(),
            type: "warning",
            text: "이미지의 최소 사이즈는 50*50 입니다.",
            show: true,
            createdAt: Date.now(),
          },
        ]);
      }

      setSize({ width: previewImg.width, height: previewImg.height });
      setPreviewURL(objectURL);
      setFile(file);
      setByte(file.size);
      setIsInputUploading(false);
    };
    previewImg.src = objectURL;
  };

  /**
   * 이미지를 스토리지에 업로드하고 다운로드URL을 포함한 이미지 데이터를 반환하는 비동기 함수
   * */
  const postImageFileAsync = async ({
    uid,
    fileName,
    img,
  }: {
    uid: string;
    fileName: string;
    img: File;
  }): Promise<string | null> => {
    console.log("useSetImageFile");
    // 업로드
    const storage = getStorage();
    const storageRef = ref(storage, `images/${uid}/${fileName}`);
    const downloadURL = await uploadBytes(storageRef, img).then(async () => {
      return await getDownloadURL(storageRef);
    });

    return downloadURL;
  };

  const postImageFile = async ({
    uid,
    fileName,
    img,
  }: {
    uid: string;
    fileName: string;
    img: File;
  }) => {
    if (error) return null;
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: postImageFileAsync,
        args: {
          uid,
          fileName,
          img,
        },
      });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isInputUploading,
    isLoading,
    postImageFile,
    onFileSelect,
    onResetAllField,
    error,
    onSelectImage,
    resetImg,
    compressor,
    data: {
      id,
      file,
      previewURL,
      fileName,
      byte,
      size,
      originFile,
      originPreviewURL,
      originalName,
      originSize,
      originByte,
      imgMetaData,
    },
  };
};

export default usePostImageFile;
