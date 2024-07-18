import { db, storage } from "@/fb";
import { Comment, ImageDocData, ImageItem, UserData } from "@/types";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";
import { deleteObject, ref } from "firebase/storage";
import useFetchWithRetry from "./useFetchWithRetry";
import useSendFcm from "./useSendFcm";
import { useRecoilValue } from "recoil";
import { authStatusState } from "@/recoil/states";
import useImagePopularity from "./useImagePopularity";
import useTagScore from "./useTagScore";

const useSetComment = ({
  imageItem,
  author,
  parentId = null,
}: {
  imageItem: ImageItem | null;
  author: UserData | null;
  parentId: string | null;
}) => {
  const { adjustTagScore } = useTagScore({ imageItem });
  const { adjustPopularity } = useImagePopularity({
    imageId: imageItem?.id || "",
  });
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sendFcm = useSendFcm();
  const authStatus = useRecoilValue(authStatusState);

  const setCommentAsync = async ({
    comment,
    tokens = null,
    parentComment = null,
  }: {
    comment: Comment;
    tokens: Array<string> | null;
    parentComment: Comment | null;
  }): Promise<"success" | "error"> => {
    console.log("useSetComment");

    if (!imageItem) throw new Error("No image item");

    // 댓글
    if (!parentId) {
      const docRef = doc(db, "images", imageItem.id, "comments", comment.id);
      await setDoc(docRef, comment).then(async () => {
        // 댓글 등록이 완료되면 사진 게시자에게 푸시를 발송한다.
        await Promise.all([
          adjustTagScore({ action: "comment" }),
          sendFcm({
            data: {
              title: `${authStatus.data?.displayName}님이 사진에 댓글을 남겼습니다.`,
              body: `${authStatus.data?.displayName}님: ${comment.content}`,
              profileImage: authStatus.data?.photoURL,
              targetImage: imageItem?.URL,
              click_action: `/image/${imageItem.id}`,
              fcmTokens: author?.fcmToken ? [author?.fcmToken] : null,
              tokenPath: author?.fcmToken ? null : `users/${imageItem?.uid}`,
              uids: author?.uid ? [author.uid] : null,
            },
          }),
        ]);
      });
      // 답글
    } else {
      const docRef = doc(db, "images", imageItem.id, "comments", parentId);
      await updateDoc(docRef, {
        replies: arrayUnion(comment),
        fcmTokens: arrayUnion(authStatus.data!.fcmToken || ""),
      }).then(async () => {
        await sendFcm({
          data: {
            title: `${authStatus.data?.displayName}님이 답글을 남겼습니다.`,
            body: `${authStatus.data?.displayName}님: ${comment.content}`,
            profileImage: authStatus.data?.photoURL,
            targetImage: imageItem?.URL,
            click_action: `/image/${imageItem.id}`,
            fcmTokens: tokens,
            tokenPath: tokens
              ? null
              : `images/${imageItem.id}/comments/${parentId}`,
            uids: parentComment
              ? parentComment.replies.map((reply) => reply.uid)
              : null,
          },
        });
      });
    }

    return "success";
  };

  const setComment = async ({
    comment,
    tokens = null,
    parentComment = null,
  }: {
    comment: Comment;
    tokens?: Array<string> | null;
    parentComment?: Comment | null;
  }): Promise<"success" | "error"> => {
    if (isLoading || !imageItem) return "error";

    setIsLoading(true);

    try {
      await fetchWithRetry({
        asyncFn: setCommentAsync,
        args: {
          comment,
          tokens,
          parentComment,
        },
      });
      return "success";
    } catch (error) {
      showErrorAlert();
      return "error";
    } finally {
      if (authStatus.data && imageItem.uid !== authStatus.data.uid) {
        await adjustPopularity(5);
      }
      setIsLoading(false);
    }
  };

  return { setComment, isLoading };
};

export default useSetComment;
