import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import { ref } from "firebase/storage";
import { ChangeEvent, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";
import exifr from "exifr";
import { ImageMetadata } from "@/types";

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
 * 이미지를 스토리지에 업로드하고 다운로드URL을 포함한 이미지 데이터를 반환하는 비동기 함수 (를 반환하는 커스텀훅)
 */
const usePostImageFile = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isInputUploading, setIsInputUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [originalName, setOriginalName] = useState<string>("");
  const [byte, setByte] = useState<number>(0);
  const [size, setSize] = useState<{ width: number; height: number }>({
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
  });

  // 이미지 압축
  const compressor = async ({ targetImage }: { targetImage: File }) => {
    const compressedImage = await imageCompression(targetImage, {
      maxSizeMB: 10,
      useWebWorker: false,
    });
    return compressedImage;
  };

  // 첨부파일 선택
  const onFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList || fileList.length === 0) return;

    // 상태 초기화
    reset();

    const exifData = await exifr.parse(fileList[0]);

    setImgMetaData({
      make: exifData?.Make || null,
      model: exifData?.Model || null,
      lensMake: exifData?.LensMake || null,
      lensModel: exifData?.LensModel || null,
      shutterSpeed: exifData?.ShutterSpeedValue
        ? calcShutterSpeed(exifData?.ShutterSpeedValue)
        : null,
      fNumber: exifData?.FNumber || null,
      ISO: exifData?.ISO || null,
      focalLength: exifData?.FocalLength || null,
    });

    const compressedImage = await compressor({ targetImage: fileList[0] });
    setFile(compressedImage);

    // 미리보기 이미지 경로
    const previewImg = new Image();
    const _URL = window.URL || window.webkitURL;
    const objectURL = _URL.createObjectURL(compressedImage);

    previewImg.onload = () => {
      setSize({ width: previewImg.width, height: previewImg.height });
      setPreviewURL(objectURL);
    };
    previewImg.src = objectURL;

    // 파일 형식 체크
    const fileType = compressedImage.type.replace("image/", "");
    if (!["jpg", "jpeg", "gif", "webp", "png"].includes(fileType)) {
      setError("fileType");
      setIsInputUploading(false);
      return;
    }

    // 스토리지에 중복된 파일명을 방지하기 위해 해시 id를 생성하고 id를 파일명으로 사용
    const id = uuidv4();
    setId(id);
    setOriginalName(compressedImage.name);
    setFileName(id + "." + fileType);
    setByte(compressedImage.size);
    setIsInputUploading(false);
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

  // 첨부파일 리셋 함수
  const reset = () => {
    setFile(null);
    setPreviewURL("");
    setId("");
    setFileName("");
    setOriginalName("");
    setByte(0);
    setSize({ width: 0, height: 0 });
    setError(null);
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
    reset,
    error,
    data: {
      file,
      previewURL,
      id,
      fileName,
      originalName,
      byte,
      size,
      imgMetaData,
    },
  };
};

export default usePostImageFile;
