"use client";

import { PropsWithChildren } from "react";
import LayoutNav from "./LayoutNav";

import Alert from "@/components/background/Alert";

const LayoutBody: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    // LayoutHeader의 높이만큼 LayoutContent의 mt 조절하기
    <div className="mt-16 flex grow">
      <LayoutNav />
      <div
        style={{ minHeight: "calc(100lvh - 64px)" }}
        className={`ml-[50px] w-full min-w-[300px] transition-all`}
      >
        {children}
      </div>
      <Alert />
    </div>
  );
};

export default LayoutBody;
