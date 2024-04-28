import FacebookSvg from "@/icons/facebook.svg";
import GithubSvg from "@/icons/github.svg";
import InstagramSvg from "@/icons/instagram.svg";
import TwitterSvg from "@/icons/twitter.svg";
import YoutubeSvg from "@/icons/youtube.svg";
import LinkedinSvg from "@/icons/linkedin.svg";
import TiktokSvg from "@/icons/tiktok.svg";
import Link from "next/link";
import { useRecoilValue } from "recoil";
import { navState } from "@/recoil/states";

const mySns: { [key in string]: string } = {
  github: "https://github.com/rarebeef",
  instagram: "https://github.com/rarebeef",
  facebook: "https://github.com/rarebeef",
  twitter: "https://github.com/rarebeef",
  youtube: "https://github.com/rarebeef",
  linkedin: "https://github.com/rarebeef",
  tiktok: "https://github.com/rarebeef",
};

const SnsLinks = () => {
  const nav = useRecoilValue(navState);
  const icons: { [key in string]: any } = {
    github: <GithubSvg className="fill-white" />,
    instagram: <InstagramSvg className="fill-white" />,
    facebook: <FacebookSvg className="fill-white" />,
    twitter: <TwitterSvg className="fill-white" />,
    youtube: <YoutubeSvg className="fill-white" />,
    linkedin: <LinkedinSvg className="fill-white" />,
    tiktok: <TiktokSvg className="fill-white" />,
  };

  return (
    <ul
      className={`grid h-fit w-full origin-top-left grid-cols-3 items-center gap-x-8 gap-y-3 px-[25px] py-[25px] transition-all ${nav.show ? "scale-100" : "scale-0"}`}
    >
      {Object.keys(mySns).map((key, i) => {
        return (
          <li key={i}>
            <Link href={mySns[key]}>{icons[key]}</Link>
          </li>
        );
      })}
    </ul>
  );
};
export default SnsLinks;
