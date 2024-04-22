"use client";

import { PropsWithChildren, ReactElement } from "react";
import LayoutNav from "./LayoutNav";
import { atom, useRecoilState, useRecoilValue } from "recoil";

export const navState = atom({
  key: "navState",
  default: { show: true },
});

const LayoutContent: React.FC<PropsWithChildren> = ({ children }) => {
  const nav = useRecoilValue(navState);

  return (
    <div className="mt-24 flex grow">
      <LayoutNav />
      <div
        className={`w-full transition-all ${
          nav.show ? "ml-[200px]" : "ml-[30px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default LayoutContent;
