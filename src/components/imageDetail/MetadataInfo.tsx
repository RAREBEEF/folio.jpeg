import { ImageData } from "@/types";

const MetadataInfo = ({
  showInfo,
  infoPos,
  disableHoverInfo,
  imageData,
}: {
  showInfo: boolean;
  infoPos: [number, number];
  disableHoverInfo: boolean;
  imageData: ImageData;
}) => {
  return (
    <div
      id="metadata-info"
      style={{
        top: `${infoPos[1]}px`,
        left: `${infoPos[0]}px`,
      }}
      className={`${disableHoverInfo && "min-w-[250px] translate-x-[-100%]"} pointer-events-none ${!showInfo && "invisible"} fixed max-h-[90%] w-fit max-w-[90%] rounded-xl p-2 text-xs backdrop-blur-sm backdrop-brightness-50`}
    >
      <div
        style={{
          background: imageData.themeColor,
        }}
        className="absolute left-0 top-0 h-full w-full rounded-xl opacity-10"
      />
      <div className="flex flex-col gap-1 text-astronaut-50">
        <div className="relative z-50 flex">
          <h3>카메라 모델명: </h3>
          <span className="pl-2 font-semibold">
            {imageData?.metadata?.model || "--"}
          </span>
        </div>
        <div className="relative z-50 flex flex-wrap">
          <h3>렌즈 모델명: </h3>
          <span className="pl-2 font-semibold">
            {imageData?.metadata?.lensModel || "--"}
          </span>
        </div>
        <div className="relative z-50 flex">
          <h3>초점 거리: </h3>
          <span className="pl-2 font-semibold">
            {imageData?.metadata?.focalLength || "--"}
          </span>
        </div>
        <div className="relative z-50 flex">
          <h3>셔터스피드: </h3>
          <span className="pl-2 font-semibold">
            {imageData?.metadata?.shutterSpeed || "--"}
          </span>
        </div>
        <div className="relative z-50 flex">
          <h3>조리개: </h3>
          <span className="pl-2 font-semibold">
            {imageData?.metadata?.fNumber || "--"}
          </span>
        </div>
        <div className="relative z-50 flex">
          <h3>ISO: </h3>
          <span className="pl-2 font-semibold">
            {imageData?.metadata?.ISO || "--"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetadataInfo;
