import { db } from "@/fb";
import useInput from "@/hooks/useInput";
import {
  authStatusState,
  commentsState,
  imageItemState,
  loginModalState,
} from "@/recoil/states";
import { Comment, Comments } from "@/types";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { FormEvent, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";
import Button from "../Button";
import Loading from "../Loading";

const CommentForm = ({
  imageId,
  parentId,
}: {
  imageId: string;
  parentId?: string | null;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setLoginModal = useSetRecoilState(loginModalState);
  const setComments = useSetRecoilState(commentsState(imageId as string));
  const imageItem = useRecoilValue(imageItemState(imageId));
  const authStatus = useRecoilValue(authStatusState);
  const {
    value: content,
    setValue: setContent,
    onChange: onContentChange,
  } = useInput("");

  // 댓글 등록
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content || !imageItem || isLoading) return;

    if (authStatus.status === "pending") {
      return;
      // 로그인 상태가 아닌 경우 로그인창
    } else if (authStatus.status !== "signedIn" || !authStatus.data) {
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
      return;
    }

    setIsLoading(true);

    const commentId = uuidv4();

    const comment: Comment = {
      id: commentId,
      content,
      createdAt: Date.now(),
      uid: authStatus.data.uid,
      replies: [],
    };

    // 업데이트 전 상태 백업
    let prevComments: Comments | null;

    if (!parentId) {
      // 댓글 쓰기
      const docRef = doc(db, "images", imageItem.id, "comments", commentId);
      setComments((prev) => {
        prevComments = prev;
        return { ...prev, [commentId]: comment };
      });
      await setDoc(docRef, comment)
        .then(() => {
          setContent("");
        })
        .catch((error) => {
          // 에러 시 롤백
          setComments(prevComments);
        })
        .finally(() => {
          setIsLoading(false);
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
      await updateDoc(docRef, { replies: arrayUnion(comment) })
        .then(() => {
          setContent("");
        })
        .catch((error) => {
          // 에러 시 롤백
          setComments(prevComments);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <form className="gap flex text-sm" onSubmit={onSubmit}>
      <input
        className="min-w-2 grow rounded-l-lg p-2 outline-none"
        value={content}
        placeholder={
          authStatus.status === "signedIn" ||
          authStatus.status === "noExtraData"
            ? parentId
              ? "답글 추가"
              : "댓글 추가"
            : "로그인 후 댓글을 작성해 보세요."
        }
        onChange={onContentChange}
        maxLength={100}
      />
      <div className="shrink-0">
        <Button
          type="submit"
          tailwindStyle="rounded-r-lg rounded-l-none"
          disabled={isLoading}
        >
          {isLoading ? <Loading /> : <div>등록</div>}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
