"use client";

import { auth, db } from "@/fb";
import { imageItemState } from "@/recoil/states";
import { ImageDocData } from "@/types";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import CommentList from "../comment/CommentList";
import Like from "./Like";
import useGetImageItem from "@/hooks/useGetImageItem";

const ImageDetail = () => {
  const getImageItem = useGetImageItem();
  const [userData, setUserData] = useState<User | null>(null);
  const { back } = useRouter();
  const { id } = useParams();
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(id as string),
  );

  // 유저 데이터
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUserData(user);
    });
  }, []);

  // imageItem이 null이면 직접 불러오기
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    if (!imageItem) {
      (async () => {
        // const docRef = doc(db, "images", id);
        // const docSnap = await getDoc(docRef);
        // const imageData = docSnap.data() as ImageDocData;
        // setImageItem({ ...imageData, grid: null, id: docSnap.id });
        const imageItem = await getImageItem(id);
        setImageItem(imageItem);
      })();
    }
  }, [imageItem, id, getImageItem, setImageItem]);

  return (
    <div className="h-full bg-shark-50">
      <button
        onClick={() => {
          back();
        }}
      >
        go back
      </button>
      <div className="flex w-full flex-col items-center">
        {!!imageItem && (
          <div className="flex flex-col">
            <Image
              className="rounded-lg"
              src={imageItem.url}
              alt={imageItem.title || imageItem.fileName}
              width={imageItem.size.width}
              height={imageItem.size.height}
            />
            <h2>{imageItem.title}</h2>
            <div>{imageItem.description}</div>
            <Like />
            <CommentList imageId={imageItem.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDetail;
