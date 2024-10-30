import { ImageData } from "@/types";
import { MouseEvent } from "react";
import UnsaveSvg from "@/icons/bookmark-solid.svg";
import SaveSvg from "@/icons/bookmark-regular.svg";
import useSave from "@/hooks/useSave";
import IconWithTooltip from "../IconWithTooltip";

const SaveButton = ({
  imageData,
  color = "white",
  tooltip = false,
}: {
  imageData: ImageData;
  color?: "white" | "gray";
  tooltip?: boolean;
}) => {
  const { isSaved, save } = useSave({ imageData });

  // 저장 버튼 클릭
  const onSaveClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await save();
  };

  return (
    <button onClick={onSaveClick} className="pointer-events-auto h-full">
      {tooltip ? (
        <IconWithTooltip text="이미지 저장" tooltipDirection="top">
          {isSaved ? (
            <UnsaveSvg
              className={`w-full ${color === "white" ? "fill-astronaut-50" : "fill-astronaut-500"}`}
            />
          ) : (
            <SaveSvg
              className={`w-full ${color === "white" ? "fill-astronaut-50" : "fill-astronaut-500"}`}
            />
          )}
        </IconWithTooltip>
      ) : isSaved ? (
        <UnsaveSvg
          className={`w-full ${color === "white" ? "fill-astronaut-50" : "fill-astronaut-500"}`}
        />
      ) : (
        <SaveSvg
          className={`w-full ${color === "white" ? "fill-astronaut-50" : "fill-astronaut-500"}`}
        />
      )}
    </button>
  );
};
export default SaveButton;
