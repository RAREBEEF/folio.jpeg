import { db, model } from "@/fb";
import { authStatusState } from "@/recoil/states";
import { Feedback, ImageData, UserFeedback } from "@/types";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";

const useAnalyzingRecentImages = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);

  const analyzingRecentImagesAsync = async ({
    prevFeedback,
  }: {
    prevFeedback: UserFeedback;
  }): Promise<Feedback | "Less than 5 new images" | null> => {
    const uid = authStatus.data?.uid;
    if (!uid) return null;

    // 최근 이미지들 불러오기
    const q = query(
      collection(db, "images"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(10),
    );
    const docSnap = await getDocs(q);

    const recentImageDatas: Array<ImageData> = [];
    docSnap.forEach((doc) => {
      recentImageDatas.push(doc.data() as ImageData);
    });

    const uploadAfterLastFeedback = recentImageDatas.filter(
      (imageData) => imageData.createdAt > prevFeedback.createdAt,
    );

    if (uploadAfterLastFeedback.length < 5) {
      return "Less than 5 new images";
    }

    const recentImageFeedbacks: Array<Feedback> = [...recentImageDatas].map(
      (imageData) => imageData.feedback,
    );

    // 분석하기
    const result = await analyzing(recentImageFeedbacks);

    // 결과
    const jsonStringMatch = result.match(/\{[\s\S]*\}/);
    const jsonString = jsonStringMatch?.[0] || "";
    const feedback = JSON.parse(jsonString);

    // db에 분석 결과 업데이트
    const docRef = doc(db, "users", uid, "feedback", "data");
    await setDoc(docRef, { createdAt: Date.now(), feedback });

    return feedback;
  };

  const analyzingRecentImages = async ({
    prevFeedback,
  }: {
    prevFeedback: UserFeedback;
  }): Promise<Feedback | "Less than 5 new images" | null> => {
    if (!authStatus.data?.uid || isLoading) return null;
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: analyzingRecentImagesAsync,
        args: { prevFeedback },
      });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzingRecentImages, isLoading };
};

const analyzing = async (recentFeedbacks: Array<Feedback>): Promise<string> => {
  // const imageParts = await Promise.all(
  //   [...targetImages].map((image) => fileToGenerativePart(image)),
  // );

  const prompt = `
    분석 지침에 따라 분석하고 반환 양식에 맞춰 결과를 반환해주세요.

    반환 양식: 
     {"detail": "Detailed image analysis results", "summary": {"good": "Something that you can compliment in the photos you took", "improve": "What to improve in the photos you took"}} 
     
    분석 지침: 
    이미지 제작자가(사진가, 일러스트레이터 등) 자신이 최근에 제작한 이미지(최대 10장)에 대한 피드백을 요청합니다.
    해당 이미지들에 대한 이전 피드백들의 데이터가 존재합니다. 이 피드백 데이터들을 아래 내용에 맞춰 종합해주세요.
    이미지들에 대한 구도, 초점, 심도, 노출, 셔터스피드, ISO, 보정, 색감, 피사체, 그림체, 질감, 채색 등 이 외에도 다양한 영역을 바탕으로 이미지 제작자의 스킬을 전문가의 관점에서 최대한 자세하게 분석하여 500자 이내의 한국어로 “feedback” 객체의 “detail” 필드에 작성하세요.
    그리고 분석 결과를 바탕으로 최근 이미지들에서 좋았던 부분과 다음 작품에서는 개선했으면 하는 부분을 “feedback” 객체의 “summary” 필드 안에 있는 “good” 필드와 “improve” 필드에 각각 100자 이내로 요약하여 한국어로 작성하세요.
    주의할 점: 분석한 이미지에 대한 묘사를 피하고 사진들에서 전체적으로 좋았던 부분, 아쉬웠던 부분, 제작자의 좋은 스킬, 부족한 스킬 등에 중점적으로 분석하세요. 분석 결과는 이미지 제작자와 직접 대화하는 형태의 문장을 사용해 주세요. 다만 청자의 호칭이 명확하지 않으므로 대상을 직접적으로 호명하는 것은 피해주세요.

    이미지들에 대한 피드백 데이터는 아래와 같습니다:
    ${JSON.stringify(recentFeedbacks)}
    `;
  // @ts-ignore
  const result = await model.generateContent([prompt]);
  const response = result.response;
  const text = response.text();

  return text;
};

export default useAnalyzingRecentImages;
