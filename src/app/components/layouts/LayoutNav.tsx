"use client";

import { useRecoilState } from "recoil";
import Angles from "@/icons/angles-solid.svg";
import Link from "next/link";
import SnsLinks from "@/app/components/SnsLinks";
import { navState } from "@/recoil/states";
import { useEffect, useState } from "react";
import * as _ from "lodash";

const LayoutNav = () => {
  const [nav, setNav] = useRecoilState(navState);
  const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const windowResizeListener = _.debounce((e: Event) => {
      if (innerWidth !== window.innerWidth && window.innerWidth <= 550) {
        setNav({ show: false });
      }
      setInnerWidth(window.innerWidth);
    }, 100);

    window.addEventListener("resize", windowResizeListener);

    return () => {
      window.removeEventListener("resize", windowResizeListener);
    };
  }, [innerWidth, setNav]);

  return (
    <nav
      className={`fixed top-0 z-50 mt-16 flex h-full flex-col overflow-hidden overflow-y-scroll bg-shark-950 pb-24 text-shark-50 transition-all ${
        nav.show ? "w-[200px]" : "w-[30px]"
      }`}
    >
      <button
        className={`absolute right-[2.5px] top-[2.5px] h-[25px] w-[25px] transition-all ${
          nav.show ? "scale-x-[-100%]" : "scale-x-100"
        }`}
        onClick={(e) => {
          e.preventDefault();
          setNav((prev) => ({ show: !prev.show }));
        }}
      >
        <Angles className="fill-white" />
      </button>
      <ul
        className={`mt-16 flex grow origin-top-left flex-col gap-6 pr-[25px] text-end text-lg font-bold transition-all ${nav.show ? "scale-100" : "scale-0"}`}
      >
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/login">Sign in</Link>
        </li>
        <li>
          <Link href="/upload">Upload</Link>
        </li>
      </ul>
      <SnsLinks />
    </nav>
  );
};

export default LayoutNav;
