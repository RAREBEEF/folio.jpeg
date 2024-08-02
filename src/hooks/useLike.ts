import { db } from "@/fb";
import {
  authStatusState,
  imageDataState,
  loginModalState,
} from "@/recoil/states";
import { ImageDocData, ImageData } from "@/types";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import useSendFcm from "./useSendFcm";
import useErrorAlert from "./useErrorAlert";
import useImagePopularity from "./useImagePopularity";

const useLike = ({ imageId }: { imageId: string }) => {
  const showErrorAlert = useErrorAlert();
  const sendFcm = useSendFcm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setLoginModal = useSetRecoilState(loginModalState);
  const [imageData, setImageData] = useRecoilState(
    imageDataState(imageId as string),
  );

  const authStatus = useRecoilValue(authStatusState);
  const [alreadyLiked, setAlreadyLiked] = useState<boolean>(false);
  const checkAlreadyLiked = useCallback(
    (imageData: ImageData | ImageDocData, uid: string) => {
      const alreadyLiked = imageData.likes.includes(uid);
      setAlreadyLiked(alreadyLiked);
    },
    [],
  );
  const { adjustPopularity } = useImagePopularity({ imageId });

  useEffect(() => {
    if (authStatus.data && imageData) {
      checkAlreadyLiked(imageData, authStatus.data.uid);
    }
  }, [checkAlreadyLiked, imageData, authStatus]);

  // 업데이트 전 상태 백업
  let prevLikes: Array<string>;

  // 좋아요
  const like = async (tokens: Array<string> | null) => {
    console.log("useLike");
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
    setImageData((prev) => {
      if (prev === null) return null;
      prevLikes = prev.likes;
      return { ...prev, likes: [...prevLikes, authStatus.data!.uid] };
    });

    try {
      await updateDoc(docRef, {
        likes: arrayUnion(authStatus.data.uid),
      });
      // 사진 게시자에게 푸시 알림 전송
      await sendFcm({
        data: {
          title: `${authStatus.data?.displayName}님이 사진에 좋아요를 눌렀습니다.`,
          body: null,
          profileImage: authStatus.data?.photoURL,
          targetImage: imageData?.URL,
          click_action: `/image/${imageId}`,
          fcmTokens: tokens ? tokens : null,
          tokenPath: tokens ? null : `users/${imageData?.uid}`,
          uids: imageData?.uid ? [imageData.uid] : null,
        },
      });
    } catch (error) {
      // 에러 시 롤백
      setImageData((prev) => {
        if (prev === null) return null;
        return { ...prev, likes: [...prevLikes] };
      });
      showErrorAlert();
    } finally {
      await adjustPopularity(2);
      setIsLoading(false);
    }
  };

  // 좋아요 취소
  const dislike = async () => {
    console.log("useLike");
    if (
      typeof imageId !== "string" ||
      authStatus.status !== "signedIn" ||
      !authStatus.data ||
      isLoading
    )
      return;

    setIsLoading(true);

    try {
      const docRef = doc(db, "images", imageId);
      setImageData((prev) => {
        if (prev === null) return null;
        prevLikes = prev.likes;
        const newlikes = prevLikes.filter(
          (uid) => uid !== authStatus.data!.uid,
        );
        return { ...prev, likes: newlikes };
      });

      await updateDoc(docRef, {
        likes: arrayRemove(authStatus.data.uid),
      });
    } catch (error) {
      // 에러 시 롤백
      setImageData((prev) => {
        if (prev === null) return null;
        return { ...prev, likes: [...prevLikes] };
      });
      showErrorAlert();
    } finally {
      await adjustPopularity(-2);
      setIsLoading(false);
    }
  };

  return { like, dislike, alreadyLiked, isLoading };
};

export default useLike;
