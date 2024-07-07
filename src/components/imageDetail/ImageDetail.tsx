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
            fetch("/api/get-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ uid }),
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

  return (
    <div className="relative h-full bg-shark-50 px-10 xs:px-4">
      {imageItem ? (
        <div>
          <nav className="fixed top-16 z-10 flex items-center justify-between py-4 xs:hidden">
            <button
              className="flex aspect-square h-fit items-center gap-2 rounded-full bg-shark-50 px-2 py-1 font-semibold text-shark-700"
              onClick={() => {
                back();
              }}
            >
              <ArrowIcon className="h-5 fill-shark-700 transition-all hover:fill-shark-500" />
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
                    className="relative sticky top-28 m-auto w-auto max-w-[80vw] rounded-xl bg-gradient-to-br from-shark-100 to-shark-300"
                  >
                    {isImageBroken ? (
                      <BrokenSvg
                        style={{
                          aspectRatio: `${imageItem.size.width}/${imageItem.size.height}`,
                        }}
                        className={`rounded-xl fill-shark-500 p-[20%]`}
                      />
                    ) : (
                      <Image
                        priority
                        placeholder="empty"
                        style={{ background: imageItem.themeColor }}
                        className={`rounded-xl`}
                        src={imageItem.URL}
                        alt={imageItem.title || imageItem.fileName}
                        layout="fill"
                        objectFit="contain"
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
                        <RefreshIcon className="h-7 fill-shark-700 p-1 transition-all hover:fill-shark-500" />
                      </button>
                      <ManageImage id={imageItem.id} />
                    </div>
                  </div>

                  <div className="z-20 my-4 break-keep text-shark-950">
                    <h2 className="text-xl font-semibold">{imageItem.title}</h2>
                    <div className="text-shark-900">
                      {imageItem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-2 text-lg font-semibold text-shark-950">
                      댓글
                    </h3>
                    <div>
                      <CommentList imageId={imageItem.id} />
                    </div>
                  </div>

                  <div className="sticky bottom-0 z-10 mt-4 border-t bg-shark-50 px-4 pb-8 pt-4 xs:bottom-[70px]">
                    <div className="mb-4 flex justify-end gap-4">
                      <Like author={author} />
                      <div className="w-6 items-center">
                        <SaveButton color="gray" imageItem={imageItem} />
                      </div>
                    </div>
                    <CommentForm imageId={imageItem.id} author={author} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12">
            <h3 className="text-center text-lg font-semibold text-shark-950">
              추천 이미지
            </h3>
            <RecommendImageList imageItem={imageItem} />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default ImageDetail;
