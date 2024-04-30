import { auth, db } from "@/fb";
import useLike from "@/hooks/useLike";
import { imageItemState } from "@/recoil/states";
import { ImageDocData, ImageItem } from "@/types";
import { User, onAuthStateChanged } from "firebase/auth";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";

const Like = () => {
  const { id } = useParams();
  // const [userData, setUserData] = useState<User | null>(null);
  const { like, dislike, alreadyLiked } = useLike(id);
  // const [alreadyLiked, setAlreadyLiked] = useState<boolean>(false);
  const [imageItem, setImageItem] = useRecoilState(
    imageItemState(id as string),
  );

  // const checkAlreadyLiked = useCallback(
  //   (imageItem: ImageItem | ImageDocData, uid: string) => {
  //     const alreadyLiked = imageItem.likes.includes(uid);
  //     setAlreadyLiked(alreadyLiked);
  //   },
  //   [],
  // );

  // // 유저 데이터
  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     setUserData(user);
  //     if (user && imageItem) {
  //       checkAlreadyLiked(imageItem, user.uid);
  //     }
  //   });
  // }, [checkAlreadyLiked, imageItem]);

  // 좋아용
  const onLikeClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!id || typeof id !== "string" || !imageItem) return;
    // if (!id || typeof id !== "string" || !userData || !imageItem) return;

    // const docRef = doc(db, "images", id);

    // let prevLikes: Array<string>;

    if (!alreadyLiked) {
      like();
      // setImageItem((prev) => {
      //   if (prev === null) return null;
      //   prevLikes = prev.likes;
      //   return { ...prev, likes: [...prevLikes, userData.uid] };
      // });

      // await updateDoc(docRef, {
      //   likes: arrayUnion(userData.uid),
      // }).catch((error) => {
      //   setImageItem((prev) => {
      //     if (prev === null) return null;
      //     return { ...prev, likes: [...prevLikes] };
      //   });
      // });
    } else {
      dislike();
      // setImageItem((prev) => {
      //   if (prev === null) return null;
      //   prevLikes = prev.likes;
      //   const newlikes = prevLikes.filter((uid) => uid !== userData.uid);
      //   return { ...prev, likes: newlikes };
      // });

      // await updateDoc(docRef, {
      //   likes: arrayRemove(userData.uid),
      // }).catch((error) => {
      //   setImageItem((prev) => {
      //     if (prev === null) return null;
      //     return { ...prev, likes: [...prevLikes] };
      //   });
      // });
    }
  };

  return (
    !!imageItem && (
      <div>
        <div>좋아용: {imageItem.likes.length}</div>
        <button onClick={onLikeClick}>
          {alreadyLiked ? "이미 누름" : "좋아요 증가하는 버튼"}
        </button>
      </div>
    )
  );
};

export default Like;
