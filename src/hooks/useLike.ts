import { db } from "@/fb";
import {
  authStatusState,
  imageItemState,
  loginModalState,
} from "@/recoil/states";
import { ImageDocData, ImageItem } from "@/types";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

const useLike = (imageId: string | Array<string>) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setLoginModal = useSetRecoilState(loginModalState);
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(imageId as string),
  );
  const authStatus = useRecoilValue(authStatusState);
  const [alreadyLiked, setAlreadyLiked] = useState<boolean>(false);
  const checkAlreadyLiked = useCallback(
    (imageItem: ImageItem | ImageDocData, uid: string) => {
      const alreadyLiked = imageItem.likes.includes(uid);
      setAlreadyLiked(alreadyLiked);
    },
    [],
  );

  useEffect(() => {
    if (authStatus.data && imageItem) {
      checkAlreadyLiked(imageItem, authStatus.data.uid);
    }
  }, [checkAlreadyLiked, imageItem, authStatus]);

  // 업데이트 전 상태 백업
  let prevLikes: Array<string>;

  const like = async () => {
    if (typeof imageId !== "string" || isLoading) return;

    if (authStatus.status !== "signedIn" || !authStatus.data) {
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
      return;
    }

    setIsLoading(true);

    const docRef = doc(db, "images", imageId);
    setImageItem((prev) => {
      if (prev === null) return null;
      prevLikes = prev.likes;
      return { ...prev, likes: [...prevLikes, authStatus.data!.uid] };
    });

    await updateDoc(docRef, {
      likes: arrayUnion(authStatus.data.uid),
    })
      .catch((error) => {
        // 에러 시 롤백
        setImageItem((prev) => {
          if (prev === null) return null;
          return { ...prev, likes: [...prevLikes] };
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const dislike = async () => {
    if (
      typeof imageId !== "string" ||
      authStatus.status !== "signedIn" ||
      !authStatus.data ||
      isLoading
    )
      return;

    setIsLoading(true);

    const docRef = doc(db, "images", imageId);
    setImageItem((prev) => {
      if (prev === null) return null;
      prevLikes = prev.likes;
      const newlikes = prevLikes.filter((uid) => uid !== authStatus.data!.uid);
      return { ...prev, likes: newlikes };
    });

    await updateDoc(docRef, {
      likes: arrayRemove(authStatus.data.uid),
    })
      .catch((error) => {
        // 에러 시 롤백
        setImageItem((prev) => {
          if (prev === null) return null;
          return { ...prev, likes: [...prevLikes] };
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { like, dislike, alreadyLiked, isLoading };
};

export default useLike;
