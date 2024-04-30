import { auth, db } from "@/fb";
import useInput from "@/hooks/useInput";
import { commentsState, imageItemState } from "@/recoil/states";
import { Comment, Comments } from "@/types";
import { User, onAuthStateChanged } from "firebase/auth";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { FormEvent, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";

const CommentForm = ({
  imageId,
  parentId,
}: {
  imageId: string;
  parentId?: string | null;
}) => {
  const [comments, setComments] = useRecoilState(
    commentsState(imageId as string),
  );
  const [imageItem, setImageItem] = useRecoilState(imageItemState(imageId));
  const [userData, setUserData] = useState<User | null>(null);
  const { value: content, onChange: onContentChange } = useInput("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUserData(user);
    });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userData || !content || !imageItem) return;

    const commentId = uuidv4();

    const comment: Comment = {
      id: commentId,
      content,
      createdAt: Date.now(),
      uid: userData.uid,
      replies: [],
    };

    let prevComments: Comments | null;

    if (!parentId) {
      // 댓글 쓰기
      const docRef = doc(db, "images", imageItem.id, "comments", commentId);
      setComments((prev) => {
        prevComments = prev;
        return { ...prev, [commentId]: comment };
      });
      await setDoc(docRef, comment).catch((error) => {
        setComments(prevComments);
      });
    } else {
      // 답글 쓰기
      const docRef = doc(db, "images", imageItem.id, "comments", parentId);
      setComments((prev) => {
        prevComments = prev;
        if (!prev) return prevComments;
        const parentComment = prev[parentId];

        return {
          ...prev,
          [parentId]: {
            ...parentComment,
            replies: [...parentComment.replies, comment],
          },
        };
      });
      await updateDoc(docRef, { replies: arrayUnion(comment) }).catch(
        (error) => {
          setComments(prevComments);
        },
      );
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input value={content} onChange={onContentChange} />
      <button>댓글 등록</button>
    </form>
  );
};

export default CommentForm;
