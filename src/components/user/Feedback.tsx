import useAnalyzingRecentImages from "@/hooks/useAnalyzingRecentImages";
import { Feedback as FeedbackType } from "@/types";
import { MouseEvent, useEffect, useState } from "react";
import Button from "../Button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/fb";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { alertState, authStatusState } from "@/recoil/states";
import useDateDiffNow from "@/hooks/useDateDiffNow";
import geminiLogo from "@/images/gemini-logo.png";
import Image from "next/image";
import InformationSvg from "@/icons/circle-question-regular.svg";
import Modal from "@/components/modal/Modal";
import UploadLoading from "@/components/loading/UploadLoading";

const Feedback = () => {
  const [showInformationModal, setShowInformationModal] =
    useState<boolean>(false);
  const setAlert = useSetRecoilState(alertState);
  const dateDiffNow = useDateDiffNow();
  const authStatus = useRecoilValue(authStatusState);
  const { analyzingRecentImages, isLoading } = useAnalyzingRecentImages();
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [prevFeedback, setPrevFeedback] = useState<{
    feedback: FeedbackType | null;
    createdAt: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const onAnalyzingStartClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading || !prevFeedback) return;

    // 이전 분석이 1일 전인지 확인
    const { days: diffDays } = dateDiffNow(prevFeedback.createdAt);

    // 하루가 지나지 않았다면
    if (diffDays <= 0) {
      setAlert({
        type: "warning",
        createdAt: Date.now(),
        text: "AI 분석은 1일 1회만 가능합니다.",
        show: true,
      });
    } else if (
      window.confirm("분석은 1일 1회로 제한됩니다. 지금 분석하시겠습니까?")
    ) {
      setIsAnalyzing(true);
      const result = await analyzingRecentImages(prevFeedback.createdAt);
      // 신규 이미지가 5장보다 적으면
      if (result === "Less than 5 new images") {
        setAlert({
          type: "warning",
          createdAt: Date.now(),
          text: "최근 분석 이후에 업로드 된 이미지가 5장 이상 필요합니다.",
          show: true,
        });
      } else {
        setFeedback(result);
      }
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!authStatus.data || prevFeedback) return;
    const uid = authStatus.data.uid;

    (async () => {
      console.log("이전 분석 불러오기");
      const docRef = doc(db, "users", uid, "feedback", "data");
      const docSnap = await getDoc(docRef);
      const data = docSnap.data() as {
        feedback: FeedbackType | null;
        createdAt: number;
      };
      if (!data.feedback || Object.keys(data.feedback).length <= 0) {
        setPrevFeedback({ ...data, feedback: null });
      } else {
        setPrevFeedback(data);
      }
    })();
  }, [authStatus.data, prevFeedback]);

  const onImformationClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowInformationModal(true);
  };

  const onCloseInformationModal = () => {
    setShowInformationModal(false);
  };

  return (
    <div className="m-auto mb-8 w-[80%] break-keep rounded bg-shark-100 p-4">
      <h3 className="mb-2 flex items-center gap-2 font-semibold leading-tight">
        <Image src={geminiLogo} alt="Gemini AI logo" width="30" height="30" />
        Google Gemini AI 이미지 분석
        <button onClick={onImformationClick}>
          <InformationSvg className="h-[15px] fill-shark-700" />
        </button>
      </h3>
      <div className="p-2">
        <div className="pb-8 pt-4 leading-tight">
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
            <div className="text-shark-700">
              아직 분석 결과가 없습니다. 이미지를 5장 이상 업로드하고 분석을
              요청해 보세요.
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={onAnalyzingStartClick}>
            <div className="text-xs">AI에게 분석 요청</div>
          </Button>
        </div>
      </div>
      {showInformationModal && (
        <Modal close={onCloseInformationModal} title="Gemini AI 이미지 분석">
          <ul className="flex flex-col gap-4 break-keep p-8 pt-0">
            <li>
              <h3 className="text-lg font-semibold">Gemini AI란?</h3>
              <div className="pl-1">
                구글의 차세대 인공지능 챗봇으로, Gemini를 통해 구글의 AI에 직접
                엑세스할 수 있습니다.
              </div>
            </li>
            <li>
              <h3 className="text-lg font-semibold">이미지 분석</h3>
              <div className="pl-1">
                Gemini에게 사용자가 최근 업로드한 10개 이미지를 분석해 좋았던
                점과 아쉬운 점을 도출해내도록 요청합니다.
              </div>
            </li>
            <li>
              <h3 className="text-lg font-semibold">제한 사항</h3>
              <div className="pl-1">
                최근 이미지 분석 요청은 1일 1회로 제한되며, 마지막 요청 이후
                최소 5개의 이미지가 신규 업로드 된 경우에만 가능합니다. 이 제한
                사항은 이후 조정될 수 있습니다.
              </div>
            </li>
          </ul>
        </Modal>
      )}
      {isAnalyzing && (
        <div className="fixed left-0 top-0 z-50 h-screen w-screen">
          <div className="h-full w-full bg-shark-950 opacity-30" />
          <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-[50%] min-w-[300px] rounded-lg bg-shark-50">
            <UploadLoading />
            <div className="text-balance break-keep px-8 pb-8 text-center leading-tight text-shark-700">
              이미지를 분석하고 있습니다.
              <br />
              창을 닫지 마세요.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
