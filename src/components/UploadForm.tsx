"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import useInput from "@/hooks/useInput";
import { AnalysisResult, ImageData, ImageItem } from "@/types";
import useSetImageData from "@/hooks/useSetImageItem";
import useSetImageFile from "@/hooks/useSetImageFile";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { alertState, authStatusState, imageItemState } from "@/recoil/states";
import useGetImage from "@/hooks/useGetImage";
import Loading from "@/components/loading/Loading";
import _ from "lodash";
import useResetGrid from "@/hooks/useResetGrid";
import UploadLoading from "@/components/loading/UploadLoading";
import Modal from "@/components/modal/Modal";
import AnalysisResultModal from "@/components/modal/AnalysisResultModal";
import useAnalyzingImage from "@/hooks/useAnalyzingImage";

const UploadForm = () => {
  const { getImageItem, isLoading: isImageLoading } = useGetImage();
  const { setImageData, isLoading: isImageDataUploading } = useSetImageData();
  const { analyzingImage, isLoading: isAnalyzing } = useAnalyzingImage();
  const [loading, setLoading] = useState<boolean>(false);
  const isLoading = useMemo(
    () => isImageLoading || isImageDataUploading || isAnalyzing || loading,
    [isImageLoading, isImageDataUploading, isAnalyzing, loading],
  );
  const {
    setImageFile,
    onFileSelect,
    error,
    reset,
    isInputUploading,
    isLoading: isImageFileUploading,
    data: { file, previewURL, id, fileName, originalName, byte, size },
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
  const [init, setInit] = useState<boolean>(false);
  const [currentWork, setCurrentWork] = useState<"analyzing" | "uploading">(
    "analyzing",
  );
  const authStatus = useRecoilValue(authStatusState);
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(currentImageId),
  );
  const resetHomeGrid = useResetGrid({ gridType: "home" });
  const resetFollowingGrid = useResetGrid({ gridType: "following" });
  const resetUserGrid = useResetGrid({
    gridType: "user-" + authStatus.data?.uid,
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
  const setAlert = useSetRecoilState(alertState);
  const [imgURL, setImgURL] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

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
  ]);

  // 업로드/수정
  const onUploadClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // // // // // // // // //
    // 예외처리
    // // // // // // // // //
    if (isLoading) {
      return;
    } else if (error !== null) {
      switch (error) {
        case "fileType":
          setAlert({
            text: "유효하지 않은 파일 형식입니다.",
            createdAt: Date.now(),
            type: "warning",
            show: true,
          });
          return;
        default:
          setAlert({
            createdAt: Date.now(),
            type: "warning",
            show: true,
            text: "이미지 업로드 중 문제가 발생하였습니다.",
          });
          return;
      }
    } else if (authStatus.status !== "signedIn" || !authStatus.data) {
      setAlert({
        createdAt: Date.now(),
        type: "warning",
        show: true,
        text: "로그인 후 다시 시도해 주세요.",
      });
      return;
    } else if (!isEdit && !file) {
      setAlert({
        createdAt: Date.now(),
        type: "warning",
        show: true,
        text: "이미지를 첨부해 주세요.",
      });
      return;
    } else if (isEdit) {
      if (!imageItem) {
        setAlert({
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "수정할 이미지가 존재하지 않습니다.",
        });
        return;
      } else if (authStatus.data?.uid !== imageItem.uid) {
        setAlert({
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "이미지를 수정할 권한이 없습니다.",
        });
        return;
      } else if (
        title.trim() === imageItem.title &&
        desc.trim() === imageItem.description
      ) {
        setAlert({
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "변경 사항이 존재하지 않습니다.",
        });
        return;
      }
    } else {
      if (!id || !size || !byte || !fileName || !originalName) {
        setAlert({
          createdAt: Date.now(),
          type: "warning",
          show: true,
          text: "이미지 데이터를 불러오는 중 문제가 발생하였습니다.",
        });
        return;
      }
    }

    setLoading(true);

    // 분석 결과
    let analysisResult: AnalysisResult | null;
    // 업데이트 전 상태 백업
    let prevImageItem: ImageItem | null = null;

    // // // // // // // // //
    // 이미지 분석
    // // // // // // // // //

    // 새 이미지 업로드인 경우
    // 이미지 분석 실행
    if (!isEdit) {
      setCurrentWork("analyzing");

      analysisResult = await analyzingImage({ targetImage: file as File });

      if (!analysisResult) {
        setLoading(false);
        return;
      }

      setAnalysisResult(analysisResult);
      // 기존 이미지 수정인 경우
      // 기존 분석 결과 유지
    } else if (imageItem) {
      analysisResult = {
        tags: imageItem.tags,
        themeColor: imageItem.themeColor,
        feedback: imageItem.feedback,
      };
    } else {
      setLoading(false);
      return;
    }

    // 부적절한 이미지 필터
    if (analysisResult === "inappreciate") {
      setAlert({
        createdAt: Date.now(),
        type: "warning",
        show: true,
        text: `부적절한 이미지를 감지하였습니다.\n업로드를 중단합니다.`,
      });
      setLoading(false);
      return;
    }

    // // // // // // // // //
    // 이미지 업로드
    // // // // // // // // //

    setCurrentWork("uploading");

    // 신규 이미지는 업로드 후 id와 url 얻어오기 / 기존 이미지는 기존 데이터 유지
    const imageId = isEdit ? imageItem!.id : (id as string);
    const downloadURL = isEdit
      ? (imageItem!.URL as string)
      : await setImageFile({
          uid: authStatus.data.uid,
          fileName: fileName as string,
          img: file as File,
        });

    if (!downloadURL) {
      setLoading(false);
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
      title: isEdit && imageItem ? imageItem.title : title.trim(),
      description: isEdit ? imageItem?.description : desc.trim(),
      byte: isEdit && imageItem ? imageItem.byte : byte,
      size: isEdit && imageItem ? imageItem.size : size,
      URL: downloadURL,
      themeColor: analysisResult.themeColor,
      tags: analysisResult.tags,
      feedback: analysisResult.feedback,
      likes: isEdit && imageItem ? imageItem.likes : [],
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
      if (isEdit) {
        push(`/image/${imageId}`);
      } else {
        reset();
        setTitle("");
        setDesc("");
        setAlert({
          createdAt: Date.now(),
          type: "success",
          show: true,
          text: "업로드가 완료되었습니다.",
        });
        !isEdit && setShowResultModal(true);
        resetHomeGrid();
        resetFollowingGrid();
        resetUserGrid();
        setLoading(false);
      }
    } else {
      if (isEdit) setImageItem(prevImageItem);
      reset();
      setAlert({
        createdAt: Date.now(),
        type: "success",
        show: true,
        text: "문제가 발생하였습니다. 작업을 중단하였습니다.",
      });
      setLoading(false);
    }
  };

  const onCloseResultModal = () => {
    setShowResultModal(false);
    setAnalysisResult(null);
  };

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auth";
    }
  }, [isLoading]);

  return (
    <div className="bg-ebony-clay-50 h-full w-full px-12 py-24">
      {init ? (
        <div className="flex h-full items-center justify-center gap-12 gap-x-24 sm:flex-col md:gap-x-12">
          <label
            className={`from-ebony-clay-100 to-ebony-clay-300 relative h-auto max-w-[500px] grow overflow-hidden rounded-xl bg-gradient-to-br sm:w-full sm:grow-0 ${isEdit ? " cursor-default" : "cursor-pointer"}`}
          >
            {(previewURL || (isEdit && imageItem && imageItem.URL)) &&
            !isInputUploading ? (
              <div
                style={{
                  aspectRatio: `${isEdit ? imageItem?.size.width : size?.width || 0}/${isEdit ? imageItem?.size.height : size?.height || 0}`,
                }}
                className={`group relative rounded-xl p-4`}
              >
                <NextImage
                  layout="fill"
                  src={
                    (isEdit && imageItem ? imageItem.URL : previewURL) as string
                  }
                  alt={fileName || ""}
                />
                {!isEdit && (
                  <div className="bg-ebony-clay-100 absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit rounded-xl px-2 py-1 opacity-0 group-hover:opacity-80">
                    이미지 변경
                  </div>
                )}
              </div>
            ) : (
              <div className="text-ebony-clay-50 flex aspect-[3/4] w-full flex-col items-center justify-center text-balance break-keep p-6 text-center font-bold">
                {isInputUploading ? (
                  <div>
                    <Loading color="ebony-clay-50" />
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
                disabled={isLoading || isInputUploading}
                accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
                className="hidden"
              ></input>
            )}
          </label>
          <div className="flex w-72 flex-col gap-y-6">
            <label className="flex flex-col">
              <h3 className="text-ebony-clay-700 pb-1 pl-2">제목 (선택)</h3>
              <input
                value={title}
                onChange={onTitleChange}
                type="text"
                className="border-ebony-clay-200 rounded-lg border bg-white py-1 pl-2 outline-none"
                placeholder="이미지의 제목을 적어주세요."
                maxLength={50}
              />
            </label>
            <label className="flex flex-col">
              <h3 className="text-ebony-clay-700 pb-1 pl-2">내용 (선택)</h3>
              <textarea
                value={desc}
                onChange={onDescChange}
                className="border-ebony-clay-200 aspect-[5/2] resize-none rounded-lg border py-1 pl-2 outline-none"
                placeholder="이미지에 대한 설명을 적어주세요."
                maxLength={1000}
              />
            </label>
            <Button onClick={onUploadClick} disabled={isLoading}>
              {isLoading ? (
                <div className="flex h-full">
                  <Loading height="24px" />
                </div>
              ) : (
                <div>{isEdit ? "수정하기" : "이미지 업로드"}</div>
              )}
            </Button>
          </div>
          {isLoading && (
            <div className="fixed left-0 top-0 z-50 h-screen w-screen">
              <div className="bg-ebony-clay-950 h-full w-full opacity-30" />
              <div className="bg-ebony-clay-50 absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-[50%] min-w-[300px] rounded-lg">
                <UploadLoading />
                <div className="text-ebony-clay-700 text-balance break-keep px-8 pb-8 text-center leading-tight">
                  {currentWork === "analyzing"
                    ? "이미지를 분석해 태그를 생성하고 있습니다."
                    : "이미지 업로드 중입니다."}
                  <br />
                  창을 닫지 마세요.
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full items-center">
          <Loading height="24px" />
        </div>
      )}
      {showResultModal &&
        analysisResult &&
        analysisResult !== "inappreciate" && (
          <Modal close={onCloseResultModal} title="AI 분석 결과">
            <AnalysisResultModal
              result={analysisResult}
              imgURL={imgURL}
              imgSize={imgSize}
            />
          </Modal>
        )}
      {/* <Modal close={onCloseResultModal} title="AI 분석 결과">
        <AnalysisResultModal
          result={{
            feedback: {
              detail: "alfasfasdf",
              summary: { good: "dsafasfas", improve: "sdadfjaslkfdjsa" },
            },
            tags: ["a", "a", "a", "a", "a", "a", "a", "a", "a", "a"],
            themeColor: "#123123",
          }}
          imgURL={"/favicon.ico"}
          imgSize={imgSize}
        />
      </Modal> */}
    </div>
  );
};

export default UploadForm;
