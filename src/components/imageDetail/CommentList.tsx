import { db } from "@/fb";
import { commentsState } from "@/recoil/states";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import CommentForm from "../form/CommentForm";
import Comment from "./Comment";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Comment as CommentType, Comments } from "@/types";

const CommentList = ({ imageId }: { imageId: string }) => {
  const [comments, setComments] = useRecoilState(
    commentsState(imageId as string),
  );

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
      <ol className="flex flex-col gap-4">
        {!comments || Object.keys(comments).length === 0 ? (
          <div className="text-shark-500">아직 댓글이 없습니다.</div>
        ) : (
          Object.keys(comments).map((id, i) => {
            const comment = comments[id];
            return <Comment imageId={imageId} comment={comment} key={i} />;
          })
        )}
      </ol>
    </div>
  );
};

export default CommentList;
