import Button from "../Button";
import GithubSvg from "@/icons/github.svg";
import GoogleSvg from "@/icons/google.svg";
import FacebookSvg from "@/icons/facebook.svg";
import {
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GithubAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "@/fb";
import { FormEvent, MouseEvent, useState } from "react";
import Loading from "@/components/loading/Loading";
import useInput from "@/hooks/useInput";
import useHandleAuthError from "@/hooks/useHandleAuthError";
import { useSetRecoilState } from "recoil";
import { alertsState, authStatusState, loginModalState } from "@/recoil/states";
import _, { uniqueId } from "lodash";

const SignInFormModal = () => {
  const handleAuthError = useHandleAuthError();
  const setLoginModal = useSetRecoilState(loginModalState);
  const setAuthStatus = useSetRecoilState(authStatusState);
  const setAlerts = useSetRecoilState(alertsState);
  const [createAccount, setCreateAccount] = useState<boolean>(false);
  const [pwReset, setPwReset] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    value: email,
    setValue: setEmail,
    onChange: onEmailChange,
  } = useInput("");
  const { value: pw, setValue: setPw, onChange: onPwChange } = useInput("");
  const {
    value: pwCheck,
    setValue: setPwCheck,
    onChange: onPwCheckChange,
  } = useInput("");

  const onGoogleSignInClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential) return;

      const token = credential.accessToken;
      const user = result.user;
      setAuthStatus({
        status: "pending",
        data: _.cloneDeep(user),
      });
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "로그인 과정에서 문제가 발생하였습니다.",
        },
      ]);
    }
  };

  const onGithubSignInClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);

      if (!credential) return;

      const token = credential.accessToken;
      const user = result.user;
      setAuthStatus({
        status: "pending",
        data: _.cloneDeep(user),
      });
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "로그인 과정에서 문제가 발생하였습니다.",
        },
      ]);
    }
  };
  const onFacebookSignInClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = FacebookAuthProvider.credentialFromResult(result);

      if (!credential) return;

      const token = credential.accessToken;
      const user = result.user;
      setAuthStatus({
        status: "pending",
        data: _.cloneDeep(user),
      });
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "로그인 과정에서 문제가 발생하였습니다.",
        },
      ]);
    }
  };

  const onCovertSignInUpClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setCreateAccount((prev) => !prev);
    setPwReset(false);
  };

  const onConvertPwResetClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setPwReset((prev) => {
      if (!prev) {
        setCreateAccount(false);
      }
      return !prev;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "이메일을 입력해 주세요.",
        },
      ]);
      return;
    }

    if (!pwReset && !pw) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "비밀번호를 입력해 주세요.",
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      // 비밀번호 재설정
      if (pwReset) {
        await sendPasswordResetEmail(auth, email);
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "메일이 발송되었습니다.",
          },
        ]);
        // 회원가입
      } else if (createAccount) {
        if (pw !== pwCheck) {
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              show: true,
              type: "warning",
              createdAt: Date.now(),
              text: "비밀번호 확인이 일치하지 않습니다.",
            },
          ]);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, pw);
        setLoginModal({ show: false });
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "회원가입이 완료되었습니다.",
          },
        ]);
        // 로그인
      } else {
        await signInWithEmailAndPassword(auth, email, pw);
        setLoginModal({ show: false });
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "로그인 되었습니다.",
          },
        ]);
      }
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: handleAuthError(error),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-auto flex h-full w-fit flex-col pb-12 pt-8">
      {(createAccount || pwReset) && (
        <h3 className="text-center text-lg font-semibold text-astronaut-700">
          {createAccount ? "계정 생성하기" : "비밀번호 재설정"}
        </h3>
      )}
      <div className="flex grow flex-col justify-between gap-12">
        <form className="flex w-72 flex-col gap-y-4" onSubmit={onSubmit}>
          <label className="flex flex-col">
            <h4 className="pb-1 pl-2 text-xs text-astronaut-700">이메일</h4>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={onEmailChange}
              className="rounded-lg border border-astronaut-200 bg-white py-1 pl-2  outline-none"
              maxLength={50}
            />
          </label>
          {!pwReset && (
            <label className="flex flex-col">
              <h4 className="pb-1 pl-2 text-xs text-astronaut-700">비밀번호</h4>
              <input
                type="password"
                value={pw}
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                onChange={onPwChange}
                className="rounded-lg border border-astronaut-200 bg-white py-1 pl-2  outline-none"
                maxLength={50}
              />
            </label>
          )}
          {createAccount && (
            <label className="flex flex-col">
              <h4 className="pb-1 pl-2 text-xs text-astronaut-700">
                비밀번호 확인
              </h4>
              <input
                type="password"
                value={pwCheck}
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                onChange={onPwCheckChange}
                className="rounded-lg border border-astronaut-200 bg-white py-1 pl-2  outline-none"
                maxLength={50}
              />
            </label>
          )}
          <div className="flex items-center justify-center gap-2 text-center text-sm text-astronaut-200 text-astronaut-700">
            <button
              type="button"
              onClick={onCovertSignInUpClick}
              className="text-xs text-astronaut-500 hover:underline"
            >
              {createAccount ? "기존 계정으로 로그인" : "회원가입"}
            </button>{" "}
            <div className="pointer-events-none select-none">|</div>{" "}
            <button
              type="button"
              onClick={onConvertPwResetClick}
              className="text-xs text-astronaut-500 hover:underline"
            >
              {pwReset ? "기존 계정으로 로그인" : "비밀번호 재설정"}
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
              }}
              type="submit"
              disabled={isLoading}
            >
              <div>
                {isLoading ? (
                  <Loading height="24px" />
                ) : pwReset ? (
                  "재설정 메일 발송"
                ) : createAccount ? (
                  "계정 등록"
                ) : (
                  "로그인"
                )}
              </div>
            </Button>
          </div>
        </form>
        <div>
          <div className="mb-12 flex items-center gap-2">
            <hr className="grow" />
            <span className="text-xs text-astronaut-500">
              다른 방법으로 로그인
            </span>
            <hr className="grow" />
          </div>
          <div className="flex justify-center gap-2">
            <button
              className="aspect-square rounded-lg bg-astronaut-800 p-2"
              onClick={onGoogleSignInClick}
            >
              <GoogleSvg className="h-6 w-6 fill-astronaut-50" />
            </button>
            <button
              className="aspect-square rounded-lg bg-astronaut-800 p-2"
              onClick={onGithubSignInClick}
            >
              <GithubSvg className="h-6 w-6 fill-astronaut-50" />
            </button>
            <button
              className="aspect-square rounded-lg bg-astronaut-800 p-2"
              onClick={onFacebookSignInClick}
            >
              <FacebookSvg className="h-6 w-6 fill-astronaut-50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInFormModal;
