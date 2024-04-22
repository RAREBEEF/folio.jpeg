import { useRecoilState } from "recoil";
import { navState } from "./LayoutContent";
import Image from "next/image";
import Angles from "@/icons/angles-solid.svg";
import Link from "next/link";
import SnsLinks from "../components/SnsLinks";

const LayoutNav = () => {
  const [nav, setNav] = useRecoilState(navState);
  return (
    <nav
      className={`bg-shark-950 text-shark-50 fixed top-0 mt-24 flex h-full flex-col overflow-hidden pb-24 transition-all ${
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
          <Link href="/contact">Contact</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
        <li>
          <Link href="/contact">About</Link>
        </li>
      </ul>
      <SnsLinks />
    </nav>
  );
};

export default LayoutNav;
