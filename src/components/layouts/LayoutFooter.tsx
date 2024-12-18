"use client";

import { uploadStatusState } from "@/recoil/states";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecoilValue } from "recoil";

const LayoutFooter = () => {
  const pathname = usePathname();
  const uploadStatus = useRecoilValue(uploadStatusState);

  return pathname !== "/" ? (
    <div
      id="footer"
      className={`ml-[50px] border-t bg-white px-10 py-4 text-astronaut-950 transition-all xs:ml-0 ${uploadStatus.length > 0 && "xs:pb-36"}`}
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
        © 2024. RAREBEEF All Rights Reserved.
      </footer>
    </div>
  ) : null;
};

export default LayoutFooter;
