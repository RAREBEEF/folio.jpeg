import ArrowSvg from "@/icons/arrow-left-solid.svg";
import { ChangeEventHandler, ReactNode } from "react";

const Select = ({
  onChange,
  value,
  children,
}: {
  onChange: ChangeEventHandler<HTMLSelectElement>;
  value: string;
  children: ReactNode;
}) => {
  return (
    <div className="group relative w-fit">
      <select
        onChange={onChange}
        value={value}
        className="h-9 cursor-pointer rounded-lg bg-astronaut-100 pl-2 pr-6 text-astronaut-950 outline-none"
        name="folder"
        id="folder-select"
      >
        {children}
      </select>
      <ArrowSvg className="pointer-events-none absolute bottom-0 right-1 top-0 m-auto h-4 w-4 rotate-[270deg] fill-astronaut-500 transition-transform group-hover:translate-y-1 group-hover:fill-astronaut-700" />
    </div>
  );
};

export default Select;
