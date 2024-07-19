import { alertsState } from "@/recoil/states";
import { uniqueId } from "lodash";
import { useSetRecoilState } from "recoil";

const useErrorAlert = () => {
  const setAlerts = useSetRecoilState(alertsState);

  const showErrorAlert = () => {
    setAlerts((prev) => [
      ...prev,
      {
        id: uniqueId(),
        text: "문제가 발생하였습니다.",
        show: true,
        createdAt: Date.now(),
        type: "warning",
      },
    ]);
  };

  return showErrorAlert;
};

export default useErrorAlert;
