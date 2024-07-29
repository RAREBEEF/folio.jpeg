"use client";

import { MouseEvent, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

const Error = ({ error, reset }: ErrorProps) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const onResetClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (pathname === "/") {
      reset();
    } else {
      replace("/");
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-white text-2xl font-bold">
      <div className="flex flex-col text-center">
        <div>문제가 발생하였습니다.</div>
        <div>잠시 후 다시 시도해 주세요.</div>
      </div>
      <button className="mt-12 text-base underline" onClick={onResetClick}>
        {pathname === "/" ? "새로고침" : "홈으로 돌아가기"}
      </button>
    </div>
  );
};

export default Error;
