import { useRecoilState } from "recoil";
import Modal from "./Modal";
import { loginModalState } from "@/recoil/states";
import ProfileForm from "../user/ProfileForm";
import SignInForm from "../user/SignInForm";

const AuthModal = () => {
  // 로그인 모달창 state
  const [loginModal, setLoginModal] = useRecoilState(loginModalState);

  // 로그인 모달 닫는 함수
  const closeModal = () => {
    setLoginModal({ show: false });
  };

  return (
    loginModal.show && (
      <Modal
        close={closeModal}
        title={loginModal.showInit ? "프로필 설정하기" : "로그인"}
      >
        {loginModal.showInit ? <ProfileForm /> : <SignInForm />}
      </Modal>
    )
  );
};
export default AuthModal;
