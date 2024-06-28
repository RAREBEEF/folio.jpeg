import { alertState } from "@/recoil/states";
import { useSetRecoilState } from "recoil";

const useErrorAlert = () => {
  const setAlert = useSetRecoilState(alertState);

  const showErrorAlert = () => {
    setAlert({
      text: "문제가 발생하였습니다.",
      show: true,
      createdAt: Date.now(),
      type: "warning",
    });
  };

  return showErrorAlert;
};

export default useErrorAlert;
