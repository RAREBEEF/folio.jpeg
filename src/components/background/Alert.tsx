"use client";
import { alertState } from "@/recoil/states";
import { useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import CircleCheckIcon from "@/icons/circle-check-solid.svg";
import CircleExclamationIcon from "@/icons/circle-exclamation-solid.svg";

const Alert = () => {
  const [alert, setAlert] = useRecoilState(alertState);

  // 알림이 뜬 뒤 3초가 지났으면 알림창이 꺼지도록
  const alertCountdown = useCallback(() => {
    const { createdAt } = alert;

    if (createdAt && createdAt + 3000 <= Date.now()) {
      setAlert((prev) => ({ ...prev, createdAt: null, show: false }));
    }
  }, [alert, setAlert]);

  useEffect(() => {
    // 0.5초 간격으로 알림창 카운트다운 체크
    const interval = setInterval(alertCountdown, 500);

    return () => {
      clearInterval(interval);
    };
  }, [alertCountdown]);

  return (
    <div
      className={`text-astronaut-800 bg-astronaut-100 pointer-events-none fixed bottom-[50px] left-0 right-0 z-[10000] m-auto flex min-h-12 w-fit max-w-[90vw] select-none items-center justify-center gap-4 break-keep rounded-xl px-8 py-4 text-lg font-semibold shadow-lg transition-all ${!alert.show ? "translate-y-[300%]" : "translate-y-0"}`}
    >
      {alert.type === "success" ? (
        <CircleCheckIcon className="fill-astronaut-500 aspect-square h-8" />
      ) : alert.type === "warning" ? (
        <CircleExclamationIcon className="fill-astronaut-500 aspect-square h-8" />
      ) : null}
      <div className="whitespace-pre-line leading-tight">{alert.text}</div>
    </div>
  );
};

export default Alert;
