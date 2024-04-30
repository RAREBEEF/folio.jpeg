import { auth, db } from "@/fb";
import { commentsState, imageItemState } from "@/recoil/states";
import { User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Comment as CommentType, Comments } from "@/types";

const CommentList = ({ imageId }: { imageId: string }) => {
  // const [imageItem, setImageItem] = useRecoilState(imageItemState(imageId));
  const [comments, setComments] = useRecoilState(
    commentsState(imageId as string),
  );
  // const [userData, setUserData] = useState<User | null>(null);

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     setUserData(user);
  //   });
  // }, []);

  useEffect(() => {
    (async () => {
      const commentsRef = collection(db, "images", imageId, "comments");
      const q = query(commentsRef, orderBy("createdAt", "asc"));
      const docSnap = await getDocs(q);
      const comments: Comments = {};
      docSnap.forEach((doc) => {
        comments[doc.id] = doc.data() as CommentType;
      });

      setComments(comments);
    })();
  }, [imageId, setComments]);

  return (
    <div>
      <ol>
        {!comments || Object.keys(comments).length === 0
          ? "댓글없음"
          : Object.keys(comments).map((id, i) => {
              const comment = comments[id];
              return <Comment imageId={imageId} comment={comment} key={i} />;
            })}
      </ol>
      <CommentForm imageId={imageId} />
    </div>
  );
};

export default CommentList;
