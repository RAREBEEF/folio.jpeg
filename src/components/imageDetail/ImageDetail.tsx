"use client";

import {
  commentsState,
  imageItemState,
  lastVisibleState,
  userDataState,
  usersDataState,
} from "@/recoil/states";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import CommentList from "@/components/comment/CommentList";
import Like from "./Like";
import useGetImage from "@/hooks/useGetImage";
import Loading from "@/components/loading/Loading";
import RecommendImageList from "../imageList/RecommendImageList";
import ArrowIcon from "@/icons/arrow-left-solid.svg";
import CommentForm from "@/components/comment/CommentForm";
import {
  DocumentData,
  QueryDocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/fb";
import { ExtraUserData, UserData } from "@/types";
import ProfileCard from "@/components/user/ProfileCard";
import ManageImage from "./ManageImage";
import RefreshIcon from "@/icons/rotate-right-solid.svg";
import BrokenSvg from "@/icons/link-slash-solid.svg";
import SaveButton from "../saveImage/SaveButton";

const ImageDetail = () => {
  const isInitialMount = useRef(true);
  const { replace } = useRouter();
  const [displayId, setDisplayId] = useState<string>("");
  const { getImageItem, isLoading } = useGetImage();
  const { back } = useRouter();
  const { id } = useParams();
  const imageId = useMemo(() => JSON.stringify(id).replaceAll('"', ""), [id]);
  const [userData, setUserData] = useRecoilState(userDataState(displayId));
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [author, setAuthor] = useState<UserData | null>(null);
  const [imageItem, setImageItem] = useRecoilState(imageItemState(imageId));
  const setComments = useSetRecoilState(commentsState(imageId));
  const setLastVisible = useSetRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState("comments-" + imageId));
  const [isImageBroken, setIsImageBroken] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<[number, number]>([0, 0]);
  const [metadataDirection, setMetadataDirection] = useState<"left" | "right">(
    "right",
  );
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [zoomIn, setZoomIn] = useState<boolean>(false);

  // imageItem이 null이면 직접 불러오기
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (imageId && !imageItem && !isLoading) {
      (async () => {
        const imageItem = await getImageItem({ imageId: imageId });
        if (imageItem) {
          setImageItem(imageItem);
        } else {
          replace("/");
        }
      })();
    }
  }, [imageItem, imageId, getImageItem, setImageItem, isLoading, replace]);

  // 작성자 상태 업데이트
  useEffect(() => {
    if (!author && imageItem) {
      if (usersData[imageItem.uid]) {
        const data = usersData[imageItem.uid];
        setDisplayId(data.displayId || "");
        setAuthor(data);
      } else {
        const uid = imageItem.uid;

        (async () => {
          let userData: UserData;
          let extraUserData: ExtraUserData;

          const docRef = doc(db, "users", uid);

          await Promise.all([
            fetch(`/api/user/${uid}`, {
              method: "GET",
            }).then(async (response) => {
              const { data } = await response.json();
              userData = data;
            }),
            getDoc(docRef).then((doc) => {
              extraUserData = doc.data() as ExtraUserData;
            }),
          ]).then(() => {
            const data = { ...userData, ...extraUserData, uid };
            setDisplayId(extraUserData.displayId);
            setAuthor(data);
            setUsersData((prev) => ({ ...prev, [uid]: data }));
          });
        })();
      }
    }
  }, [author, imageItem, usersData, setUsersData]);

  // page user data 전역 상태 업데이트
  useEffect(() => {
    if (displayId && author) {
      setUserData(author);
    }
  }, [author, displayId, setUserData]);

  // 이미지 새로고침
  const refreshImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setImageItem(null);
    setLastVisible(null);
    setComments(null);
  };

  const onImageMouseEnter = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    console.log("enter");
    setShowMetadata(true);
  };

  const onImageMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    console.log("move");
    if (e.clientX + 250 > window.innerWidth) {
      setMetadataDirection("left");
    } else if (e.clientX - 250 < 0) {
      setMetadataDirection("right");
    }
    setMousePos([e.clientX, e.clientY]);
  };

  const onImageMouseOut = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    console.log("out");
    setShowMetadata(false);
  };
  const onZoomIn = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    setZoomIn(true);
    document.body.style.overflow = "hidden";
  };
  const onZoomOut = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    setZoomIn(false);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="bg-astronaut-50 relative h-full px-10 xs:px-4">
      {imageItem ? (
        <div>
          <nav className="sticky top-16 z-10 flex items-center justify-between py-4 xs:hidden">
            <button
              className="bg-astronaut-50 text-astronaut-700 flex aspect-square h-fit items-center gap-2 rounded-full px-2 py-1 font-semibold"
              onClick={() => {
                back();
              }}
            >
              <ArrowIcon className="fill-astronaut-700 hover:fill-astronaut-500 h-5 transition-all" />
            </button>
          </nav>

          <div className="m-auto flex w-full max-w-[1440px] flex-col items-center rounded-lg p-10 shadow-lg xs:p-4">
            {imageItem && (
              <div className="relative flex w-full gap-8 sm:flex-col sm:gap-4">
                <div className="z-10 shrink-0 basis-[50%] text-center">
                  <div
                    style={{
                      aspectRatio: `${imageItem.size.width}/${imageItem.size.height}`,
                      maxHeight: "calc(100vh - 150px)",
                    }}
                    className="from-astronaut-100 to-astronaut-300 sticky top-28 m-auto w-auto max-w-[80vw] rounded-xl bg-gradient-to-br"
                  >
                    {isImageBroken ? (
                      <BrokenSvg
                        style={{
                          aspectRatio: `${imageItem.size.width}/${imageItem.size.height}`,
                        }}
                        className={`fill-astronaut-500 rounded-xl p-[20%]`}
                      />
                    ) : (
                      <Image
                        onClick={onZoomIn}
                        priority
                        placeholder="empty"
                        style={{ background: imageItem.themeColor }}
                        className={`cursor-zoom-in rounded-xl`}
                        src={imageItem.URL}
                        alt={imageItem.title || imageItem.fileName}
                        layout="fill"
                        objectFit="contain"
                        onMouseEnter={onImageMouseEnter}
                        onMouseMove={onImageMouseMove}
                        onMouseOut={onImageMouseOut}
                        onError={() => {
                          setIsImageBroken(true);
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="basis-[50%] p-2">
                  <div className="flex justify-between">
                    {<ProfileCard profileData={author} />}
                    <div className="flex">
                      <button onClick={refreshImage}>
                        <RefreshIcon className="fill-astronaut-700 hover:fill-astronaut-500 h-7 p-1 transition-all" />
                      </button>
                      <ManageImage id={imageItem.id} />
                    </div>
                  </div>

                  <div className="z-20 my-4 break-keep ">
                    <h2 className="text-xl font-semibold">{imageItem.title}</h2>
                    <div className="text-astronaut-900 whitespace-pre-line">
                      {imageItem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-2 text-lg font-semibold ">댓글</h3>
                    <div>
                      <CommentList imageItem={imageItem} />
                    </div>
                  </div>

                  <div
                    id="image-detail__sticky-comment-form"
                    className="bg-astronaut-50 sticky bottom-0 z-10 mt-4 border-t px-4 pb-8 pt-4"
                  >
                    <div className="mb-4 flex justify-end gap-4">
                      <Like author={author} />
                      <div className="w-6 items-center">
                        <SaveButton color="gray" imageItem={imageItem} />
                      </div>
                    </div>
                    <CommentForm
                      imageId={imageItem.id}
                      parentId={null}
                      author={author}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-12">
            <h3 className="text-center text-lg font-semibold ">추천 이미지</h3>
            <RecommendImageList imageItem={imageItem} />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Loading />
        </div>
      )}
      {showMetadata && (
        <div
          style={{
            top: `${mousePos[1]}px`,
            left: `${metadataDirection === "right" ? mousePos[0] : mousePos[0] - 250}px`,
          }}
          className="pointer-events-none fixed z-40 w-[250px] rounded-lg p-2 text-xs"
        >
          <div className="bg-astronaut-950 absolute left-0 top-0 h-full w-full rounded-lg opacity-90"></div>
          <div className="text-astronaut-50 flex flex-col gap-1 ">
            <div className="relative z-50 flex">
              <h3>카메라 모델명: </h3>
              <span className="pl-2 font-semibold">
                {imageItem?.metadata?.model || "--"}
              </span>
            </div>
            <div className="relative z-50 flex flex-wrap">
              <h3>렌즈 모델명: </h3>
              <span className="pl-2 font-semibold">
                {imageItem?.metadata?.lensModel || "--"}
              </span>
            </div>
            <div className="relative z-50 flex">
              <h3>초점 거리: </h3>
              <span className="pl-2 font-semibold">
                {imageItem?.metadata?.focalLength || "--"}mm
              </span>
            </div>
            <div className="relative z-50 flex">
              <h3>셔터스피드: </h3>
              <span className="pl-2 font-semibold">
                {imageItem?.metadata?.shutterSpeed || "--"}s
              </span>
            </div>
            <div className="relative z-50 flex">
              <h3>조리개: </h3>
              <span className="pl-2 font-semibold">
                f{imageItem?.metadata?.fNumber || "--"}
              </span>
            </div>
            <div className="relative z-50 flex">
              <h3>ISO: </h3>
              <span className="pl-2 font-semibold">
                {imageItem?.metadata?.ISO || "--"}
              </span>
            </div>
          </div>
        </div>
      )}
      {imageItem && zoomIn && (
        <div
          onClick={onZoomOut}
          className="bg-astronaut-950 fixed left-0 top-0 z-50 h-screen w-screen cursor-zoom-out"
        >
          <Image
            priority
            placeholder="empty"
            style={{ background: imageItem.themeColor }}
            className={`rounded-xl`}
            src={imageItem.URL}
            alt={imageItem.title || imageItem.fileName}
            layout="fill"
            objectFit="contain"
            onMouseEnter={onImageMouseEnter}
            onMouseMove={onImageMouseMove}
            onMouseOut={onImageMouseOut}
            quality={100}
            onError={() => {
              setIsImageBroken(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageDetail;
