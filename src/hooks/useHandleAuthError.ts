import { FirebaseError } from "firebase/app";

const useHandleAuthError = () => {
  const handleAuthError = (error: FirebaseError | unknown) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/invalid-email":
          return "유효하지 않은 이메일입니다.";
        case "auth/missing-password":
          return "비밀번호를 입력해주세요.";
        case "auth/weak-password":
          return "비밀번호는 최소 6자리 이상이어야 합니다.";
        case "auth/invalid-credential":
          return "이메일 혹은 비밀번호가 일치하지 않습니다.";
        case "auth/email-already-in-use":
          return "이미 사용 중인 이메일입니다.";
        default:
          console.log(error);
          return "문제가 발생하였습니다. 다시 시도해 주세요.";
      }
    } else {
      return "문제가 발생하였습니다. 다시 시도해 주세요.";
    }
  };

  return handleAuthError;
};

export default useHandleAuthError;
