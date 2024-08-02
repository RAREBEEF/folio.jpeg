import { useEffect, useRef, useState } from "react";

const Tooltip = ({
  text,
  direction = "right",
}: {
  text: string;
  direction: "right" | "left" | "top" | "bottom";
}) => {
  const [translate, setTranslate] = useState<string>("");
  const [left, setLeft] = useState<string>("50%");
  const [top, setTop] = useState<string>("50%");
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tooltip = tooltipRef.current;

    if (!tooltip) {
      return;
    }
    const moveY = (tooltip.parentElement?.clientHeight || 0) * 1.5;
    const moveX = (tooltip.parentElement?.clientWidth || 0) * 1.5;

    switch (direction) {
      case "top":
        setTranslate(`translateX(-50%) translateY(calc(-50% + ${-moveY}px))`);
        break;
      case "bottom":
        setTranslate(`translateX(-50%) translateY(calc(-50% + ${moveY}px))`);
        break;
      case "left":
        setTranslate(`translateX(${-moveX}px) translateY(-50%)`);
        setLeft("auto");
        break;
      case "right":
        setTranslate(`translateX(${moveX}px) translateY(-50%)`);
        setLeft("auto");
        break;
    }
  }, [direction]);

  return (
    <div
      style={{ transform: translate, top, left }}
      ref={tooltipRef}
      className={`pointer-events-none absolute z-50 h-fit w-fit translate-x-[-50%] translate-y-[-50%] whitespace-nowrap rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-astronaut-500 opacity-0 shadow-lg transition-all group-hover:opacity-100 xs:hidden`}
    >
      {text}
    </div>
  );
};

export default Tooltip;
