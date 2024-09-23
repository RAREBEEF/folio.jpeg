import { model } from "@/fb";
import useErrorAlert from "./useErrorAlert";
import { useState } from "react";
import useFetchWithRetry from "./useFetchWithRetry";
import useGemini from "./useGemini";
import { ProfileAnalysisResult } from "@/types";

const useAnalyzingProfile = () => {
  const { gemini } = useGemini();
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const analyzingProfileAsync = async ({
    // profileImage,
    displayName,
    displayId,
  }: {
    // profileImage: File | null;
    displayName: string;
    displayId: string;
  }): Promise<ProfileAnalysisResult> => {
    console.log("useAnalyzingImage");

    const prompt = `
    사용자의 displayName, displayId, profileImage(선택)이 포함된 프로필 데이터에 18세 미만 혹은 통상적인 커뮤니티 가이드라인에 위배되는 부적절한 콘텐츠가 포함되었는지 여부를 확인하고 양식에 맞춰 반환하세요.

    사용자의 프로필 데이터는 다음과 같습니다.
    displayName: ${displayName}
    displayId: ${displayId}
    profileImage(선택): 같이 전달된 이미지

    분석 결과는 아래 양식에 맞춰 각 항목에 문제가 없으면 true, 문제가 있으면 false를 반환해 주세요. 프로필 이미지의 경우 전달된 이미지가 없으면 true를 반환해 주세요.
    정확한 분석이 불가능한 경우에도 최소한의 분석을 시도해 주세요. 결과는 !반드시! 아래 양식을 준수하여 반환해주세요.
    {displayNameValid: boolean, displayIdValid: boolean, profileImageValid: boolean } 
    `;

    const result = await gemini({
      text: prompt,
      //  image: profileImage
    });
    const jsonStringMatch = result.match(/\{[\s\S]*\}/);
    const jsonString = jsonStringMatch?.[0] || "";

    return JSON.parse(jsonString) as ProfileAnalysisResult;
  };

  const analyzingProfile = async ({
    // profileImage,
    displayName,
    displayId,
  }: {
    // profileImage: File | null;
    displayName: string;
    displayId: string;
  }) => {
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: analyzingProfileAsync,
        args: {
          // profileImage,
          displayName,
          displayId,
        },
        retries: 1,
      });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, analyzingProfile };
};

export default useAnalyzingProfile;
