import useAnalyzingRecentImages from "@/hooks/useAnalyzingRecentImages";
import { Feedback as FeedbackType, UserData, UserFeedback } from "@/types";
import { MouseEvent, useEffect, useRef, useState } from "react";
import Button from "../Button";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { alertsState, authStatusState } from "@/recoil/states";
import useDateDiffNow from "@/hooks/useDateDiffNow";
import geminiLogo from "@/images/gemini-logo.png";
import Image from "next/image";
import InformationSvg from "@/icons/circle-question-regular.svg";
import Modal from "@/components/modal/Modal";
import UploadLoading from "@/components/loading/UploadLoading";
import useGetFeedback from "@/hooks/useGetFeedback";
import { uniqueId } from "lodash";
import GeminiInfoModal from "../modal/GeminiInfoModal";

const AiFeedback = ({ userData }: { userData: UserData }) => {
  const isInitialMount = useRef(true);
  const [showInformationModal, setShowInformationModal] =
    useState<boolean>(false);
  const setAlerts = useSetRecoilState(alertsState);
  const dateDiffNow = useDateDiffNow();
  const authStatus = useRecoilValue(authStatusState);
  const { analyzingRecentImages, isLoading: isAnalyzing } =
    useAnalyzingRecentImages();
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [prevFeedback, setPrevFeedback] = useState<UserFeedback | null>(null);
  const { isLoading: isFeedbackLoading, getFeedback } = useGetFeedback();

  const handleBeforeUnload = (event: any) => {
    event.preventDefault();
    event.returnValue = "";
    return "";
  };

  useEffect(() => {
    if (isAnalyzing) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAnalyzing]);

  const onAnalyzingStartClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      isAnalyzing ||
      !prevFeedback ||
      !authStatus.data ||
      userData.uid !== authStatus.data?.uid
    )
      return;

    // 이전 분석이 1일 전인지 확인
    const { days: diffDays } = dateDiffNow(prevFeedback.createdAt);

    // 하루가 지나지 않았다면
    if (prevFeedback.createdAt && diffDays <= 0) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          type: "warning",
          createdAt: Date.now(),
          text: "AI 분석은 1일 1회만 가능합니다.",
          show: true,
        },
      ]);
    } else if (
      window.confirm("분석은 1일 1회로 제한됩니다. 지금 분석하시겠습니까?")
    ) {
      const result = await analyzingRecentImages({ prevFeedback });
      // 신규 이미지가 5장보다 적으면
      if (result === "Less than 5 new images") {
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            type: "warning",
            createdAt: Date.now(),
            text: "최근 분석 이후에 업로드 된 이미지가 5장 이상 필요합니다.",
            show: true,
          },
        ]);
      } else {
        setPrevFeedback((prev) => {
          if (!prev) return null;
          return { ...prev, createdAt: Date.now() };
        });
        setFeedback(result);
      }
    }
  };

  // 이전 분석 결과 불러오기
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } else if (prevFeedback || isFeedbackLoading || !userData) {
      return;
    }
    (async () => {
      const feedback = await getFeedback({ uid: userData.uid });
      if (!feedback) return;
      setPrevFeedback(feedback);
    })();
  }, [getFeedback, isFeedbackLoading, prevFeedback, userData]);

  const onInformationClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowInformationModal(true);
  };

  const onCloseInformationModal = () => {
    setShowInformationModal(false);
  };

  return (
    <div className="m-auto mb-8 w-[80%] break-keep rounded bg-astronaut-50 p-4">
      <h3 className="mb-2 flex items-center gap-2 font-semibold leading-tight">
        <Image src={geminiLogo} alt="Gemini AI logo" width="30" height="30" />
        Google Gemini AI 이미지 분석
        <button onClick={onInformationClick}>
          <InformationSvg className="h-[15px] fill-astronaut-700" />
        </button>
      </h3>
      <div className="p-2">
        <div className="pb-8 pt-4 leading-snug">
          {feedback ? (
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-semibold">분석 결과</h4>
                <div className="pl-1 pt-1">{feedback.detail}</div>
              </div>
              <div>
                <h4 className="font-semibold">좋은 점</h4>
                <div className="pl-1 pt-1">{feedback.summary.good}</div>
              </div>
              <div>
                <h4 className="font-semibold">아쉬운 점</h4>
                <div className="pl-1 pt-1">{feedback.summary.improve}</div>
              </div>
            </div>
          ) : prevFeedback?.feedback ? (
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-semibold">분석 결과</h4>
                <div className="pl-1 pt-1">{prevFeedback.feedback.detail}</div>
              </div>
              <div>
                <h4 className="font-semibold">좋은 점</h4>
                <div className="pl-1 pt-1">
                  {prevFeedback.feedback.summary.good}
                </div>
              </div>
              <div>
                <h4 className="font-semibold">아쉬운 점</h4>
                <div className="pl-1 pt-1">
                  {prevFeedback.feedback.summary.improve}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-astronaut-700">
              아직 분석 결과가 없습니다.
              <br />
              {authStatus.data?.uid === userData.uid && (
                <span>이미지를 5장 이상 업로드하고 분석을 요청해 보세요.</span>
              )}
            </div>
          )}
        </div>
        {authStatus.data?.uid === userData.uid && (
          <div className="flex justify-end">
            <Button onClick={onAnalyzingStartClick}>
              <div className="text-xs">AI에게 분석 요청</div>
            </Button>
          </div>
        )}
      </div>
      {showInformationModal && (
        <Modal close={onCloseInformationModal} title="Gemini AI 이미지 분석">
          <GeminiInfoModal />
        </Modal>
      )}
      {isAnalyzing && (
        <div className="fixed left-0 top-0 z-50 h-screen w-screen">
          <div
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            className="h-full w-full"
          />
          <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-[50%] min-w-[300px] rounded-lg bg-white">
            <UploadLoading />
            <div className="text-balance break-keep px-8 pb-8 text-center font-semibold leading-tight text-astronaut-800">
              최근 이미지 피드백을 분석하고 있습니다.
              <br />
              창을 닫지 마세요.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiFeedback;
