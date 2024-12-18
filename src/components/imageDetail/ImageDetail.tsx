"use client";

import {
  deviceState,
  imageDataState,
  userDataState,
  usersDataState,
} from "@/recoil/states";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import CommentList from "@/components/comment/CommentList";
import Like from "./Like";
import useGetImage from "@/hooks/useGetImage";
import Loading from "@/components/loading/Loading";
import RecommendImageList from "../imageList/RecommendImageList";
import ArrowSvg from "@/icons/arrow-left-solid.svg";
import CommentForm from "@/components/comment/CommentForm";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/fb";
import { ExtraUserData, UserData } from "@/types";
import ProfileCard from "@/components/user/ProfileCard";
import ManageImage from "./ManageImage";
import BrokenSvg from "@/icons/link-slash-solid.svg";
import SaveButton from "../saveImage/SaveButton";
import InfoSvg from "@/icons/circle-info-solid.svg";
import XSvg from "@/icons/xmark-solid.svg";
import _ from "lodash";
import MetadataInfo from "./MetadataInfo";
import useImagePopularity from "@/hooks/useImagePopularity";
import SadSvg from "@/icons/face-frown-regular.svg";
import Button from "../Button";

const ImageDetail = () => {
  const device = useRecoilValue(deviceState);
  const [smallViewport, setSmallViewport] = useState<boolean>(false);
  const disableHoverInfo = useMemo(
    () => device === "mobile" || smallViewport,
    [device, smallViewport],
  );
  const isInitialMount = useRef(true);
  const { replace } = useRouter();
  const [displayId, setDisplayId] = useState<string>("");
  const { getImageData, isLoading } = useGetImage();
  const { back } = useRouter();
  const { id } = useParams();
  const imageId = useMemo(() => JSON.stringify(id).replaceAll('"', ""), [id]);
  const [userData, setUserData] = useRecoilState(userDataState(displayId));
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [author, setAuthor] = useState<UserData | null>(null);
  const [imageData, setImageData] = useRecoilState(imageDataState(imageId));
  const [isImageBroken, setIsImageBroken] = useState<boolean>(false);
  const [infoPos, setInfoPos] = useState<[number, number]>([0, 0]);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [zoomIn, setZoomIn] = useState<boolean>(false);
  const { adjustPopularity } = useImagePopularity({
    imageId,
  });
  const [viewActionDone, setViewActionDone] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  // imageData이 null이면 직접 불러오기
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!viewActionDone) {
      setViewActionDone(true);
      (async () => {
        await adjustPopularity(1);
      })();
    }

    const needToGetImageData = imageId && !imageData && !isLoading && !notFound;

    if (needToGetImageData) {
      (async () => {
        const imageData = await getImageData({ imageId: imageId });
        if (imageData) {
          setImageData(imageData);
        } else {
          // replace("/");
          setNotFound(true);
        }
      })();
    }
  }, [
    imageData,
    imageId,
    getImageData,
    setImageData,
    isLoading,
    replace,
    viewActionDone,
    adjustPopularity,
    notFound,
  ]);

  // 작성자 상태 업데이트
  useEffect(() => {
    // 작성자 데이터를 아직 안불러왔으면
    if (!author && imageData) {
      // usersData에서 찾아보기
      if (usersData[imageData.uid]) {
        const data = usersData[imageData.uid];
        setDisplayId(data.displayId || "");
        setAuthor(data);
        // db에서 찾아오기
      } else {
        const uid = imageData.uid;

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
  }, [author, imageData, usersData, setUsersData]);

  // page user data 전역 상태 업데이트
  useEffect(() => {
    if (displayId && author) {
      setUserData(author);
    }
  }, [author, displayId, setUserData]);

  const onImageMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();

    const info = document.getElementById("metadata-info");
    if (disableHoverInfo || !info) return;

    setShowInfo(true);

    const infoWidth = info.clientWidth || 0;
    const infoHeight = info.clientHeight || 0;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const imgClientRect = e.currentTarget.getBoundingClientRect();
    const imgX = imgClientRect.x;
    const imgY = imgClientRect.y;
    const imgWidth = imgClientRect.width;
    const imgHeight = imgClientRect.height;
    const imgXEnd = imgX + imgWidth;
    const imgYEnd = imgY + imgHeight;

    const xPos = mouseX - infoWidth / 2;
    const maxXPos = imgXEnd - infoWidth;
    const minXPos = imgX;

    const yPos = mouseY - infoHeight / 2;
    const maxYPos = imgYEnd - infoHeight;
    const minYPos = imgY;

    setInfoPos([
      Math.max(minXPos, Math.min(xPos, maxXPos)),
      Math.max(minYPos, Math.min(yPos, maxYPos)),
    ]);
  };

  const onImageMouseOut = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    if (disableHoverInfo) return;

    setShowInfo(false);
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

  const onShowMetadataClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const btnClientRect = e.currentTarget.getBoundingClientRect();
    const btnX = btnClientRect.x;
    const btnY = btnClientRect.y;

    setShowInfo((show) => {
      if (!show) {
        setInfoPos([btnX, btnY]);

        const close = () => {
          setShowInfo(false);
        };

        window.addEventListener("scroll", close, { once: true });
      }

      return !show;
    });
  };

  useEffect(() => {
    const windowResizeHandler = _.debounce(() => {
      if (window.innerWidth <= 550) {
        setSmallViewport(true);
        setShowInfo(false);
      } else {
        setSmallViewport(false);
      }
    }, 100);
    window.addEventListener("resize", windowResizeHandler);
    windowResizeHandler();
    return () => {
      window.removeEventListener("resize", windowResizeHandler);
    };
  }, []);

  return (
    <div className="relative h-full bg-white px-10 xs:px-4">
      {notFound ? (
        <div className="flex h-full items-center justify-center py-12">
          <div className="text-center">
            <SadSvg className="m-auto mb-8 w-[50%] fill-astronaut-200" />
            <p className="text-xl font-semibold text-astronaut-500">
              존재하지 않거나 삭제된 이미지입니다.
            </p>
            <nav className="mt-4 flex justify-center">
              <Button href="/">
                <div className="text-sm">홈으로</div>
              </Button>
            </nav>
          </div>
        </div>
      ) : imageData ? (
        <div>
          <nav className="sticky top-16 z-10 flex items-center justify-between py-4 xs:hidden">
            <button
              className="flex aspect-square h-fit items-center gap-2 rounded-full bg-white px-2 py-1 font-semibold text-astronaut-700"
              onClick={() => {
                back();
              }}
            >
              <ArrowSvg className="h-5 fill-astronaut-700 transition-all hover:fill-astronaut-500" />
            </button>
          </nav>

          <div className="m-auto flex w-full max-w-[1440px] flex-col items-center rounded-lg p-10 shadow-lg xs:p-4">
            {imageData && (
              <div className="relative flex w-full gap-8 sm:flex-col sm:gap-4">
                <div className="z-10 shrink-0 basis-[50%] text-center">
                  <div
                    style={{
                      aspectRatio: `${imageData.size.width}/${imageData.size.height}`,
                      maxHeight: "calc(100vh - 150px)",
                    }}
                    className="sticky top-28 m-auto w-auto max-w-[80vw] rounded-xl bg-gradient-to-br from-astronaut-100 to-astronaut-300"
                  >
                    {isImageBroken ? (
                      <BrokenSvg
                        style={{
                          aspectRatio: `${imageData.size.width}/${imageData.size.height}`,
                        }}
                        className={`rounded-xl fill-astronaut-500 p-[20%]`}
                      />
                    ) : (
                      <Image
                        onClick={onZoomIn}
                        priority
                        placeholder="empty"
                        style={{ background: imageData.themeColor }}
                        className={`cursor-zoom-in rounded-xl`}
                        src={imageData.URL}
                        alt={imageData.title || imageData.fileName}
                        layout="fill"
                        objectFit="contain"
                        onMouseMove={onImageMouseMove}
                        onMouseOut={onImageMouseOut}
                        onError={() => {
                          setIsImageBroken(true);
                        }}
                      />
                    )}
                    {disableHoverInfo && (
                      <button
                        onClick={onShowMetadataClick}
                        className="absolute right-2 top-2 z-40 aspect-square h-5 w-5 rounded-full"
                      >
                        {showInfo ? (
                          <XSvg className="h-5 w-5 fill-astronaut-50" />
                        ) : (
                          <InfoSvg className="h-5 w-5 fill-astronaut-50" />
                        )}
                      </button>
                    )}
                  </div>
                  <MetadataInfo
                    imageData={imageData}
                    showInfo={showInfo}
                    disableHoverInfo={disableHoverInfo}
                    infoPos={infoPos}
                  />
                </div>

                <div className="basis-[50%] p-2">
                  <div className="flex justify-between">
                    {<ProfileCard profileData={author} />}
                    <div className="flex">
                      <ManageImage imageId={imageData.id} />
                    </div>
                  </div>

                  <div className="z-20 my-4 break-keep ">
                    <h2 className="text-xl font-semibold">{imageData.title}</h2>
                    <div className="whitespace-pre-line text-astronaut-900">
                      {imageData.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-2 text-lg font-semibold ">댓글</h3>
                    <div>
                      <CommentList imageData={imageData} />
                    </div>
                  </div>

                  <div
                    id="image-detail__sticky-comment-form"
                    className="sticky bottom-0 z-10 mt-4 border-t bg-white px-2 pb-8 pt-4"
                  >
                    <div className="mb-4 flex justify-between gap-4 px-2">
                      <Like author={author} />
                      <div className="w-6 items-center">
                        <SaveButton
                          tooltip={true}
                          color="gray"
                          imageData={imageData}
                        />
                      </div>
                    </div>
                    <CommentForm
                      imageId={imageData.id}
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
            <RecommendImageList
              imageData={imageData}
              type={`recommend-${id}`}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Loading />
        </div>
      )}

      {imageData && zoomIn && (
        <div
          onClick={onZoomOut}
          className="fixed left-0 top-0 z-50 h-screen w-screen cursor-zoom-out bg-astronaut-950"
        >
          <Image
            priority
            placeholder="empty"
            style={{ background: imageData.themeColor }}
            className={`rounded-xl`}
            src={imageData.URL}
            alt={imageData.title || imageData.fileName}
            layout="fill"
            objectFit="contain"
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
