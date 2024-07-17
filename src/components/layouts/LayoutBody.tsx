"use client";

import { PropsWithChildren } from "react";
import LayoutNav from "./LayoutNav";

const LayoutBody: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    // LayoutHeader의 높이만큼 LayoutContent의 mt 조절하기
    <div id="body-nav-wrapper" className="mt-16 flex grow">
      <LayoutNav />
      <div
        id="body-wrapper"
        className={`ml-[50px] w-full min-w-[300px] transition-all xs:ml-0`}
      >
        {children}
      </div>
    </div>
  );
};

export default LayoutBody;
