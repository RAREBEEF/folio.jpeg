import { db, model } from "@/fb";
import { authStatusState } from "@/recoil/states";
import { Feedback, ImageData } from "@/types";
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

const useAnalyzingRecentImages = () => {
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);

  const analyzingRecentImages = async (
    lastFeedbackAt: number,
  ): Promise<Feedback | "Less than 5 new images" | null> => {
    if (!authStatus.data?.uid || isLoading) return null;
    setIsLoading(true);

    try {
      const uid = authStatus.data.uid;

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
        (imageData) => imageData.createdAt > lastFeedbackAt,
      );

      if (uploadAfterLastFeedback.length < 5) {
        return "Less than 5 new images";
      }

      const recentImageFiles: Array<File | null> = await Promise.all(
        [...recentImageDatas].map(
          async (imageData) => await imageDataToFile(imageData),
        ),
      );

      // 분석하기
      const result = await analyzing(
        recentImageFiles.filter((file) => file !== null) as Array<File>,
      );

      // 결과
      const jsonStringMatch = result.match(/\{[\s\S]*\}/);
      const jsonString = jsonStringMatch?.[0] || "";
      const feedback = JSON.parse(jsonString);

      // db에 분석 결과 업데이트
      const docRef = doc(db, "users", uid, "feedback", "data");
      await setDoc(docRef, { createdAt: Date.now(), feedback });

      return feedback;
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzingRecentImages, isLoading };
};

const imageDataToFile = async (imageData: ImageData): Promise<File | null> => {
  const { fileName, url } = imageData;
  const mimeType = getMimeType(fileName);

  if (!fileName || !url || !mimeType) return null;
  const response = await fetch(
    `/api/proxy/${url.replace("https://firebasestorage.googleapis.com/", "")}`,
  );

  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
};

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

const analyzing = async (targetImages: Array<File>): Promise<string> => {
  const imageParts = await Promise.all(
    [...targetImages].map((image) => fileToGenerativePart(image)),
  );

  const prompt = `
    분석 지침에 따라 이미지들을 분석하고 반환 양식에 맞춰 결과를 반환해주세요.

    반환 양식: 
     {"detail": "Detailed image analysis results", "summary": {"good": "Something that you can compliment in the photos you took", "improve": "What to improve in the photos you took"}} 
     
    분석 지침: 
    이미지 제작자가(사진가, 일러스트레이터 등) 자신이 최근에 제작한 이미지(최대 10장)에 대한 피드백을 요청합니다.
    이미지들에 대한 구도, 초점, 심도, 노출, 셔터스피드, ISO, 보정, 색감, 피사체, 그림체, 질감, 채색 등 이 외에도 다양한 영역을 바탕으로 이미지 제작자의 스킬을 전문가의 관점에서 최대한 자세하게 분석하여 500자 이내의 한국어로 “feedback” 객체의 “detail” 필드에 작성하세요.
    그리고 분석 결과를 바탕으로 최근 이미지들에서 좋았던 부분과 다음 작품에서는 개선했으면 하는 부분을 “feedback” 객체의 “summary” 필드 안에 있는 “good” 필드와 “improve” 필드에 각각 100자 이내로 요약하여 한국어로 작성하세요.
    주의할 점: 분석한 이미지에 대한 묘사를 피하고 사진들에서 전체적으로 좋았던 부분, 아쉬웠던 부분, 제작자의 좋은 스킬, 부족한 스킬 등에 중점적으로 분석하세요. 분석 결과는 이미지 제작자와 직접 대화하는 형태의 문장을 사용해 주세요. 다만 청자의 호칭이 명확하지 않으므로 대상을 직접적으로 호명하는 것은 피해주세요.
    `;
  // @ts-ignore
  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  const text = response.text();

  return text;
};

const mimeTypes: { [key: string]: string } = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

const getMimeType = (fileName: string): string | null => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext && mimeTypes[ext]) {
    return mimeTypes[ext];
  } else {
    return null;
  }
};

export default useAnalyzingRecentImages;
