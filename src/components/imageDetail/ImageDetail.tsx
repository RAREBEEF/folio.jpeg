"use client";

import {
  imageItemState,
  pageUserDataState,
  usersDataState,
} from "@/recoil/states";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import CommentList from "./CommentList";
import Like from "./Like";
import useGetImageItem from "@/hooks/useGetImageItem";
import Loading from "../Loading";
import RecommendImageList from "../imageList/RecommendImageList";
import ArrowIcon from "@/icons/arrow-left-solid.svg";
import CommentForm from "../form/CommentForm";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/fb";
import { ExtraUserData, UserData } from "@/types";
import ProfileCard from "./ProfileCard";

const ImageDetail = () => {
  const [displayId, setDisplayId] = useState<string>("");
  const { getImageItem, isLoading } = useGetImageItem();
  const { back } = useRouter();
  const { id } = useParams();
  const [pageUserData, setPageUserData] = useRecoilState(
    pageUserDataState(displayId),
  );
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [author, setAuthor] = useState<UserData | null>(null);
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(id as string),
  );

  // imageItem이 null이면 직접 불러오기
  useEffect(() => {
    if (id && typeof id === "string" && !imageItem && !isLoading) {
      (async () => {
        const imageItem = await getImageItem(id);
        setImageItem(imageItem);
      })();
    }
  }, [imageItem, id, getImageItem, setImageItem, isLoading]);

  // 작성자 상태 업데이트
  useEffect(() => {
    if (!author && imageItem) {
      if (usersData[imageItem.uid]) {
        const data = usersData[imageItem.uid];
        setDisplayId(data.displayId || "");
        setAuthor(data);
      } else {
        console.log("작성자 상태 업데이트");
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
      setPageUserData(author);
    }
  }, [author, displayId, setPageUserData]);

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
            {/* <ManageImage id={JSON.stringify(id).replaceAll('"', "")} /> */}
          </nav>

          <div className="m-auto flex w-full max-w-[1440px] flex-col items-center rounded-lg p-10 shadow-lg xs:p-4">
            {imageItem && (
              <div className="relative flex w-full gap-8 sm:flex-col sm:gap-4">
                <div className="z-20 shrink-0 basis-[50%] text-center">
                  <div
                    style={{
                      aspectRatio: `${imageItem.size.width}/${imageItem.size.height}`,
                      maxHeight: "calc(100vh - 150px)",
                    }}
                    className="relative sticky top-28  m-auto w-auto max-w-[80vw] rounded-xl bg-gradient-to-br from-shark-100 to-shark-300"
                  >
                    <Image
                      priority
                      placeholder="empty"
                      style={{ background: imageItem.themeColor }}
                      className={`rounded-xl`}
                      src={imageItem.url}
                      alt={imageItem.title || imageItem.fileName}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="basis-[50%] p-2">
                  <div>{<ProfileCard profileData={author} />}</div>

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

                  <div className="sticky bottom-0 z-10 mt-4 border-t bg-shark-50 py-4">
                    <div className="mb-4">
                      <Like />
                    </div>
                    <CommentForm imageId={imageItem.id} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12">
            <h3 className="text-center text-lg font-semibold text-shark-950">
              비슷한 이미지
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
