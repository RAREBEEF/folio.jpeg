"use client";

import Button from "../Button";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/fb";
import {
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Loading from "@/components/loading/Loading";
import useInput from "@/hooks/useInput";
import { useRecoilState, useSetRecoilState } from "recoil";
import _, { uniqueId } from "lodash";
import useSetImageFile from "@/hooks/useSetImageFile";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { AuthStatus, UserData } from "@/types";
import useGetExtraUserDataByDisplayId from "@/hooks/useGetExtraUserDataByDisplayId";
import ProfileImage from "@/components/user/ProfileImage";
import {
  alertsState,
  authStatusState,
  userDataState,
  usersDataState,
} from "@/recoil/states";
import { deleteObject, getStorage, ref } from "firebase/storage";

const ProfileForm = () => {
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);
  const setUserData = useSetRecoilState(
    userDataState(authStatus.data?.displayId || ""),
  );
  const setUsersData = useSetRecoilState(usersDataState);
  const setAlerts = useSetRecoilState(alertsState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getExtraUserDataByDisplayId } = useGetExtraUserDataByDisplayId();
  const {
    reset,
    setImageFile,
    onFileSelect,
    data: { file, previewURL, id: imageId },
  } = useSetImageFile();
  const { value: displayName, onChange: onDisplayNameChange } = useInput(
    authStatus.data?.displayName || "",
  );
  const { value: displayId, onChange: onDisplayIdChange } = useInput(
    authStatus.data?.displayId || "",
  );
  const [defaultImg, setDefaultImg] = useState<boolean>(
    authStatus.data?.photoURL ? false : true,
  );

  // 등록
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    // 유저 데이터 없으면 리턴
    if (!user) return;

    // 닉네임 / 사용자명 최소 조건 확인
    if (!displayName) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "사용하실 닉네임을 입력해 주세요.",
        },
      ]);
      return;
    } else if (displayName.length < 2 || displayName.length > 16) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "닉네임은 2~16 글자 사이로 정해주세요.",
        },
      ]);
      return;
    } else if (!displayId) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "사용하실 사용자명을 입력해 주세요.",
        },
      ]);
      return;
    } else if (
      displayId.includes(" ") ||
      displayId.includes("/") ||
      displayId.includes("-") ||
      ["edit", "image", "upload"].includes(displayId)
    ) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "사용자명에 사용할 수 없는 문자가 포함되어 있습니다. (예약어, 공백 또는 /,- 등)",
        },
      ]);
      return;
    } else if (displayId.length < 2 || displayId.length > 16) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "사용자명은 2~16 글자 사이로 정해주세요.",
        },
      ]);
      return;
    } else if (
      authStatus.data?.displayId === displayId &&
      authStatus.data.displayName === displayName &&
      ((authStatus.data.photoURL && !file && !defaultImg) ||
        (!authStatus.data.photoURL && !file))
    ) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "변경사항이 존재하지 않습니다.",
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      // 사용자명 중복 체크
      const extraUserData = await getExtraUserDataByDisplayId({ displayId });

      if (extraUserData?.status === "error") {
        return;
      } else if (
        extraUserData?.status === "success" &&
        extraUserData.data?.uid !== authStatus.data?.uid
      ) {
        setAlerts((prev) => [
          ...prev,
          {
            id: uniqueId(),
            show: true,
            type: "warning",
            createdAt: Date.now(),
            text: "이미 사용 중인 사용자명입니다.",
          },
        ]);
        return;
      }

      let photoURL: string | null = authStatus.data?.photoURL
        ? authStatus.data?.photoURL
        : "";

      // 새 프로필 이미지 업로드 및 이미지 URL 불러오기
      if (file && imageId) {
        photoURL =
          (await setImageFile({
            uid: user.uid,
            fileName: imageId,
            img: file,
          })) || "";
      }

      // 이전 프로필 이미지가 존재한데
      // 기본 이미지로 바꾸거나 새 이미지를 업로드하는 경우
      // 기존 프로필 이미지 삭제
      if (authStatus.data?.photoURL && (defaultImg || file)) {
        const regex = /images%2F([^?]+)/;
        const prevImgPathMatch = authStatus.data.photoURL.match(regex);

        if (prevImgPathMatch) {
          photoURL = "";
          const prevImgPath = prevImgPathMatch[1].replaceAll("%2F", "/");
          const storage = getStorage();
          const storageRef = ref(storage, `images/${prevImgPath}`);
          await deleteObject(storageRef).catch((error) => {});
        }
      }

      // 오류시 복원할 이전 상태
      let prevAuthStatus: AuthStatus;
      let prevUserData: UserData;
      let prevUsersData: { [key in string]: UserData };

      // 유저 데이터 상태 업데이트
      setAuthStatus((prev) => {
        prevAuthStatus = prev;
        const newAuthStatus = prev;
        return {
          ...newAuthStatus,
          status: "signedIn",
          data: {
            ...(prev.data as UserData),
            displayName,
            displayId,
            photoURL,
          },
        };
      });
      setUserData((prev) => {
        if (!prev) return prev;
        prevUserData = prev;
        return {
          ...prev,
          displayName,
          displayId,
          photoURL,
        };
      });
      setUsersData((prev) => {
        if (!prev) return prev;
        prevUsersData = prev;
        return {
          ...prev,
          [user.uid]: { ...prev[user.uid], displayName, displayId, photoURL },
        };
      });

      // 유저 데이터 db 업데이트 및 이전 프로필사진 삭제
      const docRef = doc(db, "users", user.uid);
      await Promise.all([
        authStatus.data?.displayId
          ? updateDoc(docRef, {
              displayId,
              photoURL,
            })
          : setDoc(docRef, {
              displayId,
              photoURL,
              follower: [],
              following: [],
              fcmToken: "",
              tagScore: {},
            }),
        updateProfile(user, {
          displayName,
          photoURL,
        }),
      ])
        .then(() => {
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              show: true,
              type: "success",
              createdAt: Date.now(),
              text: "프로필 설정이 완료되었습니다.",
            },
          ]);
        })
        .catch((error) => {
          // 오류시 상태 롤백
          setAuthStatus(prevAuthStatus);
          setUserData(prevUserData);
          setUsersData(prevUsersData);
        });
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "프로필 설정 중 오류가 발생하였습니다. 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const restrictingInputChar = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "/" || e.key === "-" || e.key === " ") e.preventDefault();
  };

  const onDefaultImgClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = fileInputRef.current;
    if (!fileInput) return;
    fileInput.value = "";
    reset();
    setDefaultImg(true);
  };

  useEffect(() => {
    if (file) setDefaultImg(false);
  }, [file]);

  return (
    <div className="m-auto flex h-full w-fit flex-col px-4 pb-12 pt-6">
      <div className="flex grow flex-col justify-between gap-12">
        <form
          className="flex w-[50vw] min-w-52 max-w-72 flex-col gap-y-4"
          onSubmit={onSubmit}
        >
          <label
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`group relative m-auto w-[60%] cursor-pointer rounded-full xs:w-[80%]`}
          >
            <ProfileImage
              URL={
                previewURL
                  ? previewURL
                  : defaultImg
                    ? ""
                    : authStatus.data?.photoURL || ""
              }
            />
            <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit rounded-xl bg-astronaut-100 px-2 py-1  opacity-0 group-hover:opacity-80">
              이미지 변경
            </div>
            <input
              ref={fileInputRef}
              onChange={onFileSelect}
              id="image_input"
              type="file"
              accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
              className="hidden"
            ></input>
          </label>
          <button
            onClick={onDefaultImgClick}
            className="mb-4 text-xs text-astronaut-500 underline"
          >
            기본 이미지로
          </button>
          <label className="flex flex-col">
            <h4 className="pb-1 pl-2 text-xs text-astronaut-700">닉네임</h4>
            <input
              type="string"
              placeholder="2~16 글자"
              value={displayName}
              onChange={onDisplayNameChange}
              className="rounded-lg border border-astronaut-200 bg-white py-1 pl-2  outline-none"
              maxLength={20}
            />
          </label>
          <label className="flex flex-col">
            <h4 className="pb-1 pl-2 text-xs text-astronaut-700">사용자명</h4>
            <input
              onKeyDown={restrictingInputChar}
              type="string"
              value={displayId}
              placeholder="2~16 글자"
              onChange={onDisplayIdChange}
              className="rounded-lg border border-astronaut-200 bg-white py-1 pl-2  outline-none"
              maxLength={20}
            />
            <p className="ml-2 mt-1 text-xs text-astronaut-500">
              folio-jpeg.rarebeef.co.kr/{displayId || "사용자명"}
            </p>
          </label>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
              }}
              type="submit"
              disabled={isLoading}
            >
              <div>
                {isLoading ? <Loading height="24px" /> : "프로필 설정 완료"}
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
