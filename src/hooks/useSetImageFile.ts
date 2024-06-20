import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import { ref } from "firebase/storage";
import { ChangeEvent, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";

/**
 * 이미지를 스토리지에 업로드하고 다운로드url을 포함한 이미지 데이터를 반환하는 비동기 함수 (를 반환하는 커스텀훅)
 */
const useSetImageFile = () => {
  const [isInputUploading, setIsInputUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [byte, setByte] = useState<number | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [error, setError] = useState<unknown>(null);

  // 이미지 압축
  const compressor = async (targetImage: File) => {
    const compressedImage = await imageCompression(targetImage, {
      maxSizeMB: 10,
      maxWidthOrHeight: 1920,
      useWebWorker: false,
    });
    return compressedImage;
  };

  // 첨부파일 선택
  const onFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);

    const fileList = e.target.files;
    if (fileList && fileList?.length !== 0) {
      // 상태 초기화
      setFile(null);
      setPreviewUrl(null);
      setId(null);
      setFileName(null);
      setOriginalName(null);
      setByte(null);
      setSize(null);
      setIsInputUploading(true);

      const compressedImage = await compressor(fileList[0]);
      setFile(compressedImage);

      // 미리보기 이미지 경로
      const previewImg = new Image();
      const _URL = window.URL || window.webkitURL;
      const objectUrl = _URL.createObjectURL(compressedImage);
      previewImg.onload = async function () {
        // @ts-ignore
        setSize({ width: this.width, height: this.height });
        setPreviewUrl(objectUrl);
        // const gradient = await getGradient(objectUrl);
        // setGradient(gradient);
      };
      previewImg.src = objectUrl;

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
    } else {
      // setFile(null);
      // setPreviewUrl(null);
      // setId(null);
      // setFileName(null);
      // setOriginalName(null);
      // setByte(null);
      // setSize(null);
    }
  };

  /**
   * 이미지를 스토리지에 업로드하고 다운로드url을 포함한 이미지 데이터를 반환하는 비동기 함수
   * */
  const setImageFile = async (uid: string, fileName: string, img: File) => {
    if (error) return;
    setIsLoading(true);

    // 업로드
    const storage = getStorage();
    const storageRef = ref(storage, `images/${uid}/${fileName}`);
    const downloadURL = await uploadBytes(storageRef, img).then(async () => {
      return await getDownloadURL(storageRef);
    });

    setIsLoading(false);
    return downloadURL;
  };

  // 첨부파일 리셋 함수
  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setId(null);
    setFileName(null);
    setOriginalName(null);
    setByte(null);
    setSize(null);
  };

  return {
    isInputUploading,
    setImageFile,
    onFileSelect,
    file,
    previewUrl,
    id,
    fileName,
    originalName,
    byte,
    size,
    error,
    reset,
    isLoading,
  };
};

export default useSetImageFile;
