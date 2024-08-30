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
    profileImage,
    displayName,
    displayId,
  }: {
    profileImage: File | null;
    displayName: string;
    displayId: string;
  }): Promise<ProfileAnalysisResult> => {
    console.log("useAnalyzingImage");

    const prompt = `
    사용자의 displayName, displayId, profileImage(선택)이 포함된 프로필 데이터에 부적절한 콘텐츠가 포함되었는지 여부를 확인하고 양식에 맞춰 반환하세요.
    여기서 부적절한 콘텐츠란 욕설, 고어 등 과도한 폭력성, 나체 및 성적인 표현 등 과도한 선정성, 인종차별/성차별/고인모독 등 혐오 발언, 관리자 사칭 등 사기 또는 기만 행위, 약물 및 범죄 행위, 정치 및 사회적 논란, 특정 성향에 과도하게 치우친 사이트에서 사용되는 신조어, 그리고 상기 나열되지 않았지만 그 외의 다양한 문제의 소지가 있는 텍스트 및 이미지를 말합니다. 

    사용자의 프로필 데이터는 다음과 같습니다.
    displayName: ${displayName}
    displayId: ${displayId}
    profileImage(선택): 같이 전달된 이미지

    분석 결과는 아래 양식에 맞춰 각 항목에 문제가 없으면 true, 문제가 있으면 false를 반환해 주세요. 프로필 이미지의 경우 전달된 이미지가 없으면 true를 반환해 주세요.
    {displayNameValid: boolean, displayIdValid: boolean, profileImageValid: boolean } 
    `;

    const result = await gemini({ text: prompt, image: profileImage });
    const jsonStringMatch = result.match(/\{[\s\S]*\}/);
    const jsonString = jsonStringMatch?.[0] || "";

    return JSON.parse(jsonString) as ProfileAnalysisResult;
  };

  const analyzingProfile = async ({
    profileImage,
    displayName,
    displayId,
  }: {
    profileImage: File | null;
    displayName: string;
    displayId: string;
  }) => {
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: analyzingProfileAsync,
        args: {
          profileImage,
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
