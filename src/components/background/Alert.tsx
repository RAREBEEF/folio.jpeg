"use client";
import { alertsState, modalState, uploadStatusState } from "@/recoil/states";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import CircleCheckIcon from "@/icons/circle-check-solid.svg";
import CircleExclamationIcon from "@/icons/circle-exclamation-solid.svg";
import _ from "lodash";
import { AnalysisResult, UploadStatus } from "@/types";
import Image from "next/image";
import ArrowSvg from "@/icons/chevron-left-solid.svg";
import useUpdateUploadStatus from "@/hooks/useUpdateUploadStatus";
import DeleteIcon from "@/icons/xmark-solid.svg";
import Modal from "../modal/Modal";
import AnalysisResultModal from "../modal/AnalysisResultModal";

const STEPS = {
  start: 0,
  analyzing: 1,
  uploadFile: 2,
  uploadData: 3,
  done: 4,
  fail: -1,
};

const Alert = () => {
  const { updateUploadStatus } = useUpdateUploadStatus();
  const [uploadStatus, setUploadStatus] = useRecoilState(uploadStatusState);
  const [isListOpen, setIsListOpen] = useState<boolean>(true);
  const [alerts, setAlerts] = useRecoilState(alertsState);
  const [needToSetCleanUp, setNeedToSetCleanUp] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<
    AnalysisResult | null | undefined
  >(null);
  const [resultPreviewURL, setResultPreviewURL] = useState<string>("");
  const [resultPreviewSize, setResultPreviewSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [showAnalysisResultModal, setShowAnalysisResultModal] =
    useState<boolean>(false);
  const isModalVisible = useRecoilValue(modalState);

  useEffect(() => {
    const newAlertArrival = alerts.filter((alert) => !alert.cleanUp).length > 0;
    if (newAlertArrival) {
      setNeedToSetCleanUp(true);
    } else {
      setNeedToSetCleanUp(false);
    }
  }, [alerts]);

  useEffect(() => {
    if (needToSetCleanUp) {
      setAlerts((prev) => {
        const newAlerts = prev.map((alert) => {
          const { id, cleanUp, duration } = alert;
          if (!cleanUp && duration !== -1) {
            setTimeout(() => {
              setAlerts((prev) => prev.filter((alert) => alert.id !== id));
            }, duration || 3000);
          }
          return {
            ...alert,
            cleanUp: true,
          };
        });

        return newAlerts;
      });
    }
  }, [setAlerts, needToSetCleanUp]);

  const onUploadListToggle = (e: ChangeEvent<HTMLDetailsElement>) => {
    if (e.target.open) {
      setIsListOpen(true);
    } else {
      setIsListOpen(false);
    }
  };

  const uploadCleanUpDone = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setUploadStatus((prev) => {
      return prev.filter((upload) => upload.status !== "done");
    });
  };

  const uploadCleanUpSelf = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    setUploadStatus((prev) => {
      return prev.filter((upload) => upload.id !== id);
    });
  };

  const onShowAnalysisResultModal = (
    e: MouseEvent<HTMLButtonElement>,
    analysisResult: AnalysisResult | null | undefined,
    previewURL: string,
    previewSize: { width: number; height: number },
  ) => {
    e.preventDefault();
    setAnalysisResult(analysisResult);
    setResultPreviewURL(previewURL);
    setResultPreviewSize(previewSize);
    setShowAnalysisResultModal(true);
  };

  const onCloseAnalysisModal = () => {
    setShowAnalysisResultModal(false);
  };

  return (
    <div className="pointer-events-none fixed bottom-[50px] left-0 right-0 z-[10000] m-auto flex w-screen flex-col items-center justify-end gap-4 overflow-visible px-4 sm:bottom-[80px]">
      <div className="flex w-full items-end gap-4 sm:flex-col sm:items-center">
        {/* 알림 */}
        <div className="flex grow flex-col items-center sm:mb-4">
          {alerts
            .filter((alert) => alert.fixed)
            .map((alert) => (
              <div
                key={alert.createdAt}
                className={`mt-4 flex w-fit max-w-[90vw] animate-alert select-none items-center gap-4 overflow-hidden break-keep rounded-xl bg-astronaut-50 px-8 text-lg font-semibold text-astronaut-800 shadow-lg`}
              >
                {alert.type === "success" ? (
                  <CircleCheckIcon className="aspect-square h-8 fill-astronaut-500" />
                ) : alert.type === "warning" ? (
                  <CircleExclamationIcon className="aspect-square h-8 fill-astronaut-500" />
                ) : null}
                <div className="my-4 whitespace-pre-line leading-tight">
                  {alert.text}
                </div>
              </div>
            ))}
          {alerts
            .filter((alert) => !alert.fixed)
            .splice(-3)
            .map((alert) => (
              <div
                key={alert.createdAt}
                className={`mt-4 flex w-fit max-w-[90vw] animate-alert select-none items-center gap-4 overflow-hidden break-keep rounded-xl bg-astronaut-50  px-8 text-lg font-semibold text-astronaut-800 shadow-lg`}
              >
                {alert.type === "success" ? (
                  <CircleCheckIcon className="aspect-square h-8 fill-astronaut-500" />
                ) : alert.type === "warning" ? (
                  <CircleExclamationIcon className="aspect-square h-8 fill-astronaut-500" />
                ) : null}
                <div className="my-4 whitespace-pre-line leading-tight">
                  {alert.text}
                </div>
              </div>
            ))}
        </div>
        {/* 업로드 목록 */}
        {uploadStatus.length > 0 && !isModalVisible && (
          <div
            className={`pointer-events-auto mr-5 flex w-fit min-w-[300px] max-w-[50vw] shrink-0 animate-alert select-none flex-col items-center gap-2 overflow-hidden break-keep rounded-xl bg-astronaut-50 px-2 py-2 text-lg text-astronaut-800 shadow-lg transition-all sm:mr-0`}
          >
            <div className="self-start px-4">
              <div className="flex items-center gap-1 text-sm font-semibold">
                진행 중인 업로드{" "}
                <span className="text-xs">
                  (
                  {
                    uploadStatus.filter(
                      (upload) => !["done", "fail"].includes(upload.status),
                    ).length
                  }
                  )
                </span>
              </div>
              <div className="text-xs font-normal">
                업로드가 완료될 때까지 앱을 종료하지 마세요.
              </div>
            </div>
            <details
              className="w-full"
              open={isListOpen}
              onToggle={onUploadListToggle}
            >
              <summary className="group m-auto w-fit cursor-pointer">
                <ArrowSvg
                  className={`h-4 w-4 fill-astronaut-500 transition-transform hover:fill-astronaut-600 active:fill-astronaut-700 ${isListOpen ? "rotate-[270deg] group-hover:translate-y-[5px]" : "rotate-90 group-hover:translate-y-[-5px]"}`}
                />
              </summary>
              <div className="mt-2 flex max-h-[50vh] flex-col gap-2 overflow-scroll px-5">
                <button
                  onClick={uploadCleanUpDone}
                  className="self-end text-xs text-astronaut-500"
                >
                  완료된 항목 지우기
                </button>
                {uploadStatus.map((upload) => (
                  <div
                    key={upload.id}
                    className={`relative flex w-full items-center gap-2 whitespace-pre-line border-t-2 border-astronaut-200 py-2 text-base leading-tight ${upload.status === "fail" && "text-[firebrick]"}`}
                  >
                    {["done", "fail"].includes(upload.status) && (
                      <button
                        onClick={(e) => uploadCleanUpSelf(e, upload.id)}
                        className="absolute right-0 top-1 h-3 w-3 fill-astronaut-500 hover:fill-astronaut-600 active:fill-astronaut-700"
                      >
                        <DeleteIcon />
                      </button>
                    )}
                    <div className="relative h-10 w-10 shrink-0 self-start">
                      <Image
                        className="overflow-hidden rounded-lg"
                        layout="fill"
                        objectFit="cover"
                        src={upload.previewURL || ""}
                        alt={upload.id}
                      />
                    </div>
                    <div className="flex grow flex-col justify-between self-stretch">
                      <div className="font-semibold">
                        <div className="shrink-0 text-xs">
                          {!["fail", "done"].includes(upload.status) &&
                            `STEP ${STEPS[upload.status]}`}
                          {upload.status === "done" && "DONE"}
                          {upload.status === "fail" && "FAILED"}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <div
                            className={`h-1 grow rounded-full ${STEPS[upload.status] >= 1 ? "bg-astronaut-800" : "bg-astronaut-300"} ${upload.status === "fail" && "bg-[firebrick]"}`}
                          ></div>
                          <div
                            className={`h-1 grow rounded-full ${STEPS[upload.status] >= 2 ? "bg-astronaut-800" : "bg-astronaut-300"} ${upload.status === "fail" && "bg-[firebrick]"}`}
                          ></div>
                          <div
                            className={`h-1 grow rounded-full ${STEPS[upload.status] >= 3 ? "bg-astronaut-800" : "bg-astronaut-300"} ${upload.status === "fail" && "bg-[firebrick]"}`}
                          ></div>
                          <div
                            className={`h-1 grow rounded-full ${upload.status === "done" ? "bg-astronaut-800" : "bg-astronaut-300"} ${upload.status === "fail" && "bg-[firebrick]"}`}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-1 flex grow justify-between text-xs leading-tight">
                        <div>
                          {STEPS[upload.status] === 0 &&
                            "업로드가 시작되었습니다."}
                          {STEPS[upload.status] === 1 &&
                            "이미지 분석 중입니다."}
                          {STEPS[upload.status] === 2 &&
                            "이미지 업로드 중입니다."}
                          {STEPS[upload.status] === 3 &&
                            "게시물 업로드 중입니다."}
                          {upload.status === "done" &&
                            "업로드가 완료되었습니다."}
                          {upload.status === "fail" &&
                            (upload.failMessage || "업로드에 실패하였습니다.")}
                        </div>
                        {upload.status === "done" && (
                          <button
                            onClick={(e) => {
                              upload.imageData &&
                                onShowAnalysisResultModal(
                                  e,
                                  {
                                    feedback: upload.imageData?.feedback,
                                    themeColor: upload.imageData?.themeColor,
                                    imgTags: upload.imageData?.imgTags,
                                    contentTags: upload.imageData?.contentTags,
                                  },
                                  upload.previewURL,
                                  upload.imageData.size,
                                );
                            }}
                            className="text-astronaut-500 underline"
                          >
                            분석 결과
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      <div className="pointer-events-auto">
        {showAnalysisResultModal && analysisResult && (
          <Modal close={onCloseAnalysisModal} title="분석 결과">
            <AnalysisResultModal
              imgURL={resultPreviewURL}
              imgSize={resultPreviewSize}
              result={analysisResult}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Alert;
