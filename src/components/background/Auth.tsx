"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/fb";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  authStatusState,
  foldersState,
  loginModalState,
  userDataState,
  usersDataState,
} from "@/recoil/states";
import _ from "lodash";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { AuthStatus, ExtraUserData, Folder, Folders, UserData } from "@/types";
import useTypeGuards from "@/hooks/useTypeGuards";

const Auth = () => {
  const { isExtraUserData } = useTypeGuards();
  // 로그인 모달창 state
  const setLoginModal = useSetRecoilState(loginModalState);
  // pending 여부
  const [extraDataPending, setExtraDataPending] = useState<boolean>(false);
  const [folderPending, setFolderPending] = useState<boolean>(false);
  // 현재 로그인한 유저의 유저 데이터와 폴더 state
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);
  const [myFolders, setMyFolders] = useRecoilState(
    foldersState(authStatus.data?.uid || ""),
  );
  const [userData, setUserData] = useRecoilState(
    userDataState(authStatus.data?.displayId || ""),
  );
  const [usersData, setUsersData] = useRecoilState(usersDataState);

  // auth 변경 감지
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      const data = _.cloneDeep(user);
      // 인증 상태가 변경되면 새로운 유저데이터로 업데이트하고 extra user data와 folder 데이터를 불러올 수 있도록 상태 변경.
      if (data) {
        setAuthStatus({ data, status: "pending" });
        setMyFolders(null);
      } else {
        setAuthStatus({ data: null, status: "signedOut" });
        setMyFolders(null);
      }
    });
  }, [setAuthStatus, setMyFolders]);

  // extraUserData 체크하고 불러오기
  useEffect(() => {
    // status: pending은 extraUserData를 기다리는 것을 의미
    if (authStatus.status === "pending") {
      //  extraData가 없고 현재 불러오는 중도 아니면
      if (authStatus.data && !authStatus.data.displayId && !extraDataPending) {
        // 현재 불러오는 중으로 상태로 변경
        setExtraDataPending(true);

        const uid = authStatus.data.uid;

        // db에 extraData 요청
        (async () => {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          // db에 데이터가 없으면
          if (!docSnap.exists()) {
            // 이미지를 저장할 기본 폴더와 알림을 저장할 컬렉션 문서 생성
            const now = Date.now();
            const folderDocRef = doc(db, "users", uid, "folders", "_DEFAULT");
            const notificationDocRef = doc(
              db,
              "users",
              uid,
              "notification",
              "data",
            );
            const feedbackDocRef = doc(db, "users", uid, "feedback", "data");

            await Promise.all([
              setDoc(folderDocRef, {
                createdAt: now,
                id: "_DEFAULT",
                images: [],
                isPrivate: true,
                name: "_DEFAULT",
                uid,
                updatedAt: now,
              }),
              setDoc(notificationDocRef, {
                list: [],
                lastCheck: 0,
              }),
              setDoc(feedbackDocRef, {
                feedback: null,
                createdAt: 0,
              }),
            ]);

            // 프로필 초기 설정창 띄움
            setLoginModal({ show: true, showInit: true });
            // auth 상태 업데이트
            setAuthStatus((prev) => {
              return {
                ...(prev as AuthStatus),
                ...(prev.data
                  ? { status: "noExtraData", data: prev.data }
                  : { status: "signedOut", data: null }),
              };
            });
            // db에 데이터가 있으면 불러온 데이터로 auth 상태 업데이트
          } else {
            const userExtraData = docSnap.data();
            setAuthStatus((prev) => {
              if (!prev) {
                return prev;
              } else {
                return {
                  ...prev,
                  status: "signedIn",
                  data: { ...(prev.data as UserData), ...userExtraData },
                };
              }
            });
          }

          // 불러오기 종료로 상태 변경
          setExtraDataPending(false);
        })();
      }
    }
  }, [authStatus, extraDataPending, setAuthStatus, setLoginModal]);

  // 내가 만든 폴더 불러오기
  useEffect(() => {
    // 폴더 데이터가 아직 없고 현재 불렁오는 중도 아니고 불러오는데 필요한 데이터가 모두 있는 경우
    if (
      !myFolders &&
      !folderPending &&
      authStatus.data &&
      authStatus.data.uid
    ) {
      // 현재 불러오는 중으로 상태 변경
      setFolderPending(true);

      const uid = authStatus.data.uid;

      // db에서 폴더 데이터를 불러온다.
      (async () => {
        const foldersRef = collection(db, "users", uid, "folders");
        const q = query(foldersRef, orderBy("updatedAt", "desc"));
        const docSnap = await getDocs(q);
        const folders = [] as Folders;
        docSnap.forEach((doc) => {
          folders.push(doc.data() as Folder);
        });

        // 폴더 상태 업데이트
        setMyFolders(folders);
        // 불러오기 종료로 상태 변경
        setFolderPending(false);
      })();
    }
  }, [authStatus.data, folderPending, myFolders, setMyFolders]);

  // 로그인과 초기설정이 모두 완료된 경우 로그인 모달을 닫고 유저 관련 상태에 내 데이터 추가
  useEffect(() => {
    if (authStatus.status === "signedIn") {
      setLoginModal({ show: false });
      const data = authStatus.data as UserData;
      setUserData(data);
      setUsersData((prev) => ({ [data.uid]: data, ...prev }));
    }
  }, [setLoginModal, authStatus, setUserData, setUsersData]);

  return null;
};

export default Auth;
