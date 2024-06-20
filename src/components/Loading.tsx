"use client";
import DotSvg from "@/icons/circle-solid.svg";
import LoadingSvg from "@/icons/spinner-solid.svg";

const Loading = ({
  height = null,
  color = "shark-500",
}: {
  height?: string | null;
  color?: string;
}) => {
  return (
    <div
      style={{
        height: height || "24px",
      }}
      className="m-auto flex w-full items-center justify-center"
    >
      <div className="m-auto flex h-[50%] gap-2">
        <DotSvg className={`animate-loading-dot-1 fill-${color}`} />
        <DotSvg className={`animate-loading-dot-2 fill-${color}`} />
        <DotSvg className={`animate-loading-dot-3 fill-${color}`} />
      </div>
    </div>
  );
};
export default Loading;

{
  /* <LoadingSvg
        style={{ width }}
        className={`aspect-1/1 animate-spin-slow h-[100%] w-[50%] max-w-[150px] fill-shark-700`}
      /> */
}
