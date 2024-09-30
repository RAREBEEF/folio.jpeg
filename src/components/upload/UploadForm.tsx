"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import useInput from "@/hooks/useInput";
import { AnalysisResult, ImageData } from "@/types";
import usePostImageData from "@/hooks/usePostImageData";
import usePostImageFile from "@/hooks/usePostImageFile";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import { useRecoilState, useRecoilValue } from "recoil";
import { authStatusState, deviceState, imageDataState } from "@/recoil/states";
import useGetImage from "@/hooks/useGetImage";
import Loading from "@/components/loading/Loading";
import _ from "lodash";
import useResetGrid from "@/hooks/useResetGrid";
import useAnalyzingImage from "@/hooks/useAnalyzingImage";
import useUpdateUploadStatus from "@/hooks/useUpdateUploadStatus";
import useUploadValidCheck from "@/hooks/useUploadValidCheck";
import CropImg from "./CropImg";
import PenSvg from "@/icons/pen-solid.svg";

const UploadForm = () => {
  // *********************************************
  // ***          훅           ***
  // *********************************************
  const { replace, push } = useRouter();

  // *********************************************
  // ***            주요 상태 및 변수          ***
  // *********************************************
  const device = useRecoilValue(deviceState);
  const { id: imageIdParam } = useParams();
  const currentImageId = useMemo(
    () =>
      imageIdParam ? JSON.stringify(imageIdParam).replaceAll('"', "") : "",
    [imageIdParam],
  );
  const authStatus = useRecoilValue(authStatusState);
  const [init, setInit] = useState<boolean>(false);
  // 수정 내용이 업로드 중인지 나타내는 상태
  const [cropImgMode, setCropImgMode] = useState<boolean>(false);
  // 현재 업로드하려는게 신규 이미지인지 기존 이미지에대한 수정인지를 구분
  const isEdit = !!currentImageId;
  // 현재 서버에 업로드가 진행 중인지.
  // 업로드 중인 상태를 굳이 신규 이미지와 기존 이미지 수정으로 구분하는 이유는 신규 이미지는 여러 업로드 작업을 동시에 처리하지만 수정은 해당 이미지 한 건만 처리하기 때문.
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // *********************************************
  // ***           업로드 관련         ***
  // *********************************************
  const { uploadValidCheck } = useUploadValidCheck();
  const { analyzingImage, isLoading: isAnalyzing } = useAnalyzingImage();
  const { postImageData, isLoading: isImageDataUploading } = usePostImageData();
  const {
    postImageFile,
    onFileSelect,
    error,
    onResetAllField,
    isInputUploading,
    data: inputImageData,
    onSelectImage,
    resetImg,
    compressor,
  } = usePostImageFile();
  const { updateUploadStatus } = useUpdateUploadStatus();

  // *********************************************
  // ***           이미지 데이터 관련         ***
  // *********************************************
  const { getImageData, isLoading: isImageLoading } = useGetImage();
  const [imageData, setImageData] = useRecoilState(
    imageDataState(currentImageId),
  );
  const {
    file,
    originFile,
    previewURL,
    id,
    fileName,
    originalName,
    byte,
    size,
    imgMetaData,
  } = inputImageData;
  const [cropData, setCropData] = useState<{
    metadataOverlay: boolean;
    filmStyleOverlay1: boolean;
    filmStyleOverlay2: boolean;
    resizerCoords: { x1: number; y1: number; x2: number; y2: number };
    cropPos: [number, number];
    cropSize: [number, number];
  }>({
    metadataOverlay: false,
    filmStyleOverlay1: false,
    filmStyleOverlay2: false,
    resizerCoords: { x1: 0, y1: 0, x2: 1, y2: 1 },
    cropPos: [0, 0],
    cropSize: [0, 0],
  });

  // *********************************************
  // ***            recoil 상태 초기화 훅          ***
  // *********************************************
  const resetUserCreatedAtGrid = useResetGrid({
    gridType: "user-" + authStatus.data?.uid + "-" + "createdAt",
  });
  const resetUserPopularityGrid = useResetGrid({
    gridType: "user-" + authStatus.data?.uid + "-" + "Popularity",
  });
  const resetHomeCreatedAtGrid = useResetGrid({ gridType: "home-createdAt" });
  const resetHomePopularityGrid = useResetGrid({ gridType: "home-popularity" });
  const resetFollowingCreatedAtGrid = useResetGrid({
    gridType: "following-createdAt",
  });
  const resetFollowingPopularityGrid = useResetGrid({
    gridType: "following-popularity",
  });

  // *********************************************
  // ***            input           ***
  // *********************************************
  const {
    value: title,
    setValue: setTitle,
    onChange: onTitleChange,
  } = useInput(imageData?.title || "");
  const {
    value: desc,
    setValue: setDesc,
    onChange: onDescChange,
  } = useInput(imageData?.description || "");
  const {
    value: cameraModel,
    setValue: setCameraModel,
    onChange: onCameraModelChange,
  } = useInput(imageData?.metadata.model || "");
  const {
    value: lensModel,
    setValue: setLensModel,
    onChange: onLensModelChange,
  } = useInput(imageData?.metadata.lensModel || "");
  const {
    value: shutterSpeed,
    setValue: setShutterSpeed,
    onChange: onShutterSpeedChange,
  } = useInput(imageData?.metadata.shutterSpeed || "");
  const {
    value: fNumber,
    setValue: setFNumber,
    onChange: onFNumberChange,
  } = useInput(imageData?.metadata.fNumber || "");
  const {
    value: ISO,
    setValue: setISO,
    onChange: onISOChange,
  } = useInput(imageData?.metadata.ISO?.toString() || "");
  const {
    value: focalLength,
    setValue: setFocalLength,
    onChange: onFocalLengthChange,
  } = useInput(imageData?.metadata.focalLength || "");
  const {
    value: createDate,
    setValue: setCreateDate,
    onChange: onCreateDateChange,
  } = useInput(imageData?.metadata.createDate || "");

  // ------------------------------------------
  // ------------------------------------------
  // ------------------------------------------
  // ---         함수와 useEffect들           ---
  // ------------------------------------------
  // ------------------------------------------
  // ------------------------------------------

  // *********************************************
  //  초기화.
  //  로그인 체크 및 수정/업로드 모드 구분, 초기 데이터 확보
  // *********************************************
  useEffect(() => {
    if (isImageLoading || authStatus.status === "pending") return;

    // 미로그인시 홈으로
    if (authStatus.status !== "signedIn") {
      replace("/");
      // 이미 초기화 했으면 리턴
    } else if (init) {
      return;
      // 새 이미지 업로드 모드
      // 초기화 완료
    } else if (!isEdit) {
      setInit(true);
      // 수정모드
      // 이미지 데이터 체크 후 초기화 환료
    } else {
      // 수정할 이미지 데이터 없으면 불러오고 초기화
      if (!imageData) {
        (async () => {
          const data = await getImageData({
            imageId: currentImageId,
          });

          // 불러온 이미지 없으면 돌아가기
          if (!data) {
            replace("/");
          } else {
            setImageData(data);
            setTitle(data.title || "");
            setDesc(data.description || "");
            setCameraModel(data.metadata.model || "");
            setLensModel(data.metadata.lensModel || "");
            setShutterSpeed(data.metadata.shutterSpeed || "");
            setFNumber(data.metadata.fNumber || "");
            setISO(data.metadata.ISO?.toString() || "");
            setFocalLength(data.metadata.focalLength || "");
            setCreateDate(data.metadata.createDate || "");
            setInit(true);
          }
        })();
        // 이미지 데이터 있으면 초기화
      } else {
        setImageData(imageData);
        setTitle(imageData.title || "");
        setDesc(imageData.description || "");
        setCameraModel(imageData.metadata.model || "");
        setLensModel(imageData.metadata.lensModel || "");
        setShutterSpeed(imageData.metadata.shutterSpeed || "");
        setFNumber(imageData.metadata.fNumber || "");
        setISO(imageData.metadata.ISO?.toString() || "");
        setFocalLength(imageData.metadata.focalLength || "");
        setCreateDate(imageData.metadata.createDate || "");
        setInit(true);
      }
    }
  }, [
    authStatus.data,
    authStatus.status,
    getImageData,
    imageData,
    init,
    isEdit,
    isImageLoading,
    currentImageId,
    replace,
    setDesc,
    setImageData,
    setTitle,
    setCameraModel,
    setLensModel,
    setShutterSpeed,
    setFNumber,
    setISO,
    setFocalLength,
    setCreateDate,
  ]);

  // *********************************************
  // ***             메타데이터 감지               ***
  // *********************************************
  useEffect(() => {
    if (isEdit && imageData) {
      setCameraModel(imageData.metadata.model || "");
      setLensModel(imageData.metadata.lensModel || "");
      setShutterSpeed(imageData.metadata.shutterSpeed || "");
      setFNumber(imageData.metadata.fNumber || "");
      setISO(imageData.metadata.ISO?.toString() || "");
      setFocalLength(imageData.metadata.focalLength || "");
      setCreateDate(imageData.metadata.createDate || "");
    } else if (!isEdit) {
      setCameraModel(imgMetaData.model || "");
      setLensModel(imgMetaData.lensModel || "");
      setShutterSpeed(imgMetaData.shutterSpeed || "");
      setFNumber(imgMetaData.fNumber || "");
      setISO(imgMetaData.ISO?.toString() || "");
      setFocalLength(imgMetaData.focalLength || "");
      setCreateDate(imgMetaData.createDate || "");
    }
  }, [
    isEdit,
    imgMetaData,
    imageData,
    setCameraModel,
    setLensModel,
    setShutterSpeed,
    setFNumber,
    setISO,
    setFocalLength,
    setCreateDate,
  ]);

  // *********************************************
  // ***            업로드           ***
  // *********************************************
  const onUploadClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // // // // // // // // //
    // 유효성 체크
    // // // // // // // // //
    if (
      !uploadValidCheck({
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
      })
    )
      return;

    // // // // // // // // //
    // 업로드 시작
    // // // // // // // // //
    const imageId = isEdit ? imageData!.id : (id as string);
    updateUploadStatus({
      id: imageId,
      status: "start",
      previewURL: previewURL,
    });

    isEdit ? setIsEditing(true) : resetAllField();
    window.addEventListener("beforeunload", handleBeforeUnload); // 앱 종료 방지

    // // // // // // // // //
    // 이미지 압축
    // // // // // // // // //
    updateUploadStatus({
      id: imageId,
      status: "compressing",
      previewURL: previewURL,
    });

    const compressedImg = await compressor({ targetImage: file as File });

    // 분석 결과
    let analysisResult: AnalysisResult | null;
    // 업데이트 전 상태 백업
    let prevImageData: ImageData | null = null;

    // // // // // // // // //
    // 이미지 분석
    // // // // // // // // //
    updateUploadStatus({
      id: imageId,
      status: "analyzing",
    });

    // 수정인 경우 기존 결과 유지
    if (isEdit && imageData) {
      analysisResult = {
        imgTags: imageData.imgTags,
        contentTags: imageData.contentTags,
        themeColor: imageData.themeColor,
        feedback: imageData.feedback,
      };
    } else {
      analysisResult = await analyzingImage({
        targetImage: compressedImg,
        title,
        desc,
      });

      if (!analysisResult) {
        abortUpload(imageId, "이미지 분석에 실패하였습니다.");
        return;
      }
    }

    // 부적절한 이미지 필터
    if (analysisResult === "inapposite") {
      abortUpload(imageId, "부적절한 이미지가 감지되었습니다.");
      return;
    }

    // // // // // // // // //
    // 이미지 업로드
    // // // // // // // // //
    updateUploadStatus({
      id: imageId,
      status: "uploadFile",
    });

    const downloadURL = isEdit
      ? (imageData!.URL as string)
      : await postImageFile({
          uid: authStatus.data!.uid,
          fileName: fileName as string,
          img: compressedImg as File,
        });

    if (!downloadURL) {
      abortUpload(imageId, "이미지 업로드 과정에서 문제가 발생하였습니다.");
      return;
    }

    updateUploadStatus({
      id: imageId,
      status: "uploadData",
    });
    compressedImg;
    const data: ImageData = {
      id: imageId,
      createdAt: isEdit && imageData ? imageData.createdAt : Date.now(),
      uid: authStatus.data!.uid,
      fileName: isEdit && imageData ? imageData.fileName : compressedImg.name,
      originalName: isEdit && imageData ? imageData.originalName : originalName,
      title: title.trim(),
      description: desc.trim(),
      byte: isEdit && imageData ? imageData.byte : compressedImg.size,
      size: isEdit && imageData ? imageData.size : size,
      URL: downloadURL,
      themeColor: analysisResult.themeColor,
      imgTags: analysisResult.imgTags,
      contentTags: analysisResult.contentTags,
      tags: Array.from(
        new Set(analysisResult.imgTags.concat(analysisResult.contentTags)),
      ),
      feedback: analysisResult.feedback,
      likes: isEdit && imageData ? imageData.likes : [],
      popularity: 0,
      metadata: {
        model: cameraModel,
        lensModel: lensModel,
        make: imgMetaData.make,
        lensMake: imgMetaData.lensMake,
        shutterSpeed: shutterSpeed,
        fNumber: fNumber,
        ISO: parseInt(ISO),
        focalLength: focalLength,
        createDate,
      },
    };

    // 수정 모드는 앱에 이미지 상태가 존재하기 때문에 상태 업데이트
    if (isEdit) {
      // 이미지 아이템 상태 업데이트
      setImageData((prev) => {
        prevImageData = prev;

        if (!prev) {
          return prev;
        } else {
          return {
            ...prev,
            ...data,
          };
        }
      });
    }

    const response = await postImageData({
      id: imageId,
      data: data,
      update: isEdit,
    });

    if (response === "success") {
      updateUploadStatus({
        id: imageId,
        status: "done",
        imageData: data,
      });

      if (isEdit) {
        push(`/image/${imageId}`);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      } else {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        resetUserCreatedAtGrid();
        resetUserPopularityGrid();
        resetHomeCreatedAtGrid();
        resetHomePopularityGrid();
        resetFollowingCreatedAtGrid();
        resetFollowingPopularityGrid();
        // resetSearchCreatedAtGrid();
        // resetSearchPopularityGrid();
      }
    } else {
      if (isEdit) setImageData(prevImageData);
      abortUpload(imageId, "게시물 업로드 과정에서 문제가 발생하였습니다.");
    }
  };

  // *********************************************
  // ***          모든 필드 리셋           ***
  // *********************************************
  const resetAllField = () => {
    onResetAllField();
    setTitle("");
    setDesc("");
    setCameraModel("");
    setLensModel("");
    setShutterSpeed("");
    setFNumber("");
    setISO("");
    setFocalLength("");
    setCreateDate("");
    setCropData({
      metadataOverlay: false,
      filmStyleOverlay1: false,
      filmStyleOverlay2: false,
      resizerCoords: { x1: 0, y1: 0, x2: 1, y2: 1 },
      cropPos: [0, 0],
      cropSize: [0, 0],
    });
  };

  // *********************************************
  // ***            이미지 크롭 모드           ***
  // *********************************************
  const onToggleCropImgMode = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCropImgMode((prev) => {
      if (prev) {
        document.body.style.overflow = "auto";
      } else {
        document.body.style.overflow = "hidden";
      }
      return !prev;
    });
  };
  const onResetImgClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    resetImg();
    setCropData({
      metadataOverlay: false,
      filmStyleOverlay1: false,
      filmStyleOverlay2: false,
      resizerCoords: { x1: 0, y1: 0, x2: 1, y2: 1 },
      cropPos: [0, 0],
      cropSize: [0, 0],
    });
  };
  const closeCropImgMode = () => {
    document.body.style.overflow = "auto";
    setCropImgMode(false);
  };

  // *********************************************
  // ***            기타           ***
  // *********************************************

  // 업로드 중 앱종료 방지
  const handleBeforeUnload = (event: any) => {
    event.preventDefault();
    event.returnValue = "";
    return "";
  };
  const abortUpload = (id: string, message: string) => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    setIsEditing(false);
    updateUploadStatus({ id, status: "fail", failMessage: message });
  };
  // number input의 휠 증감 방지
  const onNumberInputWheel = (e: MouseEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
    e.stopPropagation();
  };

  console.log(inputImageData);

  return (
    <div className="w-full bg-white px-12 py-12 py-24 xs:py-12">
      {init ? (
        <div className="flex h-full items-center justify-center gap-12 gap-x-24 sm:flex-col md:gap-x-12">
          <label
            className={`sticky top-[150px] h-auto max-w-[500px] grow self-start overflow-hidden rounded-xl bg-gradient-to-br from-astronaut-100 to-astronaut-300 sm:relative sm:top-auto sm:w-full sm:grow-0 sm:self-center ${isEdit ? " cursor-default" : "cursor-pointer"}`}
          >
            {(previewURL || (isEdit && imageData && imageData.URL)) &&
            !isInputUploading ? (
              <div
                style={{
                  maxHeight: "calc(100vh - 256px)",
                  aspectRatio: `${isEdit ? imageData?.size.width : size?.width || 0}/${isEdit ? imageData?.size.height : size?.height || 0}`,
                }}
                className={`group relative m-auto rounded-xl p-4 `}
              >
                <NextImage
                  layout="fill"
                  src={
                    (isEdit && imageData ? imageData.URL : previewURL) as string
                  }
                  alt={fileName || ""}
                />
                {!isEdit && (
                  <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit rounded-xl bg-astronaut-100 p-2 opacity-0 group-hover:opacity-80">
                    <PenSvg className="h-8 w-8" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center text-balance break-keep p-6 text-center font-bold text-astronaut-50">
                {isInputUploading ? (
                  <div>
                    <Loading color="astronaut-50" />
                    <br />
                    <div>이미지 압축 중</div>
                  </div>
                ) : (
                  <div>
                    업로드 할 이미지를 선택하세요. <br /> (jpg, gif, webp, png)
                  </div>
                )}
              </div>
            )}
            {!isEdit && (
              <input
                onChange={(e) => {
                  setCropData({
                    metadataOverlay: false,
                    filmStyleOverlay1: false,
                    filmStyleOverlay2: false,
                    resizerCoords: { x1: 0, y1: 0, x2: 1, y2: 1 },
                    cropPos: [0, 0],
                    cropSize: [0, 0],
                  });
                  onFileSelect(e);
                }}
                id="image_input"
                type="file"
                disabled={isInputUploading}
                accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
                className="hidden"
              ></input>
            )}
          </label>
          <div className="flex w-72 flex-col gap-y-6">
            {!isEdit && device !== "mobile" && (
              <div className="flex flex-col">
                <h3 className="pb-1 pl-2 text-astronaut-700">이미지 수정 </h3>
                <Button
                  disabled={!inputImageData.previewURL || isEdit}
                  onClick={onToggleCropImgMode}
                >
                  <div>이미지 레이아웃 수정</div>
                </Button>
                <div className="mt-3 flex flex-col">
                  <button
                    className={`text-sm text-astronaut-500 underline ${!inputImageData.previewURL && "invisible"}`}
                    disabled={!inputImageData.previewURL || isEdit}
                    onClick={onResetImgClick}
                  >
                    재설정
                  </button>
                </div>
              </div>
            )}
            <label className="flex flex-col">
              <h3 className="pb-1 pl-2 text-astronaut-700">
                제목{" "}
                <span className="text-xs text-astronaut-500">(선택 입력)</span>
              </h3>
              <input
                value={title}
                onChange={onTitleChange}
                type="text"
                className="rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none"
                placeholder="이미지의 제목을 적어주세요."
                maxLength={50}
              />
            </label>
            <label className="flex flex-col">
              <h3 className="pb-1 pl-2 text-astronaut-700">
                내용{" "}
                <span className="text-xs text-astronaut-500">(선택 입력)</span>
              </h3>
              <textarea
                value={desc}
                onChange={onDescChange}
                className="aspect-[5/2] resize-none rounded-lg border border-astronaut-200 py-1 pl-2 outline-none"
                placeholder="이미지에 대한 설명을 적어주세요."
                maxLength={1000}
              />
            </label>
            {/* {Object.values(imgMetaData).some((data) => data !== null) && ( */}
            <div className="flex flex-col py-6">
              <h2 className="text-xl font-semibold text-astronaut-800">
                메타데이터
              </h2>

              <div className="mt-4 flex flex-col gap-8">
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    카메라 모델{" "}
                    <span className="text-xs text-astronaut-500">
                      {!imgMetaData.model
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={cameraModel}
                    onChange={onCameraModelChange}
                    // disabled={!!loadedMetadata.model}
                    type="text"
                    className={`rounded-lg border border-astronaut-200 py-1 pl-2 outline-none`}
                    placeholder="촬영에 사용된 카메라 모델명을 적어주세요."
                    maxLength={50}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    렌즈 모델{" "}
                    <span className="text-xs text-astronaut-500">
                      {!imgMetaData.lensModel
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={lensModel}
                    onChange={onLensModelChange}
                    // disabled={!!loadedMetadata.lensModel}
                    type="text"
                    className={`rounded-lg border border-astronaut-200 py-1 pl-2 outline-none `}
                    placeholder="촬영에 사용된 렌즈 모델명을 적어주세요."
                    maxLength={50}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    셔터스피드{" "}
                    <span className="text-xs text-astronaut-500">
                      {!imgMetaData.shutterSpeed
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={shutterSpeed}
                    onChange={onShutterSpeedChange}
                    // disabled={!!loadedMetadata.shutterSpeed}
                    type="string"
                    className={`rounded-lg border border-astronaut-200 py-1 pl-2 outline-none `}
                    placeholder="촬영에 사용된 셔터스피드 값을 적어주세요."
                    maxLength={20}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    조리개 값{" "}
                    <span className="text-xs text-astronaut-500">
                      {!imgMetaData.fNumber
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={fNumber}
                    onChange={onFNumberChange}
                    // disabled={!!loadedMetadata.fNumber}
                    onWheel={onNumberInputWheel}
                    type="string"
                    className={`rounded-lg border border-astronaut-200 py-1 pl-2 outline-none `}
                    placeholder="촬영에 사용된 조리개 값을 적어주세요."
                    maxLength={10}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    ISO 값{" "}
                    <span className="text-xs text-astronaut-500">
                      {!imgMetaData.ISO ? "(선택 입력)" : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={ISO}
                    onChange={onISOChange}
                    // disabled={!!loadedMetadata.ISO}
                    onWheel={onNumberInputWheel}
                    type="number"
                    className={`rounded-lg border border-astronaut-200 py-1 pl-2 outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none `}
                    placeholder="촬영에 사용된 ISO 값을 적어주세요."
                    maxLength={10}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    초점 거리{" "}
                    <span className="text-xs text-astronaut-500">
                      {!imgMetaData.focalLength
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={focalLength}
                    onChange={onFocalLengthChange}
                    // disabled={!!loadedMetadata.focalLength}
                    onWheel={onNumberInputWheel}
                    type="string"
                    className={`rounded-lg border border-astronaut-200 py-1 pl-2 outline-none `}
                    placeholder="촬영에 사용된 초점 거리를 적어주세요."
                    maxLength={10}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    촬영일시{" "}
                    <span className="text-xs text-astronaut-500">
                      {!imgMetaData.createDate
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={createDate}
                    onChange={onCreateDateChange}
                    // disabled={!!loadedMetadata.focalLength}
                    type="string"
                    className={`rounded-lg border border-astronaut-200 py-1 pl-2 outline-none `}
                    placeholder="촬영 일시를 적어주세요."
                    maxLength={20}
                  />
                </label>
              </div>
            </div>

            <Button onClick={onUploadClick} disabled={isEdit && isEditing}>
              {isEdit && isEditing ? (
                <div className="flex h-full">
                  <Loading height="24px" />
                </div>
              ) : (
                <div>{isEdit ? "수정하기" : "이미지 업로드"}</div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center">
          <Loading height="24px" />
        </div>
      )}
      {cropImgMode && (
        <CropImg
          imgData={{
            ...inputImageData,
            imgMetaData: {
              model: cameraModel,
              make: inputImageData.imgMetaData.make,
              lensModel,
              lensMake: inputImageData.imgMetaData.lensMake,
              shutterSpeed,
              fNumber,
              ISO: parseInt(ISO),
              focalLength,
              createDate,
            },
          }}
          onSelectImage={onSelectImage}
          onToggleCropImgMode={onToggleCropImgMode}
          close={closeCropImgMode}
          cropDataSetter={setCropData}
          prevCropData={cropData}
        />
      )}
    </div>
  );
};

export default UploadForm;
