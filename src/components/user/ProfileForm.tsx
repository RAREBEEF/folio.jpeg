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
import usePostImageFile from "@/hooks/usePostImageFile";
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
import { useRouter } from "next/navigation";
import PenIcon from "@/icons/pen-solid.svg";
import Image from "next/image";

const ProfileForm = () => {
  const { replace } = useRouter();
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);
  const [userData, setUserData] = useRecoilState(
    userDataState(authStatus.data?.displayId || ""),
  );
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const setAlerts = useSetRecoilState(alertsState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mainImageFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);
  const { getExtraUserDataByDisplayId } = useGetExtraUserDataByDisplayId();
  const {
    reset: resetMainImage,
    postImageFile: postMainImageFile,
    onFileSelect: onMainImageFileSelect,
    data: {
      file: mainImageFile,
      previewURL: mainImagePreviewURL,
      id: mainImageId,
    },
  } = usePostImageFile();
  const {
    reset: resetBgImage,
    postImageFile: postBgImageFile,
    onFileSelect: onBgImageFileSelect,
    data: { file: bgImageFile, previewURL: bgImagePreviewURL, id: bgImageId },
  } = usePostImageFile();

  const { value: displayName, onChange: onDisplayNameChange } = useInput(
    authStatus.data?.displayName || "",
  );
  const { value: displayId, onChange: onDisplayIdChange } = useInput(
    authStatus.data?.displayId || "",
  );
  const [defaultMainImg, setDefaultMainImg] = useState<boolean>(
    authStatus.data?.photoURL ? false : true,
  );
  const [defaultBgImg, setDefaultBgImg] = useState<boolean>(
    authStatus.data?.bgPhotoURL ? false : true,
  );

  // 등록
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    const isSignedIn =
      user &&
      (authStatus.status === "signedIn" || authStatus.status === "noExtraData");
    const invalidDisplayNameLength =
      displayName.length < 2 || displayName.length > 16;
    const invalidDisplayId =
      displayId.includes(" ") ||
      displayId.includes("/") ||
      displayId.includes("-") ||
      ["edit", "image", "upload", "search"].includes(displayId);
    const invalidDisplayIdLength =
      displayId.length < 2 || displayId.length > 16;
    const isDisplayIdChanged = authStatus.data?.displayId !== displayId;
    const isDisplayNameChanged = authStatus.data?.displayName !== displayName;
    const isMainImageChanged = !(
      (authStatus.data?.photoURL && !mainImageFile && !defaultMainImg) ||
      (!authStatus.data?.photoURL && !mainImageFile)
    );
    const isBgImageChanged = !(
      (authStatus.data?.bgPhotoURL && !bgImageFile && !defaultBgImg) ||
      (!authStatus.data?.bgPhotoURL && !bgImageFile)
    );
    const noChanged = !authStatus.data
      ? true
      : !(
          isDisplayIdChanged ||
          isDisplayNameChanged ||
          isMainImageChanged ||
          isBgImageChanged
        );

    // 유저 데이터 없으면 리턴
    if (!isSignedIn) {
      return;
    } else if (!displayName) {
      // 닉네임 / 사용자명 최소 조건 확인
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
    } else if (invalidDisplayNameLength) {
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
    } else if (invalidDisplayId) {
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
    } else if (invalidDisplayIdLength) {
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
    } else if (noChanged) {
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

    // 오류시 복원할 이전 상태
    let prevAuthStatus: AuthStatus = authStatus;
    let prevUserData: UserData | null = userData;
    let prevUsersData: { [key in string]: UserData } = usersData;

    const safeDisplayId = displayId.replace(/[^a-zA-Z0-9가-힣]/g, "");

    try {
      // 사용자명 중복 체크
      if (isDisplayIdChanged) {
        const extraUserData = await getExtraUserDataByDisplayId({
          displayId: safeDisplayId,
        });

        if (extraUserData?.status === "error") {
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              show: true,
              type: "warning",
              createdAt: Date.now(),
              text: "사용자명 중복 체크 중 문제가 발생하였습니다.",
            },
          ]);
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
      }

      //
      // 이미지 업로드 / 삭제
      //

      // 이미지 업로드 / 삭제 프로미스 배열
      const imagePromises = [];

      // 프로필 이미지
      let mainImageURL: string = authStatus.data?.photoURL
        ? authStatus.data?.photoURL
        : "";
      const deletePrevMainImage =
        !!authStatus.data.photoURL && (!!defaultMainImg || !!mainImageFile);
      const uploadNewMainImage = mainImageFile && mainImageId;

      if (deletePrevMainImage) {
        const regex = /images%2F([^?]+)/;
        const prevImgPathMatch = authStatus.data.photoURL?.match(regex);

        if (prevImgPathMatch) {
          mainImageURL = "";
          const prevImgPath = prevImgPathMatch[1].replaceAll("%2F", "/");
          const storage = getStorage();
          const storageRef = ref(storage, `images/${prevImgPath}`);
          imagePromises.push(deleteObject(storageRef));
        }
      }
      if (uploadNewMainImage) {
        imagePromises.push(
          postMainImageFile({
            uid: user.uid,
            fileName: mainImageId,
            img: mainImageFile,
          }).then((URL) => {
            mainImageURL = URL || "";
          }),
        );
      }

      // 배경 이미지
      let bgImageURL: string = authStatus.data?.bgPhotoURL
        ? authStatus.data?.bgPhotoURL
        : "";
      const deletePrevBgImage =
        !!authStatus.data?.bgPhotoURL && (!!defaultBgImg || !!bgImageFile);
      const uploadNewBgImage = bgImageFile && bgImageId;

      if (deletePrevBgImage) {
        const regex = /images%2F([^?]+)/;
        const prevImgPathMatch = authStatus.data.bgPhotoURL?.match(regex);

        if (prevImgPathMatch) {
          bgImageURL = "";
          const prevImgPath = prevImgPathMatch[1].replaceAll("%2F", "/");
          const storage = getStorage();
          const storageRef = ref(storage, `images/${prevImgPath}`);
          imagePromises.push(deleteObject(storageRef));
        }
      }
      if (uploadNewBgImage) {
        imagePromises.push(
          postMainImageFile({
            uid: user.uid,
            fileName: bgImageId,
            img: bgImageFile,
          }).then((URL) => {
            bgImageURL = URL || "";
          }),
        );
      }

      // 이미지 업로드/삭제 작업 일괄 실행
      await Promise.all(imagePromises);

      //
      // 상태 업데이트
      //

      setAuthStatus((prev) => {
        return {
          ...prev,
          status: "signedIn",
          data: {
            ...(prev.data as UserData),
            displayName,
            displayId: safeDisplayId,
            photoURL: mainImageURL,
            bgPhotoURL: bgImageURL,
          },
        };
      });

      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          displayName,
          displayId: safeDisplayId,
          photoURL: mainImageURL,
          bgPhotoURL: bgImageURL,
        };
      });

      setUsersData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [user.uid]: {
            ...prev[user.uid],
            displayName,
            displayId: safeDisplayId,
            photoURL: mainImageURL,
            bgPhotoURL: bgImageURL,
          },
        };
      });

      // 유저 데이터 업데이트
      const docRef = doc(db, "users", user.uid);
      await Promise.all([
        authStatus.data?.displayId
          ? updateDoc(docRef, {
              displayId: safeDisplayId,
              photoURL: mainImageURL,
              bgPhotoURL: bgImageURL,
            })
          : setDoc(docRef, {
              displayId: safeDisplayId,
              photoURL: mainImageURL,
              bgPhotoURL: bgImageURL,
              follower: [],
              following: [],
              fcmToken: "",
            }),
        updateProfile(user, {
          displayName,
          photoURL: mainImageURL,
        }),
      ]);

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

      // user path가 바뀐 경우 이동
      isDisplayIdChanged && replace("/" + safeDisplayId);
    } catch (error) {
      setAuthStatus(prevAuthStatus);
      setUserData(prevUserData);
      setUsersData(prevUsersData);
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

  const onDefaultMainImgClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = mainImageFileInputRef.current;
    if (!fileInput) return;
    fileInput.value = "";
    resetMainImage();
    setDefaultMainImg(true);
  };

  const onDefaultBgImgClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = bgImageFileInputRef.current;
    if (!fileInput) return;
    fileInput.value = "";
    resetBgImage();
    setDefaultBgImg(true);
  };

  useEffect(() => {
    if (mainImageFile) setDefaultMainImg(false);
  }, [mainImageFile]);

  return (
    <div className="m-auto flex h-full w-fit flex-col px-4 pb-12 pt-8">
      <div className="flex grow flex-col justify-between gap-12">
        <div className="flex w-[50vw] min-w-52 max-w-72 flex-col gap-y-4">
          {/*  */}
          {/*  */}
          <label
            className="group absolute left-0 top-0 h-72 w-full cursor-pointer bg-astronaut-50 hover:bg-astronaut-100 hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <input
              ref={bgImageFileInputRef}
              onChange={onBgImageFileSelect}
              type="file"
              accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
              className="hidden"
            ></input>
            <Image
              className="absolute left-0 top-0"
              layout="fill"
              src={
                bgImagePreviewURL
                  ? bgImagePreviewURL
                  : defaultBgImg
                    ? ""
                    : authStatus.data?.bgPhotoURL || ""
              }
              alt="background image preview"
            />
            <PenIcon className="absolute right-5 top-20 h-8 rounded-lg bg-astronaut-50 fill-astronaut-500 p-2" />
          </label>

          <label
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`group relative m-auto w-[60%] cursor-pointer rounded-full xs:w-[80%]`}
          >
            <ProfileImage
              URL={
                mainImagePreviewURL
                  ? mainImagePreviewURL
                  : defaultMainImg
                    ? ""
                    : authStatus.data?.photoURL || ""
              }
            />
            <div className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit rounded-xl bg-astronaut-100 px-2 py-1  opacity-0 group-hover:opacity-80">
              이미지 변경
            </div>
            <input
              ref={mainImageFileInputRef}
              onChange={onMainImageFileSelect}
              type="file"
              accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
              className="hidden"
            ></input>
          </label>

          <div className="mb-2 mt-6 flex justify-center gap-6">
            <button
              onClick={onDefaultMainImgClick}
              className="text-xs text-astronaut-500 underline"
            >
              기본 프로필 이미지
            </button>
            <button
              onClick={onDefaultBgImgClick}
              className="text-xs text-astronaut-500 underline"
            >
              기본 배경 이미지
            </button>
          </div>

          {/*  */}
          {/*  */}

          <label className="flex flex-col">
            <h4 className="pb-1 pl-2 text-xs text-astronaut-700">닉네임</h4>
            <input
              type="text"
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
              type="text"
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
            <Button onClick={onSubmit} type="submit" disabled={isLoading}>
              <div>
                {isLoading ? <Loading height="24px" /> : "프로필 설정 완료"}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
