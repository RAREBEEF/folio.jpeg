import { useState } from "react";
import useFetchWithRetry from "./useFetchWithRetry";
import useErrorAlert from "./useErrorAlert";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import { Comment, Comments, ImageData, UserData } from "@/types";
import useImagePopularity from "./useImagePopularity";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { alertsState, authStatusState, commentsState } from "@/recoil/states";
import { uniqueId } from "lodash";

const useDeleteComment = ({ imageId }: { imageId: string }) => {
  const setComments = useSetRecoilState(commentsState(imageId));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { adjustPopularity } = useImagePopularity({ imageId });
  const authStatus = useRecoilValue(authStatusState);
  const showErrorAlert = useErrorAlert();
  const setAlerts = useSetRecoilState(alertsState);
  const { fetchWithRetry } = useFetchWithRetry();

  const deleteCommentAsync = async ({
    imageData,
    comment,
    author,
    parentId = null,
  }: {
    imageData: ImageData;
    comment: Comment;
    author: UserData;
    parentId: string | null;
  }) => {
    console.log("useDeleteComment");
    // 이전 상태 백업
    let prevComments: Comments | null;

    if (!parentId) {
      const docRef = doc(db, "images", imageData.id, "comments", comment.id);

      setComments((prev) => {
        prevComments = prev;
        if (!prev) return prevComments;
        const newComments = { ...prevComments };
        delete newComments![comment.id];

        return newComments;
      });
      await deleteDoc(docRef)
        .then(async () => {
          if (comment.uid !== imageData.uid) await adjustPopularity(-5);
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              show: true,
              type: "success",
              createdAt: Date.now(),
              text: "삭제가 완료되었습니다.",
            },
          ]);
        })
        .catch((error) => {
          setComments(prevComments);
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              show: true,
              type: "warning",
              createdAt: Date.now(),
              text: "삭제 중 문제가 발생하였습니다.",
            },
          ]);
        });
    } else {
      const docRef = doc(db, "images", imageData.id, "comments", parentId);
      let newReplies: Array<Comment> = [];

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

      await updateDoc(docRef, { replies: newReplies })
        .then(async () => {
          if (comment.uid !== imageData.uid) await adjustPopularity(-5);
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              show: true,
              type: "success",
              createdAt: Date.now(),
              text: "삭제가 완료되었습니다.",
            },
          ]);
        })
        .catch((error) => {
          // 에러 시 이전 상태로 롤백
          setComments(prevComments);
          setAlerts((prev) => [
            ...prev,
            {
              id: uniqueId(),
              show: true,
              type: "warning",
              createdAt: Date.now(),
              text: "삭제 중 문제가 발생하였습니다.",
            },
          ]);
        });
    }
  };

  const deleteComment = async ({
    imageData,
    comment,
    author,
    parentId = null,
  }: {
    imageData: ImageData;
    comment: Comment;
    author: UserData | null;
    parentId?: string | null;
  }) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await fetchWithRetry({
        asyncFn: deleteCommentAsync,
        args: {
          imageData,
          comment,
          author,
          parentId,
        },
      });
    } catch (error) {
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, deleteComment };
};

export default useDeleteComment;
