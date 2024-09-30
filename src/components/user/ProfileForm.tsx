"use client";

import Button from "../Button";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/fb";
import {
  ChangeEvent,
  FormEvent,
  Fragment,
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
import useAnalyzingProfile from "@/hooks/useAnalyzingProfile";
import ValidSvg from "@/icons/circle-check-solid.svg";
import InvalidSvg from "@/icons/circle-exclamation-solid.svg";
import useDevicePushToken from "@/hooks/useDevicePushToken";
import ExternalLink from "../ExternalLink";
import Image from "next/image";
import PenSvg from "@/icons/pen-solid.svg";
import ensureHttp from "@/tools/ensureHttp";

const ProfileForm = () => {
  const { replace } = useRouter();
  const [authStatus, setAuthStatus] = useRecoilState(authStatusState);
  const [userData, setUserData] = useRecoilState(
    userDataState(authStatus.data?.displayId || ""),
  );
  const { deleteDeviceData } = useDevicePushToken();
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const { analyzingProfile, isLoading: isAnalyzing } = useAnalyzingProfile();
  const setAlerts = useSetRecoilState(alertsState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const profileImageFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);
  const { getExtraUserDataByDisplayId } = useGetExtraUserDataByDisplayId();
  const {
    onResetAllField: resetProfileImage,
    postImageFile: postProfileImageFile,
    onFileSelect: onProfileImageFileSelect,
    data: {
      file: profileImageFile,
      previewURL: profileImagePreviewURL,
      id: profileImageId,
    },
    isInputUploading: isProfileImageInputUploading,
  } = usePostImageFile();
  const {
    onResetAllField: resetBgImage,
    postImageFile: postBgImageFile,
    onFileSelect: onBgImageFileSelect,
    data: { file: bgImageFile, previewURL: bgImagePreviewURL, id: bgImageId },
    isInputUploading: isBgImageInputUploading,
  } = usePostImageFile();
  const { value: displayName, onChange: onDisplayNameChange } = useInput(
    authStatus.data?.displayName || "",
  );
  const { value: displayId, onChange: onDisplayIdChange } = useInput(
    authStatus.data?.displayId || "",
  );
  const { value: introduce, onChange: onIntroduceChange } = useInput(
    authStatus.data?.introduce || "",
  );
  const [defaultProfileImg, setDefaultProfileImg] = useState<boolean>(
    authStatus.data?.photoURL ? false : true,
  );
  const [defaultBgImg, setDefaultBgImg] = useState<boolean>(
    authStatus.data?.bgPhotoURL ? false : true,
  );
  const [isDisplayNameValid, setIsDisplayNameValid] = useState<boolean | null>(
    null,
  );
  const [displayNameInvalidReason, setDisplayNameInvalidReason] =
    useState<string>("");
  const [isDisplayIdValid, setIsDisplayIdValid] = useState<boolean | null>(
    null,
  );
  const [displayIdInvalidReason, setDisplayIdInvalidReason] =
    useState<string>("");
  const [isProfileImageValid, setIsProfileImageValid] = useState<
    boolean | null
  >(null);
  const [profileImageInvalidReason, setProfileImageInvalidReason] =
    useState<string>("");
  const [allowPush, setAllowPush] = useState<"true" | "false">(
    authStatus.data?.allowPush === false ? "false" : "true",
  );
  const [links, setLinks] = useState<[string, string, string, string, string]>(
    authStatus.data?.links ? authStatus.data.links : ["", "", "", "", ""],
  );
  const [linkValid, setLinkValid] = useState<
    [boolean, boolean, boolean, boolean, boolean]
  >([true, true, true, true, true]);
  const [linkCount, setLinkCount] = useState<number>(
    userData?.links?.filter((link) => !!link).length || 1,
  );

  const onLinksChange = (e: ChangeEvent<HTMLInputElement>) => {
    const regex =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    const { value } = e.target;

    switch (e.target.id) {
      case "link-0":
        setLinks((prev) => [value, prev[1], prev[2], prev[3], prev[4]]);
        setLinkValid((prev) => [
          value === "" || regex.test(value),
          prev[1],
          prev[2],
          prev[3],
          prev[4],
        ]);
        break;
      case "link-1":
        setLinks((prev) => [prev[0], value, prev[2], prev[3], prev[4]]);
        setLinkValid((prev) => [
          prev[0],
          value === "" || regex.test(value),
          prev[2],
          prev[3],
          prev[4],
        ]);
        break;
      case "link-2":
        setLinks((prev) => [prev[0], prev[1], value, prev[3], prev[4]]);
        setLinkValid((prev) => [
          prev[0],
          prev[1],
          value === "" || regex.test(value),
          prev[3],
          prev[4],
        ]);
        break;
      case "link-3":
        setLinks((prev) => [prev[0], prev[1], prev[2], value, prev[4]]);
        setLinkValid((prev) => [
          prev[0],
          prev[1],
          prev[2],
          value === "" || regex.test(value),
          prev[4],
        ]);
        break;
      case "link-4":
        setLinks((prev) => [prev[0], prev[1], prev[2], prev[3], value]);
        setLinkValid((prev) => [
          prev[0],
          prev[1],
          prev[2],
          prev[3],
          value === "" || regex.test(value),
        ]);
        break;
      default:
        break;
    }
  };

  console.log(linkValid);

  const onAllowPushChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAllowPush(e.target.value as "true" | "false");
  };

  useEffect(() => {
    setIsProfileImageValid(null);
    if (profileImageFile) setDefaultProfileImg(false);
    if (bgImageFile) setDefaultBgImg(false);
  }, [profileImageFile, bgImageFile]);

  const displayNameSimpleCheck = (displayName: string) => {
    if (displayName === "") {
      setIsDisplayNameValid(false);
      setDisplayNameInvalidReason("필수 입력");
      return false;
    } else if (displayName.length > 16) {
      setIsDisplayNameValid(false);
      setDisplayNameInvalidReason("길이 초과");
      return false;
    } else if (displayName.length < 2) {
      setIsDisplayNameValid(false);
      setDisplayNameInvalidReason("너무 짧음");
      return false;
    } else {
      setIsDisplayNameValid(null);
      setDisplayNameInvalidReason("");
      return true;
    }
  };

  const displayIdSimpleCheck = (displayId: string) => {
    if (displayId === "") {
      setIsDisplayIdValid(false);
      setDisplayIdInvalidReason("필수 입력");
      return false;
    } else if (displayId.length > 16) {
      setIsDisplayIdValid(false);
      setDisplayIdInvalidReason("길이 초과");
      return false;
    } else if (displayId.length < 2) {
      setIsDisplayIdValid(false);
      setDisplayIdInvalidReason("너무 짧음");
      return false;
    } else if (!/^[a-zA-Z0-9_.]+$/i.test(displayId)) {
      setIsDisplayIdValid(false);
      setDisplayIdInvalidReason("입력 가능 문자 (알파벳, 숫자, ., _)");
      return false;
    } else if (["edit", "image", "upload", "search"].includes(displayId)) {
      setIsDisplayIdValid(false);
      setDisplayIdInvalidReason("사용 불가능한 아이디");
      return false;
    } else {
      setIsDisplayIdValid(null);
      setDisplayIdInvalidReason("");
      return true;
    }
  };

  // displayName 실시간 체크(최소한의 조건만)
  // 아래 체크 내용은 submit 단계에서도 한 번 더 체크함
  useEffect(() => {
    displayNameSimpleCheck(displayName);
  }, [displayName]);

  // displayId 실시간 체크(최소한의 조건만)
  // 아래 체크 내용은 submit 단계에서도 한 번 더 체크함
  useEffect(() => {
    displayIdSimpleCheck(displayId);
  }, [displayId]);

  // 기본 프로필 이미지
  const onDefaultProfileImgClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    const fileInput = profileImageFileInputRef.current;
    if (!fileInput) return;
    fileInput.value = "";
    resetProfileImage();
    setDefaultProfileImg(true);
  };

  const onDefaultBgImgClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    const fileInput = bgImageFileInputRef.current;
    if (!fileInput) return;
    fileInput.value = "";
    resetBgImage();
    setDefaultBgImg(true);
  };

  // 등록
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    const isSignedIn =
      user &&
      (authStatus.status === "signedIn" || authStatus.status === "noExtraData");

    if (
      !isSignedIn ||
      isLoading ||
      isDisplayIdValid === false ||
      isDisplayNameValid === false ||
      isProfileImageValid === false
    ) {
      return;
    } else if (isProfileImageInputUploading || isBgImageInputUploading) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "이미지 변환 및 압축 중입니다.",
        },
      ]);

      return;
    }

    // 변경사항 체크
    const isDisplayIdChanged = authStatus.data?.displayId !== displayId;
    const isDisplayNameChanged = authStatus.data?.displayName !== displayName;
    const isIntroduceChanged = authStatus.data?.introduce !== introduce;
    const prevLinks = authStatus.data?.links
      ? authStatus.data?.links
      : ["", "", ""];
    const isLinksChanged =
      prevLinks[0] !== links[0] ||
      prevLinks[1] !== links[1] ||
      prevLinks[2] !== links[2] ||
      prevLinks[3] !== links[3] ||
      prevLinks[4] !== links[4];
    const isProfileImageChanged = !(
      (authStatus.data?.photoURL && !profileImageFile && !defaultProfileImg) ||
      (!authStatus.data?.photoURL && !profileImageFile)
    );
    const isBgImageChanged = !(
      (authStatus.data?.bgPhotoURL && !bgImageFile && !defaultBgImg) ||
      (!authStatus.data?.bgPhotoURL && !bgImageFile)
    );
    const isAllowPushChanged =
      authStatus.data?.allowPush?.toString() !== allowPush;
    const noChanged = !authStatus.data
      ? true
      : !(
          isDisplayIdChanged ||
          isDisplayNameChanged ||
          isProfileImageChanged ||
          isBgImageChanged ||
          isLinksChanged ||
          isAllowPushChanged ||
          isIntroduceChanged
        );

    console.log(prevLinks, links, isLinksChanged);

    // 변경사항 없으면 리턴
    if (noChanged) {
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
      // 프로필 간단 유효성 체크 실패시 리턴
    } else if (
      !(displayNameSimpleCheck(displayName) && displayIdSimpleCheck(displayId))
    ) {
      return;
    }

    // 문제 없으면 프로필 업데이트 시작
    setIsLoading(true);

    // 오류시 복원할 이전 상태
    let prevAuthStatus: AuthStatus = authStatus;
    let prevUserData: UserData | null = userData;
    let prevUsersData: { [key in string]: UserData } = usersData;

    const lowercaseDisplayId = displayId.toLowerCase();

    try {
      // 식별 아이디 중복 체크
      if (isDisplayIdChanged) {
        const extraUserData = await getExtraUserDataByDisplayId({
          displayId: lowercaseDisplayId,
        });

        if (extraUserData?.status === "error") {
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              show: true,
              type: "warning",
              createdAt: Date.now(),
              text: "식별 아이디 중복 체크 중 문제가 발생하였습니다.",
            },
          ]);
          return;
        } else if (
          extraUserData?.status === "success" &&
          extraUserData.data?.uid !== authStatus.data?.uid
        ) {
          setIsDisplayIdValid(false);
          setDisplayIdInvalidReason("중복된 식별 아이디입니다.");
          return;
        }
      }

      //
      // 프로필 부적절성 검사 보류, 너무 오래걸림
      //
      // // 닉네임, id, 프사에 변경사항이 있는 경우 ai 프로필 부적절성 검사
      // if (isDisplayIdChanged || isDisplayNameChanged || isProfileImageChanged) {
      //   const result = await analyzingProfile({
      //     displayId,
      //     displayName,
      //     // 이미지 분석은 리소스를 많이 먹으니 변경사항이 없거나 이미 검사를 한 경우에는 전달하지 않는다.
      //     // 프로필 변경 과정이 너무 길어져 우선 비활성화.
      //     // profileImage:
      //     //   isProfileImageChanged &&
      //     //   profileImageFile &&
      //     //   isProfileImageValid !== true
      //     //     ? profileImageFile
      //     //     : null,
      //   });

      //   // 분석 결과를 받아오는데 실패한 경우
      //   if (!result) {
      //     setAlerts((prev) => [
      //       ...prev,
      //       {
      //         id: uniqueId(),
      //         show: true,
      //         type: "warning",
      //         createdAt: Date.now(),
      //         text: "프로필 검사 중 문제가 발생하였습니다. 다시 시도해 주세요.",
      //       },
      //     ]);
      //     return;
      //   } else {
      //     const { displayNameValid, displayIdValid, profileImageValid } =
      //       result;

      //     // 모두 문제 없으면 문제없음 업데이트 후 계속 진행
      //     if (displayNameValid && displayIdValid && profileImageValid) {
      //       setIsDisplayNameValid(true);
      //       setIsDisplayIdValid(true);
      //       setIsProfileImageValid(true);
      //     } else {
      //       // 하나라도 문제가 있으면 문제 업데이트 후 중단
      //       setIsDisplayNameValid(displayNameValid);
      //       setIsDisplayIdValid(displayIdValid);
      //       setIsProfileImageValid(profileImageValid);
      //       setIsLoading(false);
      //       return;
      //     }
      //   }
      // }

      //
      // 이미지 업로드 / 삭제
      //

      // 이미지 업로드 / 삭제 프로미스 배열
      const imagePromises = [];

      // 프로필 이미지
      let profileImageURL: string = authStatus.data?.photoURL
        ? authStatus.data?.photoURL
        : "";
      const deletePrevProfileImage =
        !!authStatus.data.photoURL &&
        (!!defaultProfileImg || !!profileImageFile);
      const uploadNewProfileImage = profileImageFile && profileImageId;

      // 이전 이미지 삭제
      if (deletePrevProfileImage) {
        const regex = /images%2F([^?]+)/;
        const prevImgPathMatch = authStatus.data.photoURL?.match(regex);

        if (prevImgPathMatch) {
          profileImageURL = "";
          const prevImgPath = prevImgPathMatch[1].replaceAll("%2F", "/");
          const storage = getStorage();
          const storageRef = ref(storage, `images/${prevImgPath}`);
          imagePromises.push(deleteObject(storageRef));
        }
      }

      // 새 이미지 업로드
      if (uploadNewProfileImage) {
        imagePromises.push(
          postProfileImageFile({
            uid: user.uid,
            fileName: profileImageId,
            img: profileImageFile,
          }).then((URL) => {
            profileImageURL = URL || "";
          }),
        );
      }

      // 배경 이미지
      let bgImageURL: string | null = authStatus.data?.bgPhotoURL
        ? authStatus.data?.bgPhotoURL
        : "";
      const deletePrevBgImage =
        !!authStatus.data.bgPhotoURL && (!!defaultBgImg || !!bgImageFile);
      const uploadNewBgImage = bgImageFile && bgImageId;

      // 이전 이미지 삭제
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

      // 새 이미지 업로드
      if (uploadNewBgImage) {
        imagePromises.push(
          postBgImageFile({
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
            displayId: lowercaseDisplayId,
            photoURL: profileImageURL,
            bgPhotoURL: bgImageURL,
            introduce,
            links,
            allowPush: allowPush === "true",
          },
        };
      });

      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          displayName,
          displayId: lowercaseDisplayId,
          photoURL: profileImageURL,
          bgPhotoURL: bgImageURL,
          introduce,
          links,
          allowPush: allowPush === "true",
        };
      });

      setUsersData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [user.uid]: {
            ...prev[user.uid],
            displayName,
            displayId: lowercaseDisplayId,
            photoURL: profileImageURL,
            bgPhotoURL: bgImageURL,
            introduce,
            links,
            allowPush: allowPush === "true",
          },
        };
      });

      // 유저 데이터 업데이트
      const docRef = doc(db, "users", user.uid);
      const updatePromises = [
        authStatus.data?.displayId
          ? updateDoc(docRef, {
              displayId: lowercaseDisplayId,
              photoURL: profileImageURL,
              bgPhotoURL: bgImageURL,
              allowPush: allowPush === "true",
              introduce,
              links,
            })
          : setDoc(docRef, {
              displayId: lowercaseDisplayId,
              photoURL: profileImageURL,
              bgPhotoURL: bgImageURL,
              follower: [],
              following: [],
              allowPush: allowPush === "true",
              introduce,
              links,
            }),
        updateProfile(user, {
          displayName,
          photoURL: profileImageURL,
        }),
      ];
      // isAllowPushChanged = true이고 새 allowPush가 false이면 토큰 전부 삭제.
      if (isAllowPushChanged && allowPush === "false") {
        updatePromises.push(deleteDeviceData({ all: true }));
      }
      await Promise.all(updatePromises);

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
      isDisplayIdChanged && replace("/" + lowercaseDisplayId);
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

  const linkInputs = (linkCount: number) => {
    const linkInputEls: Array<JSX.Element> = [];

    for (let i = 0; i < linkCount; i++) {
      console.log(linkValid[i], i);
      linkInputEls.push(
        <div className="flex w-full gap-1">
          <input
            id={`link-${i}`}
            type="text"
            value={links[i]}
            onChange={onLinksChange}
            placeholder={`링크 ${i + 1}`}
            className={`grow rounded-lg border bg-white py-1 pl-2 outline-none ${!linkValid[i] ? "border-[firebrick]" : "border-astronaut-200"}`}
            disabled={isLoading}
          />
          <button
            onClick={() => {
              onAdjustLink(-1);
              setLinks((prev) => {
                const newLinks = _.cloneDeep(prev);
                newLinks.splice(i, 1);
                newLinks.push("");
                return newLinks;
              });
              setLinkValid((prev) => {
                const newLinkValid = _.cloneDeep(prev);
                newLinkValid[i] = true;
                return newLinkValid;
              });
            }}
            className="m-auto aspect-square h-fit rounded-full bg-astronaut-200 px-2 font-bold text-white hover:bg-astronaut-100"
          >
            -
          </button>
        </div>,
      );
    }

    return linkInputEls;
  };

  const onAdjustLink = (amount: -1 | 1) => {
    setLinkCount((prev) => Math.max(Math.min(prev + amount, 5), 1) as number);
  };

  return (
    <div className="m-auto flex h-full w-fit flex-col px-4 pb-12 pt-8">
      <div className="flex grow flex-col justify-between gap-12">
        <div className="flex w-[50vw] min-w-52 max-w-72 flex-col gap-y-8">
          <div>
            <label
              className="group relative h-24 w-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h4 className="mb-2 flex items-center gap-2 pl-1 text-sm text-astronaut-700">
                배너 이미지
              </h4>
              <input
                ref={bgImageFileInputRef}
                onChange={onBgImageFileSelect}
                type="file"
                accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
                className="hidden"
              ></input>
              <div className="relative h-24 w-full overflow-hidden rounded-xl">
                {bgImagePreviewURL ||
                (!defaultBgImg && userData?.bgPhotoURL) ? (
                  <Fragment>
                    <Image
                      layout="fill"
                      objectFit="cover"
                      src={
                        bgImagePreviewURL
                          ? bgImagePreviewURL
                          : defaultBgImg
                            ? ""
                            : authStatus.data?.bgPhotoURL || ""
                      }
                      alt="background image preview"
                    />
                    <div
                      className={`absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit rounded-xl bg-astronaut-100 px-2 py-1 opacity-0 ${!isLoading && "group-hover:opacity-80"}`}
                    >
                      이미지 변경
                    </div>
                  </Fragment>
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-xl bg-astronaut-100 text-xl font-semibold text-astronaut-300">
                    이미지 추가
                  </div>
                )}
              </div>
            </label>

            <div className="mb-2 mt-2 flex justify-center gap-6">
              <button
                onClick={onDefaultBgImgClick}
                className="text-xs text-astronaut-500 underline"
              >
                기본 배너 이미지
              </button>
            </div>
          </div>

          <label
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`group relative m-auto w-full cursor-pointer rounded-full`}
          >
            <h4 className="mb-2 flex items-center gap-2 pl-1 text-sm text-astronaut-700">
              프로필 이미지
            </h4>

            {isProfileImageInputUploading ? (
              <div className="flex aspect-square flex-col items-center justify-center rounded-full bg-astronaut-50">
                <Loading />
              </div>
            ) : (
              <div className="relative m-auto w-[60%] xs:w-[80%]">
                <ProfileImage
                  URL={
                    profileImagePreviewURL
                      ? profileImagePreviewURL
                      : defaultProfileImg
                        ? ""
                        : authStatus.data?.photoURL || ""
                  }
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit rounded-xl bg-astronaut-100 px-2 py-1 opacity-0 ${!isLoading && "group-hover:opacity-80"}`}
                >
                  이미지 변경
                </div>
              </div>
            )}

            <input
              ref={profileImageFileInputRef}
              onChange={onProfileImageFileSelect}
              type="file"
              accept="image/jpg, image/jpeg, image/gif, image/webp, image/png"
              className="hidden"
              disabled={isLoading}
            ></input>
            <span className="absolute right-0 top-0 flex select-none items-center gap-1">
              {isProfileImageValid === true ? (
                <ValidSvg className="inline h-5 w-5 fill-[green]" />
              ) : isProfileImageValid === false ? (
                <InvalidSvg className="inline h-5 w-5 fill-[firebrick]" />
              ) : null}
            </span>
          </label>

          <div className="mb-2 flex justify-center gap-6">
            <button
              onClick={onDefaultProfileImgClick}
              className="text-xs text-astronaut-500 underline"
            >
              기본 프로필 이미지
            </button>
          </div>

          <label className="flex flex-col">
            <h4 className="flex items-center gap-2 pl-1 text-sm text-astronaut-700">
              닉네임{" "}
              <span className="flex select-none items-center gap-1">
                {isDisplayNameValid === true ? (
                  <ValidSvg className="inline h-3 w-3 fill-[green]" />
                ) : isDisplayNameValid === false ? (
                  <InvalidSvg className="inline h-3 w-3 fill-[firebrick]" />
                ) : null}

                <p className="text-xs text-[firebrick]">
                  {displayNameInvalidReason}
                </p>
              </span>
            </h4>
            <p className="break-keep pb-1 pl-1 text-xs text-astronaut-400">
              일반적으로 표시할 이름입니다.
            </p>
            <input
              type="text"
              placeholder="2~16 글자"
              value={displayName}
              onChange={onDisplayNameChange}
              className="rounded-lg border border-astronaut-200 bg-white py-1 pl-2  outline-none"
              maxLength={20}
              disabled={isLoading}
            />
          </label>
          <label className="flex flex-col">
            <h4 className="flex items-center gap-2 pl-1 text-sm text-astronaut-700">
              식별 아이디{" "}
              <span className="flex select-none items-center gap-1">
                {isDisplayIdValid === true ? (
                  <ValidSvg className="inline h-3 w-3 fill-[green]" />
                ) : isDisplayIdValid === false ? (
                  <InvalidSvg className="inline h-3 w-3 fill-[firebrick]" />
                ) : null}
                <p className="text-xs text-[firebrick]">
                  {displayIdInvalidReason}
                </p>
              </span>
            </h4>
            <p className="break-keep pb-1 pl-1 text-xs text-astronaut-400">
              사용자를 구분하는데 사용되는 중복 불가능한 이름입니다.
            </p>
            <input
              type="text"
              value={displayId.toLowerCase()}
              placeholder="2~16 소문자 알파벳"
              onChange={onDisplayIdChange}
              className="rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none"
              maxLength={20}
              disabled={isLoading}
            />
            <p className="ml-2 mt-1 text-xs text-astronaut-500">
              folio-jpeg.rarebeef.co.kr/
              {displayId.toLowerCase() || "식별 아이디"}
            </p>
          </label>
          <label className="flex flex-col">
            <h4 className="flex items-center gap-2 pl-1 text-sm text-astronaut-700">
              소개글{" "}
            </h4>
            <p className="break-keep pb-1 pl-1 text-xs text-astronaut-400">
              프로필 페이지에 표시할 짧은 소개글입니다.
            </p>
            <textarea
              value={introduce}
              placeholder="최대 150자"
              onChange={onIntroduceChange}
              className="max-h-[200px] min-h-[50px] rounded-lg border border-astronaut-200 bg-white py-1 pl-2 outline-none"
              maxLength={150}
              disabled={isLoading}
            />
          </label>
          <div className="flex flex-col">
            <h4 className="flex items-center gap-2 pl-1 text-sm text-astronaut-700">
              링크{" "}
            </h4>
            <p className="break-keep pb-1 pl-1 text-xs text-astronaut-400">
              프로필에 최대 5개까지 링크를 추가합니다.
            </p>
            <div className="flex flex-col gap-y-2">
              {...linkInputs(linkCount)}
              {linkCount < 5 && (
                <button
                  className={`grow rounded-lg border border-astronaut-200 bg-astronaut-200 py-1 pl-2 font-semibold text-white hover:border-astronaut-100 hover:bg-astronaut-100`}
                  onClick={() => onAdjustLink(1)}
                >
                  링크 추가
                </button>
              )}
            </div>
            <div className="ml-2 mt-2 flex flex-col gap-1">
              {links.map((link, i) =>
                link ? (
                  <a
                    href={ensureHttp(link)}
                    key={link + i}
                    target="_blank"
                    className="w-full fill-astronaut-500 text-xs text-astronaut-500"
                  >
                    <ExternalLink href={link} />
                  </a>
                ) : null,
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="flex items-center gap-2 pl-1 text-sm text-astronaut-700">
              푸시 알림
            </h4>
            <p className="break-keep pb-1 pl-1 text-xs text-astronaut-400">
              새로운 팔로워나 댓글, 좋아요 등 사진의 반응에 대한 알림을
              받습니다.
            </p>
            <div className="flex gap-2 py-1 pl-1 text-sm">
              <label className="inline-flex gap-1">
                <input
                  onChange={onAllowPushChange}
                  checked={allowPush === "true"}
                  type="radio"
                  value="true"
                  name="allow-push"
                />
                허용
              </label>
              <label className="inline-flex gap-1">
                <input
                  onChange={onAllowPushChange}
                  checked={allowPush === "false"}
                  type="radio"
                  value="false"
                  name="allow-push"
                />
                허용 안함
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {isLoading ? (
              <Loading height="40px" />
            ) : (
              <Button
                onClick={onSubmit}
                type="submit"
                disabled={
                  isLoading ||
                  isDisplayIdValid === false ||
                  isDisplayNameValid === false ||
                  isProfileImageValid === false ||
                  linkValid.some((valid) => !valid)
                }
              >
                <div>프로필 설정 완료</div>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
