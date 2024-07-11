import Link from "next/link";

const LayoutFooter = () => {
  return (
    <div
      className={`bg-ebony-clay-950 text-ebony-clay-50 ml-[50px] px-10 py-4 transition-all xs:mb-[60px] xs:ml-0`}
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
