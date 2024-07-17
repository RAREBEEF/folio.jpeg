import { model } from "@/fb";
import useErrorAlert from "./useErrorAlert";
import { useState } from "react";
import { AnalysisResult } from "@/types";
import useFetchWithRetry from "./useFetchWithRetry";

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

const analyzing = async (targetImage: File): Promise<string> => {
  const imagePart = await fileToGenerativePart(targetImage);

  const prompt = `
    만약 이미지가 18세 미만에게 부적절한 내용은 선정적, 폭력적 등의 내용을 포함하고 있다면 "inappreciate" 를 반환하세요.
    그 외의 경우에는 분석 지침에 따라 이미지들을 분석하고 반환 양식에 맞춰 결과를 반환해주세요.
    
    반환 양식:
    { "tags": ["enTag1", "enTag2", "enTag3", ..., "koTag10"], "themeColor": "#000000", "feedback": { "detail": "이미지에 대한 자세한 피드백", "summary": {"good": "이미지에서 좋았던 부분", "improve": "해당 이미지에서 아쉬웠던, 다음 작품 활동에서 참고할만한 내용"} } }
        
    분석 지침:
    0. 각 필드는 다음과 같은 용도로 사용될 것을 염두에 두고 목적에 맞게 분석해주세요: 
      - tags: 이미지 분류
      - themeColor: 자리표시자
      - feedback: 이미지 제작자에게 피드백

    1. feedback 필드의 값은 한글로, 이외의 필드 값은 모두 영어로 작성해 주세요.

    2. 부적절한 이미지가 검출된 케이스와 구분하기 위해 분석 결과에 "inappreciate"를 포함하지 마세요.

    3. 태그 배열의 길이는 항상 20이어야 합니다.

    4. 총 태그 20개 중 영어 태그를 먼저 10개 생성한 뒤, 나머지 10개는 영어 태그를 한글로 번역하여 추가하세요.

    5. 이미지에서 가장 눈에 띄거나 많은 영역을 차지하는 색상을 추출해 themeColor에 할당하세요.

    6. 각 영어 태그는 모두 소문자여야 하며 공백과 기호는 모두 제거하세요.(예시: fast food -> fastfood, driver's license -> driverslicense).

    7. 각 태그는 비슷한 이미지끼리 묶이기 쉽도록 가능한 일반적인 단어를 사용해 주세요.

    8. 각 태그는 복수형이 아닌 단수형으로 작성해 주세요. (예시: flowers -> flower, buildings -> building)

    9. 분위기를 나타내는 태그는 아래 moodTags 중에서 가장 적합한 하나만 골라서 포함하세요.
      moodTags: [
        'calm', 'energetic', 'romantic', 'happy', 'sad', 'mysterious', 'dramatic', 'peaceful', 'nostalgic', 'vibrant',
        'serene', 'majestic', 'cozy', 'gloomy', 'bright', 'dark', 'rustic', 'lush',
        'urban', 'modern', 'historic', 'industrial', 'vintage', 'futuristic', 'quaint',
        'warm', 'cool', 'monochromatic', 'colorful', 'pastel', 'neutral'
      ]
      "한글번역용 moodTags": [
        "차분한", "활기찬", "로맨틱한", "행복한", "슬픈", "신비로운", "극적인", "평화로운", "향수를 불러일으키는", "활기찬",
        "고요한", "장엄한", "아늑한", "음울한", "밝은", "어두운", "소박한", "무성한",
        "도시의", "현대적인", "역사적인", "산업적인", "빈티지한", "미래적인", "예스러운",
        "따뜻한", "차가운", "단색의", "다채로운", "파스텔", "중립적인"
      ]
     9. 색상을 나타내는 태그는 아래 colorTags 중에서 가장 적합한 하나만 골라서 포함하세요. 가능한 themeColor와 비슷한 컬러로 골라 주세요.
      colorTags = [
        'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown', 'gray', 'black', 'white',
        'light red', 'dark red', 'light orange', 'dark orange', 'light yellow', 'dark yellow',
        'light green', 'dark green', 'light blue', 'dark blue', 'light purple', 'dark purple',
        'light pink', 'dark pink', 'light brown', 'dark brown', 'light gray', 'dark gray'
      ]
      "한글번역용 colorTags": [
        "빨간색", "주황색", "노란색", "초록색", "파란색", "보라색", "분홍색", "갈색", "회색", "검은색", "흰색",
        "연한 빨간색", "짙은 빨간색", "연한 주황색", "짙은 주황색", "연한 노란색", "짙은 노란색",
        "연한 초록색", "짙은 초록색", "연한 파란색", "짙은 파란색", "연한 보라색", "짙은 보라색",
        "연한 분홍색", "짙은 분홍색", "연한 갈색", "짙은 갈색", "연한 회색", "짙은 회색"
      ]

    11. 만약 이미지에 메인 피사체가 존재할 경우, 해당 피사체에 대한 태그를 하나 이상 tags에 포함하세요.

    12. 이미지의 배경이나 장소에 대한 태그를 하나 이상 tags에 포함하세요.

    13. feedback 필드에 대한 작성은 아래 지침에 따라주세요.
    이미지 제작자가(사진가, 일러스트레이터 등) 자신이 제작한 이미지에 대한 피드백을 요청합니다.
    이미지들에 대한 구도, 초점, 심도, 노출, 셔터스피드, ISO, 보정, 색감, 피사체, 그림체, 질감, 채색 등 이 외에도 다양한 영역을 바탕으로 이미지 제작자의 스킬을 전문가의 관점에서 최대한 자세하게 분석하여 500자 내외의 한국어로 “feedback” 객체의 “detail” 필드에 작성하세요.
    그리고 분석 결과를 바탕으로 이미지에서 좋았던 부분과 다음 작품에서는 개선했으면 하는 부분을 “feedback” 객체의 “summary” 필드 안에 있는 “good” 필드와 “improve” 필드에 각각 100자 이내로 요약하여 한국어로 작성하세요.
    주의할 점: 분석 결과는 이미지 제작자와 직접 대화하는 형태의 문장을 사용해 주세요. 다만 청자의 호칭이 명확하지 않으므로 대상을 직접적으로 호명하는 것은 피해주세요.
    `;
  // @ts-ignore
  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response;
  const text = response.text();

  return text;
};

const useAnalyzingImage = () => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const analyzingImageAsync = async ({
    targetImage,
  }: {
    targetImage: File;
  }): Promise<AnalysisResult | null> => {
    console.log("useAnalyzingImage");
    const result = await analyzing(targetImage);

    if (result.includes("inappreciate")) {
      return "inappreciate";
    } else {
      const jsonStringMatch = result.match(/\{[\s\S]*\}/);
      const jsonString = jsonStringMatch?.[0] || "";
      return JSON.parse(jsonString) as AnalysisResult;
    }
  };

  const analyzingImage = async ({ targetImage }: { targetImage: File }) => {
    if (isLoading) return null;
    setIsLoading(true);

    try {
      return await fetchWithRetry({
        asyncFn: analyzingImageAsync,
        args: { targetImage },
        retries: 1,
      });
    } catch (error) {
      showErrorAlert();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, analyzingImage };
};

export default useAnalyzingImage;
