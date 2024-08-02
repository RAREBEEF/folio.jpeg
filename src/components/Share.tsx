import ShareIcon from "@/icons/share-nodes-solid.svg";
import { useSetRecoilState } from "recoil";
import { alertsState } from "@/recoil/states";
import { uniqueId } from "lodash";
import Tooltip from "./Tooltip";
import IconWithTooltip from "./IconWithTooltip";

const Share = ({
  tooltipDirection = "top",
}: {
  tooltipDirection?: "left" | "right" | "top" | "bottom";
}) => {
  const setAlert = useSetRecoilState(alertsState);

  const onShareClick = async () => {
    const URL = window.location.href;
    const title = document.title;
    const desc =
      (document.querySelector('meta[name="description"]') as HTMLMetaElement)
        ?.content || "";

    try {
      navigator.share({
        url: URL,
        title: title,
        text: desc,
      });
    } catch (error) {
      try {
        navigator.clipboard.writeText(URL);
        setAlert((prev) => [
          ...prev,
          {
            id: uniqueId(),
            type: "success",
            text: "링크가 복사되었습니다.",
            show: true,
            createdAt: Date.now(),
          },
        ]);
      } catch (error) {
        setAlert((prev) => [
          ...prev,
          {
            id: uniqueId(),
            type: "warning",
            text: "링크 복사에 실패하였습니다.",
            show: true,
            createdAt: Date.now(),
          },
        ]);
      }
    }
  };
  return (
    <button onClick={onShareClick} className="group relative">
      <IconWithTooltip text="공유" tooltipDirection={tooltipDirection}>
        <ShareIcon className="h-7 fill-astronaut-700 p-1 transition-all hover:fill-astronaut-500" />
      </IconWithTooltip>
    </button>
  );
};

export default Share;
