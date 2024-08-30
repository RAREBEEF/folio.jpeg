import { db } from "@/fb";
import { Comment, ImageData, UserData } from "@/types";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";
import useSendFcm from "./useSendFcm";
import { useRecoilValue } from "recoil";
import { authStatusState } from "@/recoil/states";
import useImagePopularity from "./useImagePopularity";

const usePostComment = ({
  imageData,
  author,
  parentId = null,
}: {
  imageData: ImageData | null;
  author: UserData | null;
  parentId: string | null;
}) => {
  const { adjustPopularity } = useImagePopularity({
    imageId: imageData?.id || "",
  });
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sendFcm = useSendFcm();
  const authStatus = useRecoilValue(authStatusState);

  const postCommentAsync = async ({
    comment,
    parentComment = null,
  }: {
    comment: Comment;
    parentComment: Comment | null;
  }): Promise<"success" | "error"> => {
    console.log("useSetComment");

    if (!imageData) throw new Error("No image item");

    if (authStatus.status !== "signedIn") throw new Error("auth error");

    // 댓글
    if (!parentId) {
      const docRef = doc(db, "images", imageData.id, "comments", comment.id);
      await setDoc(docRef, comment);
      // 댓글 등록이 완료되면 사진 게시자에게 푸시를 발송한다.
      await Promise.all([
        sendFcm({
          data: {
            title: `${authStatus.data.displayName}님이 사진에 댓글을 남겼습니다.`,
            body: `${authStatus.data.displayName}님: ${comment.content}`,
            profileImage: authStatus.data.photoURL,
            targetImage: imageData.URL,
            click_action: `/image/${imageData.id}`,
            uids: author?.uid ? [author?.uid] : null,
            sender: {
              uid: authStatus.data.uid,
              displayName: authStatus.data.displayName,
              displayId: authStatus.data.displayId || null,
            },
            type: "comment",
            subject: comment.id,
          },
        }),
      ]);
      // 답글
    } else {
      const docRef = doc(db, "images", imageData.id, "comments", parentId);
      await updateDoc(docRef, {
        replies: arrayUnion(comment),
      });
      await sendFcm({
        data: {
          title: `${authStatus.data.displayName}님이 답글을 남겼습니다.`,
          body: `${authStatus.data.displayName}님: ${comment.content}`,
          profileImage: authStatus.data.photoURL,
          targetImage: imageData.URL,
          click_action: `/image/${imageData.id}`,
          uids: parentComment
            ? parentComment.replies.map((reply) => reply.uid)
            : null,
          sender: {
            uid: authStatus.data.uid,
            displayName: authStatus.data.displayName,
            displayId: authStatus.data.displayId || null,
          },
          type: "reply",
          subject: parentComment?.id,
        },
      });
    }

    return "success";
  };

  const postComment = async ({
    comment,
    parentComment = null,
  }: {
    comment: Comment;
    parentComment?: Comment | null;
  }): Promise<"success" | "error"> => {
    if (isLoading || !imageData) return "error";

    setIsLoading(true);

    try {
      await fetchWithRetry({
        asyncFn: postCommentAsync,
        args: {
          comment,
          parentComment,
        },
      });
      return "success";
    } catch (error) {
      showErrorAlert();
      return "error";
    } finally {
      if (authStatus.data && imageData.uid !== authStatus.data.uid) {
        await adjustPopularity(5);
      }
      setIsLoading(false);
    }
  };

  return { postComment, isLoading };
};

export default usePostComment;
