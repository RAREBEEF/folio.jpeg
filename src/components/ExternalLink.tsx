import InstagramSvg from "@/icons/instagram.svg";
import GlobeSVG from "@/icons/globe-solid.svg";
import TiktokSVG from "@/icons/tiktok.svg";
import YoutubeSVG from "@/icons/youtube.svg";
import XTwitterSvg from "@/icons/x-twitter-brands-solid.svg";
import FacebookSvg from "@/icons/facebook.svg";
import GithubSvg from "@/icons/github.svg";
import { useEffect, useState } from "react";

const iconMap = {
  instagram: <InstagramSvg />,
  tiktok: <TiktokSVG />,
  youtube: <YoutubeSVG />,
  twitter: <XTwitterSvg />,
  facebook: <FacebookSvg />,
  github: <GithubSvg />,
  default: <GlobeSVG />,
};

const ExternalLink = ({ href }: { href: string }) => {
  const [icon, setIcon] = useState<JSX.Element>(<GlobeSVG />);
  const [text, setText] = useState<string>(href);

  useEffect(() => {
    if (href.includes("instagram.com")) {
      setIcon(iconMap.instagram);
      setText("Instagram");
    } else if (href.includes("tiktok.com")) {
      setIcon(iconMap.tiktok);
      setText("Tiktok");
    } else if (href.includes("youtube.com")) {
      setIcon(iconMap.youtube);
      setText("Youtube");
    } else if (href.includes("x.com") || href.includes("twitter.com")) {
      setIcon(iconMap.twitter);
      setText("Twitter");
    } else if (href.includes("facebook.com")) {
      setIcon(iconMap.facebook);
      setText("Facebook");
    } else if (href.includes("github.com")) {
      setIcon(iconMap.github);
      setText("Github");
    } else {
      setIcon(iconMap.default);
      setText(href);
    }
  }, [href]);

  return (
    <div className="flex h-fit w-fit">
      <span className="flex items-center justify-center gap-x-1">
        <span className="flex aspect-square h-full items-center">{icon}</span>
        <span className="break-keep">{text}</span>
      </span>
    </div>
  );
};

export default ExternalLink;
