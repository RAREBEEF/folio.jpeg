import uploadAnimation from "@/json/uploadAnimation.json";
import Lottie from "lottie-web";
import { useEffect, useRef } from "react";

const UploadLoading = () => {
  const animator = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animator.current) return;

    // const isDarkMode =
    //   window.matchMedia &&
    //   window.matchMedia("(prefers-color-scheme: dark)").matches;

    const animation = Lottie.loadAnimation({
      container: animator.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: uploadAnimation,
    });

    return () => {
      animation.destroy();
    };
  }, []);

  return <div className="m-auto mb-[-10%]" ref={animator} />;
};

export default UploadLoading;
