"use client";

import { useRecoilValue } from "recoil";
import { imageItemState } from "@/recoil/states";

const ContactPage = () => {
  const imageItem = useRecoilValue(imageItemState("sample1"));
  console.log(imageItem);

  return <div>contact</div>;
};

export default ContactPage;
