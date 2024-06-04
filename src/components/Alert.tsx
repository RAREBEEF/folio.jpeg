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
      className={`bg-alto-200 text-alto-900 pointer-events-none fixed bottom-24 left-0 right-0 z-50 m-auto flex min-h-12 w-fit select-none items-center justify-center gap-4 rounded-xl px-8 py-4 text-lg font-semibold shadow-lg transition-all ${!alert.show ? "translate-y-[300%]" : "translate-y-0"}`}
    >
      {alert.type === "success" ? (
        <CircleCheckIcon className="fill-alto-900 aspect-square h-8" />
      ) : alert.type === "warning" ? (
        <CircleExclamationIcon className="fill-alto-900 aspect-square h-8" />
      ) : null}
      <div className="break-keep leading-tight">{alert.text}</div>
    </div>
  );
};

export default Alert;
