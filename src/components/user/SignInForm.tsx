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
import { useRecoilState, useSetRecoilState } from "recoil";
import { alertState, authStatusState, loginModalState } from "@/recoil/states";
import _ from "lodash";
import { UserData } from "@/types";

const SignInForm = () => {
  const handleAuthError = useHandleAuthError();
  const setLoginModal = useSetRecoilState(loginModalState);
  const setAuthStatus = useSetRecoilState(authStatusState);
  const setAlert = useSetRecoilState(alertState);
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
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential) return;
        const token = credential.accessToken;
        const user = result.user;
        setAuthStatus({
          status: "pending",
          data: _.cloneDeep(user) as UserData,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };
  const onGithubSignInClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const provider = new GithubAuthProvider();
    await signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GithubAuthProvider.credentialFromResult(result);
        if (!credential) return;
        const token = credential.accessToken;
        const user = result.user;
        setAuthStatus({
          status: "pending",
          data: _.cloneDeep(user) as UserData,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GithubAuthProvider.credentialFromError(error);
      });
  };
  const onFacebookSignInClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const provider = new FacebookAuthProvider();
    await signInWithPopup(auth, provider)
      .then((result) => {
        const credential = FacebookAuthProvider.credentialFromResult(result);
        if (!credential) return;
        const token = credential.accessToken;
        const user = result.user;
        setAuthStatus({
          status: "pending",
          data: _.cloneDeep(user) as UserData,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = FacebookAuthProvider.credentialFromError(error);
        // ...
      });
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
      setAlert({
        show: true,
        type: "warning",
        createdAt: Date.now(),
        text: "이메일을 입력해 주세요.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 비밀번호 재설정
      if (pwReset) {
        await sendPasswordResetEmail(auth, email).then(() => {
          setAlert({
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "메일이 발송되었습니다.",
          });
        });
        // 회원가입
      } else if (createAccount) {
        if (pw !== pwCheck) {
          setAlert({
            show: true,
            type: "warning",
            createdAt: Date.now(),
            text: "비밀번호 확인이 일치하지 않습니다.",
          });
          return;
        }
        await createUserWithEmailAndPassword(auth, email, pw).then(() => {
          setLoginModal({ show: false });
          setAlert({
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "회원가입이 완료되었습니다.",
          });
        });
        // 로그인
      } else {
        await signInWithEmailAndPassword(auth, email, pw).then(() => {
          setLoginModal({ show: false });
          setAlert({
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "로그인 되었습니다.",
          });
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "warning",
        createdAt: Date.now(),
        text: handleAuthError(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-auto flex h-full w-fit flex-col pb-12 pt-6">
      {(createAccount || pwReset) && (
        <h3 className="text-ebony-clay-700 text-center text-lg font-semibold">
          {createAccount ? "계정 생성하기" : "비밀번호 재설정"}
        </h3>
      )}
      <div className="mt-10 flex grow flex-col justify-between gap-12">
        <form className="flex w-72 flex-col gap-y-4" onSubmit={onSubmit}>
          <label className="flex flex-col">
            <h4 className="text-ebony-clay-700 pb-1 pl-2 text-xs">이메일</h4>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={onEmailChange}
              className="border-ebony-clay-200 rounded-lg border bg-white py-1 pl-2  outline-none"
              maxLength={50}
            />
          </label>
          {!pwReset && (
            <label className="flex flex-col">
              <h4 className="text-ebony-clay-700 pb-1 pl-2 text-xs">
                비밀번호
              </h4>
              <input
                type="password"
                value={pw}
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                onChange={onPwChange}
                className="border-ebony-clay-200 rounded-lg border bg-white py-1 pl-2  outline-none"
                maxLength={50}
              />
            </label>
          )}
          {createAccount && (
            <label className="flex flex-col">
              <h4 className="text-ebony-clay-700 pb-1 pl-2 text-xs">
                비밀번호 확인
              </h4>
              <input
                type="password"
                value={pwCheck}
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                onChange={onPwCheckChange}
                className="border-ebony-clay-200 rounded-lg border bg-white py-1 pl-2  outline-none"
                maxLength={50}
              />
            </label>
          )}
          <div className="itmes-center text-ebony-clay-200 text-ebony-clay-700 flex justify-center gap-2 text-center text-sm">
            <button
              type="button"
              onClick={onCovertSignInUpClick}
              className="text-ebony-clay-500 text-xs hover:underline"
            >
              {createAccount ? "기존 계정으로 로그인" : "회원가입"}
            </button>{" "}
            <div className="pointer-events-none select-none">|</div>{" "}
            <button
              type="button"
              onClick={onConvertPwResetClick}
              className="text-ebony-clay-500 text-xs hover:underline"
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
            <span className="text-ebony-clay-500 text-xs">
              다른 방법으로 로그인
            </span>
            <hr className="grow" />
          </div>
          <div className="flex justify-center gap-2">
            <button
              className="bg-ebony-clay-950 aspect-square rounded-lg p-2"
              onClick={onGoogleSignInClick}
            >
              <GoogleSvg className="fill-ebony-clay-50 h-6 w-6" />
            </button>
            <button
              className="bg-ebony-clay-950 aspect-square rounded-lg p-2"
              onClick={onGithubSignInClick}
            >
              <GithubSvg className="fill-ebony-clay-50 h-6 w-6" />
            </button>
            <button
              className="bg-ebony-clay-950 aspect-square rounded-lg p-2"
              onClick={onFacebookSignInClick}
            >
              <FacebookSvg className="fill-ebony-clay-50 h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
