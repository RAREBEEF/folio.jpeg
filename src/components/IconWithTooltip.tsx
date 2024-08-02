import { ReactNode } from "react";
import Tooltip from "./Tooltip";

const IconWithTooltip = ({
  children,
  text,
  tooltipDirection,
}: {
  children: ReactNode;
  text: string;
  tooltipDirection: "left" | "right" | "bottom" | "top";
}) => {
  return (
    <div className="group relative h-full w-full">
      {children}
      <Tooltip text={text} direction={tooltipDirection} />
    </div>
  );
};

export default IconWithTooltip;
