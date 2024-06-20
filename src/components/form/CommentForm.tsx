import { db } from "@/fb";
import useInput from "@/hooks/useInput";
import {
  authStatusState,
  commentsState,
  imageItemState,
  loginModalState,
} from "@/recoil/states";
import { Comment, Comments, UserData } from "@/types";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { FormEvent, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";
import Button from "../Button";
import Loading from "../Loading";
import useSendFcm from "@/hooks/useSendFcm";

const CommentForm = ({
  imageId,
  parentId,
  author,
}: {
  imageId: string;
  parentId?: string | null;
  author: UserData | null;
}) => {
  const sendFcm = useSendFcm();
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
      fcmTokens: authStatus.data.fcmToken ? [authStatus.data.fcmToken] : [],
    };

    // 업데이트 전 상태 백업
    let prevComments: Comments | null;

    if (!parentId) {
      // 댓글 쓰기
      const docRef = doc(db, "images", imageId, "comments", commentId);

      // 댓글 상태 업데이트
      setComments((prev) => {
        prevComments = prev;
        return { ...prev, [commentId]: comment };
      });

      // db에 댓글 등록
      await setDoc(docRef, comment)
        .then(async () => {
          setContent("");
          // 댓글 등록이 완료되면 사진 게시자에게 푸시를 발송한다.
          await sendFcm({
            data: {
              title: `${authStatus.data?.displayName}님이 사진에 댓글을 남겼습니다.`,
              body: `${authStatus.data?.displayName}님: ${content}`,
              image: imageItem?.url,
              click_action: `/image/${imageId}`,
              fcmTokens: author?.fcmToken ? [author?.fcmToken] : null,
              tokenPath: author?.fcmToken ? null : `users/${imageItem?.uid}`,
              uids: author?.uid ? [author.uid] : null,
            },
          });
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
      const docRef = doc(db, "images", imageId, "comments", parentId);
      let tokens: Array<string> | undefined = undefined;
      let parentComment: Comment;
      // 댓글 상태 업데이트
      setComments((prev) => {
        prevComments = prev;
        if (!prev) return prevComments;
        parentComment = prev[parentId];
        const newTokens = Array.from(
          new Set([
            ...parentComment.fcmTokens,
            authStatus.data?.fcmToken || "",
          ]),
        );
        tokens = newTokens;

        return {
          ...prev,
          [parentId]: {
            ...parentComment,
            replies: [...parentComment.replies, comment],
            fcmTokens: newTokens,
          },
        };
      });

      // db에 답글 등록
      await updateDoc(docRef, {
        replies: arrayUnion(comment),
        fcmTokens: arrayUnion(authStatus.data.fcmToken || ""),
      })
        .then(async () => {
          setContent("");
          // 답글 작성이 완료되면 해당 댓글 및 답글 작성자들에게 푸시 전송
          await sendFcm({
            data: {
              title: `${authStatus.data?.displayName}님이 답글을 남겼습니다.`,
              body: `${authStatus.data?.displayName}님: ${content}`,
              image: imageItem?.url,
              click_action: `/image/${imageId}`,
              fcmTokens: tokens,
              tokenPath: tokens
                ? null
                : `images/${imageId}/comments/${parentId}`,
              uids: parentComment
                ? parentComment.replies.map((reply) => reply.uid)
                : null,
            },
          });
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
