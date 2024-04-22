"use client";

import { ReactElement } from "react";
import { RecoilRoot } from "recoil";

const RecoilProvider = ({ children }: { children: ReactElement }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

export default RecoilProvider;
