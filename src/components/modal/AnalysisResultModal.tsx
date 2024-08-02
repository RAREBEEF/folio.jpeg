import { AnalysisResult } from "@/types";
import Image from "next/image";

const AnalysisResultModal = ({
  result,
  imgURL,
  imgSize,
}: {
  result: AnalysisResult;
  imgURL: string | null | undefined;
  imgSize: { width: number; height: number } | null;
}) => {
  return result === "inappreciate" ? null : (
    <div className="flex flex-col gap-8 break-keep px-8 pb-12 pt-8">
      {imgURL && (
        <div
          style={{
            aspectRatio: `${imgSize?.width || 0}/${imgSize?.height || 0}`,
          }}
          className={`group relative sticky p-4`}
        >
          <Image
            className="rounded-xl"
            layout="fill"
            src={imgURL}
            alt={"target image"}
          />
        </div>
      )}
      <div>
        <h3 className="mb-2 text-lg font-semibold ">대표 색상</h3>
        <div
          className="mx-2 rounded p-2"
          style={{ background: result.themeColor }}
        >
          <div
            style={{
              color: result.themeColor,
              filter: "invert(1) grayscale(100%)",
            }}
          >
            {result.themeColor}
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold ">이미지 키워드</h3>
        <ul className="mx-2 flex flex-wrap gap-1">
          {Array.from(new Set(result.imgTags.concat(result.contentTags))).map(
            (tag, i) => (
              <li key={i}>#{tag}</li>
            ),
          )}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold ">AI의 분석</h3>
        <div className="mx-2 flex flex-col gap-2">
          <div>
            <div className="mx-2">{result.feedback.detail}</div>
          </div>
          <div>
            <h4 className="font-semibold">좋은 점</h4>
            <div className="mx-2">{result.feedback.summary.good}</div>
          </div>
          <div>
            <h4 className="font-semibold">아쉬운 점</h4>
            <div className="mx-2">{result.feedback.summary.improve}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultModal;
