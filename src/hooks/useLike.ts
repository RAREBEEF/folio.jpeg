import { auth, db } from "@/fb";
import { imageItemState } from "@/recoil/states";
import { ImageDocData, ImageItem } from "@/types";
import { User, onAuthStateChanged } from "firebase/auth";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";

const useLike = (imageId: string | Array<string>) => {
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(imageId as string),
  );
  const [userData, setUserData] = useState<User | null>(null);
  const [alreadyLiked, setAlreadyLiked] = useState<boolean>(false);
  const checkAlreadyLiked = useCallback(
    (imageItem: ImageItem | ImageDocData, uid: string) => {
      const alreadyLiked = imageItem.likes.includes(uid);
      setAlreadyLiked(alreadyLiked);
    },
    [],
  );

  // 유저 데이터
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUserData(user);
      if (user && imageItem) {
        checkAlreadyLiked(imageItem, user.uid);
      }
    });
  }, [checkAlreadyLiked, imageItem]);

  let prevLikes: Array<string>;

  const like = async () => {
    if (typeof imageId !== "string") return;
    if (!userData) {
      window.alert("로그인 하세요.");
      return;
    }

    const docRef = doc(db, "images", imageId);
    setImageItem((prev) => {
      if (prev === null) return null;
      prevLikes = prev.likes;
      return { ...prev, likes: [...prevLikes, userData.uid] };
    });

    await updateDoc(docRef, {
      likes: arrayUnion(userData.uid),
    }).catch((error) => {
      setImageItem((prev) => {
        if (prev === null) return null;
        return { ...prev, likes: [...prevLikes] };
      });
    });
  };

  const dislike = async () => {
    if (typeof imageId !== "string" || !userData) return;

    const docRef = doc(db, "images", imageId);
    setImageItem((prev) => {
      if (prev === null) return null;
      prevLikes = prev.likes;
      const newlikes = prevLikes.filter((uid) => uid !== userData.uid);
      return { ...prev, likes: newlikes };
    });

    await updateDoc(docRef, {
      likes: arrayRemove(userData.uid),
    }).catch((error) => {
      setImageItem((prev) => {
        if (prev === null) return null;
        return { ...prev, likes: [...prevLikes] };
      });
    });
  };

  return { like, dislike, alreadyLiked };
};

export default useLike;
