import { Comment as CommentType, Comments } from "@/types";
import CommentForm from "./CommentForm";
import { MouseEvent, useEffect, useState } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/fb";
import { commentsState } from "@/recoil/states";
import { useRecoilState } from "recoil";
import { User, onAuthStateChanged } from "firebase/auth";

const Comment = ({
  imageId,
  comment,
  parentId = null,
}: {
  imageId: string;
  comment: CommentType;
  parentId?: string | null;
}) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [comments, setComments] = useRecoilState(
    commentsState(imageId as string),
  );

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUserData(user);
    });
  }, []);

  // 삭제
  const onDeleteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!userData || userData.uid !== comment.uid) return;

    let prevComments: Comments | null;

    if (!parentId) {
      const docRef = doc(db, "images", imageId, "comments", comment.id);

      setComments((prev) => {
        prevComments = prev;
        if (!prev) return prevComments;
        const newComments = { ...prevComments };
        delete newComments![comment.id];

        return newComments;
      });

      await deleteDoc(docRef).catch((error) => {
        setComments(prevComments);
      });
    } else {
      const docRef = doc(db, "images", imageId, "comments", parentId);

      let newReplies: Array<CommentType> = [];

      setComments((prev) => {
        prevComments = prev;
        if (!prev) return prevComments;
        const parentComment = prev[parentId];
        const replies = parentComment.replies;
        newReplies = replies.filter((reply) => reply.id !== comment.id);

        return {
          ...prev,
          [parentId]: {
            ...parentComment,
            replies: newReplies,
          },
        };
      });

      await updateDoc(docRef, { replies: newReplies }).catch((error) => {
        setComments(prevComments);
      });
    }
  };

  return (
    <li className="m-2 border">
      {comment.content}
      {!parentId && (
        <div className="pl-12">
          <ol>
            {comment.replies.map((reply, j) => {
              return (
                <Comment
                  imageId={imageId}
                  comment={reply}
                  key={j}
                  parentId={comment.id}
                />
              );
            })}
          </ol>

          <CommentForm imageId={imageId} parentId={comment.id} />
        </div>
      )}
      {userData?.uid === comment.uid && (
        <button onClick={onDeleteClick}>삭제</button>
      )}
    </li>
  );
};

export default Comment;
