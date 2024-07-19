import { ImageItem } from "@/types";

const MetadataInfo = ({
  showInfo,
  infoPos,
  disableHoverInfo,
  imageItem,
}: {
  showInfo: boolean;
  infoPos: [number, number];
  disableHoverInfo: boolean;
  imageItem: ImageItem;
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
          background: imageItem.themeColor,
        }}
        className="absolute left-0 top-0 h-full w-full rounded-xl opacity-10"
      />
      <div className="flex flex-col gap-1 text-astronaut-50">
        <div className="relative z-50 flex">
          <h3>카메라 모델명: </h3>
          <span className="pl-2 font-semibold">
            {imageItem?.metadata?.model ||
              imageItem?.customMetadata?.model ||
              "--"}
          </span>
        </div>
        <div className="relative z-50 flex flex-wrap">
          <h3>렌즈 모델명: </h3>
          <span className="pl-2 font-semibold">
            {imageItem?.metadata?.lensModel ||
              imageItem?.customMetadata?.lensModel ||
              "--"}
          </span>
        </div>
        <div className="relative z-50 flex">
          <h3>초점 거리: </h3>
          <span className="pl-2 font-semibold">
            {imageItem?.metadata?.focalLength ||
              imageItem?.customMetadata?.focalLength ||
              "--"}
            mm
          </span>
        </div>
        <div className="relative z-50 flex">
          <h3>셔터스피드: </h3>
          <span className="pl-2 font-semibold">
            {imageItem?.metadata?.shutterSpeed ||
              imageItem?.customMetadata?.shutterSpeed ||
              "--"}
            s
          </span>
        </div>
        <div className="relative z-50 flex">
          <h3>조리개: </h3>
          <span className="pl-2 font-semibold">
            f
            {imageItem?.metadata?.fNumber ||
              imageItem?.customMetadata?.fNumber ||
              "--"}
          </span>
        </div>
        <div className="relative z-50 flex">
          <h3>ISO: </h3>
          <span className="pl-2 font-semibold">
            {imageItem?.metadata?.ISO || imageItem?.customMetadata?.ISO || "--"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetadataInfo;
