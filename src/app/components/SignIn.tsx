"use client";

import {
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "@/fb";
import { MouseEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

const SignIn = () => {
  const { push } = useRouter();
  const [init, setInit] = useState<boolean>(false);
  const [signedIn, setSignedIn] = useState<boolean>(false);

  const onGoogleSignInClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (!result) {
          return;
        } else {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (!credential) {
            return;
          } else {
            const token = credential.accessToken;
            const user = result.user;
            setSignedIn(true);
          }
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      })
      .finally(() => {
        setInit(true);
      });
  }, []);

  useEffect(() => {
    if (signedIn) {
      push("/");
    }
  }, [signedIn, push]);

  return (
    <div className="flex h-full items-center justify-center bg-shark-50">
      {init && !signedIn ? (
        <Button onClick={onGoogleSignInClick}>
          <div>구글 계정으로 로그인하기</div>
        </Button>
      ) : (
        <div>로딩</div>
      )}
    </div>
  );
};

export default SignIn;
