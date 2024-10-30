import useInput from "@/hooks/useInput";
import {
  authStatusState,
  commentsState,
  imageDataState,
  loginModalState,
} from "@/recoil/states";
import { Comment, Comments, UserData } from "@/types";
import { FormEvent } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";
import Button from "../Button";
import Loading from "@/components//loading/Loading";
import usePostComment from "@/hooks/usePostComment";

const CommentForm = ({
  imageId,
  parentId = null,
  author,
}: {
  imageId: string;
  parentId?: string | null;
  author: UserData | null;
}) => {
  const setLoginModal = useSetRecoilState(loginModalState);
  const setComments = useSetRecoilState(commentsState(imageId as string));
  const imageData = useRecoilValue(imageDataState(imageId));
  const { postComment, isLoading } = usePostComment({
    imageData,
    author,
    parentId,
  });
  const authStatus = useRecoilValue(authStatusState);
  const {
    value: content,
    setValue: setContent,
    onChange: onContentChange,
  } = useInput("");

  // 댓글 등록
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !content ||
      !imageData ||
      isLoading ||
      authStatus.status === "pending"
    ) {
      return;
      // 로그인 상태가 아닌 경우 로그인창
    } else if (authStatus.status !== "signedIn") {
      setLoginModal({
        show: true,
        showInit: authStatus.status === "noExtraData",
      });
      return;
    }

    // setIsLoading(true);

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

      // 댓글 상태 업데이트
      setComments((prev) => {
        prevComments = prev;
        return { ...prev, [commentId]: comment };
      });

      // db에 댓글 등록
      await postComment({ comment }).catch((error) => {
        // 에러 시 롤백
        setComments(prevComments);
      });
    } else {
      // 답글 쓰기
      let parentComment: Comment | null = null;
      // 댓글 상태 업데이트
      setComments((prev) => {
        prevComments = prev;
        if (!prev) return prevComments;
        parentComment = prev[parentId];

        return {
          ...prev,
          [parentId]: {
            ...parentComment,
            replies: [...parentComment.replies, comment],
          },
        };
      });

      // db에 답글 등록
      await postComment({ comment, parentComment }).catch((error) => {
        // 에러 시 롤백
        setComments(prevComments);
      });
    }

    setContent("");
  };

  return (
    <form className="gap flex text-sm" onSubmit={onSubmit}>
      <input
        className="min-w-2 grow rounded-l-lg bg-astronaut-50 p-2 text-[16px] outline-none"
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
          <div>등록</div>
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
