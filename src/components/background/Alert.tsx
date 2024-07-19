"use client";
import { alertsState } from "@/recoil/states";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import CircleCheckIcon from "@/icons/circle-check-solid.svg";
import CircleExclamationIcon from "@/icons/circle-exclamation-solid.svg";
import _ from "lodash";

const Alert = () => {
  const [alerts, setAlerts] = useRecoilState(alertsState);
  const [needToSetCleanUp, setNeedToSetCleanUp] = useState<boolean>(false);

  useEffect(() => {
    if (alerts.filter((alert) => !alert.cleanUp).length > 0) {
      setNeedToSetCleanUp(true);
    } else {
      setNeedToSetCleanUp(false);
    }
  }, [alerts]);

  useEffect(() => {
    if (needToSetCleanUp) {
      setAlerts((prev) => {
        const newAlerts = prev.map((alert) => {
          const { id, cleanUp, duration } = alert;
          if (!cleanUp && duration !== -1) {
            setTimeout(() => {
              setAlerts((prev) => prev.filter((alert) => alert.id !== id));
            }, duration || 3000);
          }
          return {
            ...alert,
            cleanUp: true,
          };
        });

        return newAlerts;
      });
    }
  }, [setAlerts, needToSetCleanUp]);

  return (
    <div className="oveerflow-visible pointer-events-none fixed bottom-[50px] left-0 right-0 z-[10000] m-auto flex w-screen flex-col items-center justify-end gap-4 xs:bottom-[80px]">
      <div className="flex w-full flex-col items-center">
        {alerts
          .filter((alert) => alert.fixed)
          .map((alert) => (
            <div
              key={alert.createdAt}
              className={`animate-alert mt-4 flex w-fit max-w-[90vw] select-none items-center gap-4 overflow-hidden break-keep rounded-xl bg-astronaut-100 px-8 text-lg font-semibold text-astronaut-800 shadow-lg`}
            >
              {alert.type === "success" ? (
                <CircleCheckIcon className="aspect-square h-8 fill-astronaut-500" />
              ) : alert.type === "warning" ? (
                <CircleExclamationIcon className="aspect-square h-8 fill-astronaut-500" />
              ) : null}
              <div className="my-4 whitespace-pre-line leading-tight">
                {alert.text}
              </div>
            </div>
          ))}
        {alerts
          .filter((alert) => !alert.fixed)
          .splice(-5)
          .map((alert) => (
            <div
              key={alert.createdAt}
              className={`animate-alert mt-4 flex w-fit max-w-[90vw] select-none items-center gap-4 overflow-hidden break-keep rounded-xl bg-astronaut-100 px-8 text-lg font-semibold text-astronaut-800 shadow-lg`}
            >
              {alert.type === "success" ? (
                <CircleCheckIcon className="aspect-square h-8 fill-astronaut-500" />
              ) : alert.type === "warning" ? (
                <CircleExclamationIcon className="aspect-square h-8 fill-astronaut-500" />
              ) : null}
              <div className="my-4 whitespace-pre-line leading-tight">
                {alert.text}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Alert;
