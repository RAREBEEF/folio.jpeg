"use client";

import { PropsWithChildren } from "react";
import LayoutNav from "./LayoutNav";
import { useRecoilValue } from "recoil";
import { navState } from "@/recoil/states";

const LayoutContent: React.FC<PropsWithChildren> = ({ children }) => {
  const nav = useRecoilValue(navState);

  return (
    // LayoutHeader의 높이만큼 LayoutContent의 mt 조절하기
    <div className="mt-16 flex grow">
      <LayoutNav />
      <div
        style={{ minHeight: "calc(100lvh - 64px)" }}
        className={`w-full min-w-[320px] transition-all ${
          nav.show ? "ml-[200px]" : "ml-[30px]"
        } xs:ml-[30px]`}
      >
        {children}
      </div>
    </div>
  );
};

export default LayoutContent;
