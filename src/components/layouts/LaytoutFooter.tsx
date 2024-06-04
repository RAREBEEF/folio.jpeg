"use client";

import Link from "next/link";
import { useRecoilValue } from "recoil";
import { navState } from "@/recoil/states";

const LayoutFooter = () => {
  const nav = useRecoilValue(navState);
  return (
    // <div
    //   className={`bg-shark-950 px-10 py-4 text-shark-50 transition-all ${
    //     nav.show ? "ml-[200px]" : "ml-[50px]"
    //   }`}
    // >
    <div
      className={`ml-[50px] bg-shark-950 px-10 py-4 text-shark-50 transition-all`}
    >
      <nav className="mx-auto mb-6 max-w-[1300px]">
        <ul className="flex gap-x-24 *:flex *:flex-col *:gap-2">
          <li>
            <h4 className="text-sm font-bold">DEVELOPER</h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link
                  href="https://www.rarebeef.co.kr/"
                  className="hover:underline"
                >
                  HOMPAGE
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/RAREBEEF/"
                  className="hover:underline"
                >
                  GITHUB
                </Link>
              </li>
              <li>
                <Link
                  href="https://velog.io/@drrobot409/"
                  className="hover:underline"
                >
                  BLOG
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <footer className="text-balance break-keep text-center text-xs">
        © 2023. RAREBEEF All Rights Reserved.
      </footer>
    </div>
  );
};

export default LayoutFooter;
