"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import useInput from "@/hooks/useInput";
import { AnalysisResult, ImageData, ImageItem, ImageMetadata } from "@/types";
import useSetImageData from "@/hooks/useSetImageItem";
import useSetImageFile from "@/hooks/useSetImageFile";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { alertsState, authStatusState, imageItemState } from "@/recoil/states";
import useGetImage from "@/hooks/useGetImage";
import Loading from "@/components/loading/Loading";
import _, { uniqueId } from "lodash";
import useResetGrid from "@/hooks/useResetGrid";
import useAnalyzingImage from "@/hooks/useAnalyzingImage";

const UploadForm = () => {
  const { getImageItem, isLoading: isImageLoading } = useGetImage();
  const { setImageData, isLoading: isImageDataUploading } = useSetImageData();
  const { analyzingImage, isLoading: isAnalyzing } = useAnalyzingImage();
  const {
    setImageFile,
    onFileSelect,
    error,
    reset,
    isInputUploading,
    isLoading: isImageFileUploading,
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
  } = useSetImageFile();
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const { replace, push } = useRouter();
  const { id: imageIdParam } = useParams();
  const currentImageId = useMemo(
    () =>
      imageIdParam ? JSON.stringify(imageIdParam).replaceAll('"', "") : "",
    [imageIdParam],
  );
  const isEdit = !!currentImageId;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(currentImageId),
  );
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
  const setAlerts = useSetRecoilState(alertsState);
  const [imgURL, setImgURL] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [loadedMetadata, setLoadedMetadata] = useState<ImageMetadata>({
    make: null,
    model: null,
    lensMake: null,
    lensModel: null,
    shutterSpeed: null,
    fNumber: null,
    ISO: null,
    focalLength: null,
  });
  const {
    value: title,
    setValue: setTitle,
    onChange: onTitleChange,
  } = useInput(imageItem?.title || "");
  const {
    value: desc,
    setValue: setDesc,
    onChange: onDescChange,
  } = useInput(imageItem?.description || "");
  const {
    value: customCameraModel,
    setValue: setCustomCameraModel,
    onChange: onCustomCameraModelChange,
  } = useInput(
    imageItem?.metadata.model || imageItem?.customMetadata.model || "",
  );
  const {
    value: customLensModel,
    setValue: setCustomLensModel,
    onChange: onCustomLensModelChange,
  } = useInput(
    imageItem?.metadata.lensModel || imageItem?.customMetadata.lensModel || "",
  );
  const {
    value: customShutterSpeed,
    setValue: setCustomShutterSpeed,
    onChange: onCustomShutterSpeedChange,
  } = useInput(
    imageItem?.metadata.shutterSpeed ||
      imageItem?.customMetadata.shutterSpeed ||
      "",
  );
  const {
    value: customFNumber,
    setValue: setCustomFNumber,
    onChange: onCustomFNumberChange,
  } = useInput(
    imageItem?.metadata.fNumber?.toString() ||
      imageItem?.customMetadata.fNumber?.toString() ||
      "",
  );
  const {
    value: customISO,
    setValue: setCustomISO,
    onChange: onCustomISOChange,
  } = useInput(
    imageItem?.metadata.ISO?.toString() ||
      imageItem?.customMetadata.ISO?.toString() ||
      "",
  );
  const {
    value: customFocalLength,
    setValue: setCustomFocalLength,
    onChange: onCustomFocalLengthChange,
  } = useInput(
    imageItem?.metadata.focalLength?.toString() ||
      imageItem?.customMetadata.focalLength?.toString() ||
      "",
  );

  useEffect(() => {
    if (init || isImageLoading) return;
    // 로그인 여부 체크
    // 로그인이 안되었거나 수정 권한이 없으면 나가기
    if (
      (authStatus.status !== "pending" && authStatus.status !== "signedIn") ||
      (isEdit &&
        authStatus.data &&
        imageItem &&
        authStatus.data.uid !== imageItem.uid)
    ) {
      replace("/");
    } else if (authStatus.status === "signedIn") {
      // 수정모드 구분
      if (isEdit) {
        // 수정할 이미지 데이터가 아직 없으면 불러오기
        if (!imageItem) {
          (async () => {
            console.log("불러오기");
            const data = await getImageItem({
              imageId: currentImageId,
            });
            if (!data) {
              replace("/");
            } else {
              setImageItem(data);
              setTitle(data.title || "");
              setDesc(data.description || "");
              setCustomCameraModel(data.metadata.model || "");
              setCustomLensModel(data.metadata.lensModel || "");
              setCustomShutterSpeed(data.metadata.shutterSpeed || "");
              setCustomFNumber(data.metadata.fNumber?.toString() || "");
              setCustomISO(data.metadata.ISO?.toString() || "");
              setCustomFocalLength(data.metadata.focalLength?.toString() || "");
              setInit(true);
            }
          })();
        } else {
          setInit(true);
        }
        // 신규 업로드는 딱히 초기화 할거 없음
      } else {
        setInit(true);
      }
    }
  }, [
    authStatus.data,
    authStatus.status,
    getImageItem,
    imageItem,
    init,
    isEdit,
    isImageLoading,
    currentImageId,
    replace,
    setDesc,
    setImageItem,
    setTitle,
    setCustomCameraModel,
    setCustomLensModel,
    setCustomShutterSpeed,
    setCustomFNumber,
    setCustomISO,
    setCustomFocalLength,
  ]);

  useEffect(() => {
    setLoadedMetadata({
      ...(isEdit && imageItem ? imageItem.metadata : imgMetaData),
    });
  }, [isEdit, imgMetaData, imageItem]);

  const handleBeforeUnload = (event: any) => {
    event.preventDefault();
    event.returnValue = "";
    return "";
  };

  const abortUpload = (alertId: string, message: string) => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    setIsEditing(false);
    setAlerts((prev) => {
      const newAlerts = prev.filter((alert) => alert.id !== alertId);
      return [
        ...newAlerts,
        {
          id: alertId,
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: message,
        },
      ];
    });
  };

  // 업로드/수정
  const onUploadClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // // // // // // // // //
    // 예외처리
    // // // // // // // // //
    if (isEdit && isEditing) {
      return;
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
          return;
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
          return;
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
      return;
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
      return;
    } else if (isEdit) {
      if (!imageItem) {
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
        return;
      } else if (authStatus.data?.uid !== imageItem.uid) {
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
        return;
      } else if (
        title.trim() === imageItem.title &&
        desc.trim() === imageItem.description &&
        customCameraModel === imageItem.customMetadata.model &&
        customLensModel === imageItem.customMetadata.lensModel &&
        customShutterSpeed === imageItem.customMetadata.shutterSpeed &&
        customISO === imageItem.customMetadata.ISO?.toString() &&
        customFNumber === imageItem.customMetadata.fNumber?.toString() &&
        customFocalLength === imageItem.customMetadata.focalLength?.toString()
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
        return;
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
        return;
      }
    }

    // 업로드 과정 시작

    isEdit ? setIsEditing(true) : resetAllField();
    window.addEventListener("beforeunload", handleBeforeUnload); // 앱 종료 방지
    const imageId = isEdit ? imageItem!.id : (id as string);

    setAlerts((prev) => [
      ...prev,
      {
        id: imageId,
        createdAt: Date.now(),
        type: "default",
        show: true,
        text: "이미지 분석 중입니다. 앱을 종료하지 마세요.",
        fixed: true,
        duration: -1,
      },
    ]);

    // 분석 결과
    let analysisResult: AnalysisResult | null;
    // 업데이트 전 상태 백업
    let prevImageItem: ImageItem | null = null;

    // // // // // // // // //
    // 이미지 분석
    // // // // // // // // //

    // 수정인 경우 기존 결과 유지
    if (isEdit && imageItem) {
      analysisResult = {
        imgTags: imageItem.imgTags,
        contentTags: imageItem.contentTags,
        themeColor: imageItem.themeColor,
        feedback: imageItem.feedback,
      };
    } else {
      analysisResult = await analyzingImage({
        targetImage: file as File,
        title,
        desc,
      });

      if (!analysisResult) {
        abortUpload(
          imageId,
          "이미지 분석에 실패하였습니다. 업로드를 중단합니다.",
        );
        return;
      }

      setAnalysisResult(analysisResult);
    }

    // 부적절한 이미지 필터
    if (analysisResult === "inappreciate") {
      abortUpload(
        imageId,
        "부적절한 이미지가 감지되었습니다. 업로드를 중단합니다.",
      );
      return;
    }

    // // // // // // // // //
    // 이미지 업로드
    // // // // // // // // //
    setAlerts((prev) => {
      const newAlerts = prev.filter((alert) => alert.id !== imageId);

      return [
        ...newAlerts,
        {
          id: imageId,
          createdAt: Date.now(),
          type: "default",
          show: true,
          text: "이미지 업로드 중입니다. 앱을 닫지 마세요.",
          fixed: true,
          duration: -1,
        },
      ];
    });

    const downloadURL = isEdit
      ? (imageItem!.URL as string)
      : await setImageFile({
          uid: authStatus.data.uid,
          fileName: fileName as string,
          img: file as File,
        });

    if (!downloadURL) {
      abortUpload(imageId, "이미지 업로드 과정에서 문제가 발생하였습니다.");
      return;
    }

    // 업로드 후 분석 결과에 이미지 띄울 때 필요한 정보
    setImgURL(downloadURL);
    setImgSize(size);

    const data: ImageData = {
      id: imageId,
      createdAt: isEdit && imageItem ? imageItem.createdAt : Date.now(),
      uid: authStatus.data.uid,
      fileName: isEdit && imageItem ? imageItem.fileName : fileName,
      originalName: isEdit && imageItem ? imageItem.originalName : originalName,
      title: title.trim(),
      description: desc.trim(),
      byte: isEdit && imageItem ? imageItem.byte : byte,
      size: isEdit && imageItem ? imageItem.size : size,
      URL: downloadURL,
      themeColor: analysisResult.themeColor,
      imgTags: analysisResult.imgTags,
      contentTags: analysisResult.contentTags,
      tags: Array.from(
        new Set(analysisResult.imgTags.concat(analysisResult.contentTags)),
      ),
      feedback: analysisResult.feedback,
      likes: isEdit && imageItem ? imageItem.likes : [],
      popularity: 0,
      metadata: loadedMetadata,
      customMetadata: {
        model: customCameraModel,
        lensModel: customLensModel,
        make: imgMetaData.make,
        lensMake: imgMetaData.lensMake,
        shutterSpeed: customShutterSpeed,
        fNumber: parseInt(customFNumber),
        ISO: parseInt(customISO),
        focalLength: parseInt(customFocalLength),
      },
    };

    // 수정 모드는 앱에 이미지 상태가 존재하기 때문에 상태 업데이트
    if (isEdit) {
      // 이미지 아이템 상태 업데이트
      setImageItem((prev) => {
        prevImageItem = prev;

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

    const response = await setImageData({
      id: imageId,
      data: data,
      update: isEdit,
    });

    if (response === "success") {
      setAlerts((prev) => {
        const newAlerts = prev.filter((alert) => alert.id !== imageId);

        return [
          ...newAlerts,
          {
            id: imageId,
            createdAt: Date.now(),
            type: "success",
            show: true,
            text: "이미지 업로드가 완료되었습니다.",
          },
        ];
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
      }
    } else {
      if (isEdit) setImageItem(prevImageItem);
      abortUpload(imageId, "이미지 업로드 과정에서 문제가 발생하였습니다.");
    }
  };

  const resetAllField = () => {
    reset();
    setTitle("");
    setDesc("");
    setCustomCameraModel("");
    setCustomLensModel("");
    setCustomShutterSpeed("");
    setCustomFNumber("");
    setCustomISO("");
    setCustomFocalLength("");
    setLoadedMetadata({
      make: null,
      model: null,
      lensMake: null,
      lensModel: null,
      shutterSpeed: null,
      fNumber: null,
      ISO: null,
      focalLength: null,
    });
  };

  const onNumberInputWheel = (e: MouseEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
    e.stopPropagation();
  };

  return (
    <div className="h-full w-full bg-astronaut-50 px-12 py-24">
      {init ? (
        <div className="flex h-full items-center justify-center gap-12 gap-x-24 sm:flex-col md:gap-x-12">
          <label
            className={`sticky top-[150px] h-auto max-w-[500px] grow self-start overflow-hidden rounded-xl bg-gradient-to-br from-astronaut-100 to-astronaut-300 sm:relative sm:top-auto sm:w-full sm:grow-0 sm:self-center ${isEdit ? " cursor-default" : "cursor-pointer"}`}
          >
            {(previewURL || (isEdit && imageItem && imageItem.URL)) &&
            !isInputUploading ? (
              <div
                style={{
                  maxHeight: "calc(100vh - 156px)",
                  aspectRatio: `${isEdit ? imageItem?.size.width : size?.width || 0}/${isEdit ? imageItem?.size.height : size?.height || 0}`,
                }}
                className={`group relative m-auto rounded-xl p-4 `}
              >
                <NextImage
                  layout="fill"
                  src={
                    (isEdit && imageItem ? imageItem.URL : previewURL) as string
                  }
                  alt={fileName || ""}
                />
                {!isEdit && (
                  <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit rounded-xl bg-astronaut-100 px-2 py-1 opacity-0 group-hover:opacity-80">
                    이미지 변경
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
                onChange={onFileSelect}
                id="image_input"
                type="file"
                disabled={isInputUploading}
                accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
                className="hidden"
              ></input>
            )}
          </label>
          <div className="flex w-72 flex-col gap-y-6">
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
                촬영 정보
              </h2>
              <p className="text-xs  text-astronaut-500">
                메타데이터에서 로드된 정보는 수정할 수 없습니다.
              </p>
              <div className="mt-4 flex flex-col gap-8">
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    카메라 모델{" "}
                    <span className="text-xs text-astronaut-500">
                      {!loadedMetadata.model
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={loadedMetadata.model || customCameraModel}
                    onChange={onCustomCameraModelChange}
                    disabled={!!loadedMetadata.model}
                    type="text"
                    className={`rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none ${!!loadedMetadata.model && "border-none"}`}
                    placeholder="촬영에 사용된 카메라 모델명을 적어주세요."
                    maxLength={50}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    렌즈 모델{" "}
                    <span className="text-xs text-astronaut-500">
                      {!loadedMetadata.lensModel
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={loadedMetadata.lensModel || customLensModel}
                    onChange={onCustomLensModelChange}
                    disabled={!!loadedMetadata.lensModel}
                    type="text"
                    className={`rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none ${!!loadedMetadata.lensModel && "border-none"}`}
                    placeholder="촬영에 사용된 렌즈 모델명을 적어주세요."
                    maxLength={50}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    셔터스피드{" "}
                    <span className="text-xs text-astronaut-500">
                      {!loadedMetadata.shutterSpeed
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={loadedMetadata.shutterSpeed || customShutterSpeed}
                    onChange={onCustomShutterSpeedChange}
                    disabled={!!loadedMetadata.shutterSpeed}
                    type="string"
                    className={`rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none ${!!loadedMetadata.shutterSpeed && "border-none"}`}
                    placeholder="촬영에 사용된 셔터스피드 값을 적어주세요."
                    maxLength={20}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    조리개 값{" "}
                    <span className="text-xs text-astronaut-500">
                      {!loadedMetadata.fNumber
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={loadedMetadata.fNumber || customFNumber}
                    onChange={onCustomFNumberChange}
                    disabled={!!loadedMetadata.fNumber}
                    onWheel={onNumberInputWheel}
                    type="number"
                    className={`rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none ${!!loadedMetadata.fNumber && "border-none"}`}
                    placeholder="촬영에 사용된 조리개 값을 적어주세요."
                    maxLength={10}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    ISO 값{" "}
                    <span className="text-xs text-astronaut-500">
                      {!loadedMetadata.ISO
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={loadedMetadata.ISO || customISO}
                    onChange={onCustomISOChange}
                    disabled={!!loadedMetadata.ISO}
                    onWheel={onNumberInputWheel}
                    type="number"
                    className={`rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none ${!!loadedMetadata.ISO && "border-none"}`}
                    placeholder="촬영에 사용된 ISO 값을 적어주세요."
                    maxLength={10}
                  />
                </label>
                <label className="flex flex-col">
                  <h3 className="pb-1 pl-2 text-astronaut-700">
                    초점 거리{" "}
                    <span className="text-xs text-astronaut-500">
                      {!loadedMetadata.focalLength
                        ? "(선택 입력)"
                        : "(메타데이터 로드됨)"}
                    </span>
                  </h3>
                  <input
                    value={loadedMetadata.focalLength || customFocalLength}
                    onChange={onCustomFocalLengthChange}
                    disabled={!!loadedMetadata.focalLength}
                    onWheel={onNumberInputWheel}
                    type="number"
                    className={`rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none ${!!loadedMetadata.focalLength && "border-none"}`}
                    placeholder="촬영에 사용된 초점 거리를 적어주세요."
                    maxLength={10}
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
    </div>
  );
};

export default UploadForm;
