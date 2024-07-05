import { Comment as CommentType, Comments, UserData } from "@/types";
import CommentForm from "@/components/comment/CommentForm";
import { ChangeEvent, Fragment, MouseEvent, useEffect, useState } from "react";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import {
  alertState,
  authStatusState,
  commentsState,
  userDataState,
  usersDataState,
} from "@/recoil/states";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import ProfileImage from "@/components/user/ProfileImage";
import Link from "next/link";
import useDateDiffNow from "@/hooks/useDateDiffNow";
import useGetUserByUid from "@/hooks/useGetUserByUid";

const Comment = ({
  imageId,
  comment,
  parentId = null,
}: {
  imageId: string;
  comment: CommentType;
  parentId?: string | null;
}) => {
  const { getUserByUid, isLoading: isAuthorLoading } = useGetUserByUid();
  const [alert, setAlert] = useRecoilState(alertState);
  const [summaryText, setSummaryText] = useState<string>(
    comment.replies.length <= 0
      ? "답글 달기"
      : `답글 ${comment.replies.length}개`,
  );
  const dateDiffNow = useDateDiffNow();
  const [displayId, setDisplayId] = useState<string>("");
  const [userData, setUserData] = useRecoilState(userDataState(displayId));
  const authStatus = useRecoilValue(authStatusState);
  const setComments = useSetRecoilState(commentsState(imageId as string));
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [author, setAuthor] = useState<UserData | null>(null);

  // 댓글 삭제
  const onDeleteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (authStatus.data?.uid !== comment.uid) return;

    const ok = window.confirm("댓글을 삭제하시겠습니까?");

    if (!ok) {
      return;
    }

    // 이전 상태 백업
    let prevComments: Comments | null;

    // 댓글인 경우 (답글x)
    if (!parentId) {
      const docRef = doc(db, "images", imageId, "comments", comment.id);

      setComments((prev) => {
        prevComments = prev;
        if (!prev) return prevComments;
        const newComments = { ...prevComments };
        delete newComments![comment.id];

        return newComments;
      });

      await deleteDoc(docRef)
        .then(() => {
          setAlert({
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "삭제가 완료되었습니다.",
          });
        })
        .catch((error) => {
          // 에러 시 이전 상태로 롤백
          setComments(prevComments);
          setAlert({
            show: true,
            type: "warning",
            createdAt: Date.now(),
            text: "삭제 중 문제가 발생하였습니다.",
          });
        });
      // 답글인 경우
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

      await updateDoc(docRef, { replies: newReplies })
        .then(() => {
          setAlert({
            show: true,
            type: "success",
            createdAt: Date.now(),
            text: "삭제가 완료되었습니다.",
          });
        })
        .catch((error) => {
          // 에러 시 이전 상태로 롤백
          setComments(prevComments);
          setAlert({
            show: true,
            type: "warning",
            createdAt: Date.now(),
            text: "삭제 중 문제가 발생하였습니다.",
          });
        });
    }
  };

  // 작성자 상태 업데이트
  useEffect(() => {
    if (author || isAuthorLoading) return;

    if (usersData[comment.uid]) {
      const data = usersData[comment.uid];
      setDisplayId(data.displayId || "");
      setAuthor(data);
    } else {
      const uid = comment.uid;

      (async () => {
        const data = await getUserByUid({ uid });
        setDisplayId(data?.displayId || "");
        setAuthor(data);
      })();
    }
  }, [author, comment.uid, getUserByUid, isAuthorLoading, usersData]);

  // user data 전역 상태 업데이트
  useEffect(() => {
    if (displayId && author) {
      setUserData(author);
    }
  }, [author, displayId, setUserData]);

  const onRepliesToggle = (e: ChangeEvent<HTMLDetailsElement>) => {
    if (e.target.open) {
      setSummaryText("닫기");
    } else {
      setSummaryText(
        comment.replies.length <= 0
          ? "답글 달기"
          : `답글 ${comment.replies.length}개`,
      );
    }
  };

  return (
    <li
      className={`relative rounded-lg p-2 ${!parentId ? "shadow-lg" : "bg-shark-50"}`}
    >
      <div className="flex items-start gap-2">
        <Link
          onClick={(e) => {
            if (!author) e.preventDefault();
          }}
          href={`/${author?.displayId}`}
          className="w-8 shrink-0"
        >
          <ProfileImage URL={author?.photoURL || null} />
        </Link>
        <div className="pt-1 md:text-sm">
          <Link
            onClick={(e) => {
              if (!author) e.preventDefault();
            }}
            href={`/${author?.displayId}`}
            className="mr-2 font-semibold"
          >
            {author?.displayName}
          </Link>
          <span>{comment.content}</span>
          <div className="mt-1 text-xs text-shark-500">
            {dateDiffNow(comment.createdAt).diffSummary}
            {authStatus.data?.uid === comment.uid && (
              <Fragment>
                {" ・ "}
                <button
                  className="text・-shark-500 text-xs hover:underline"
                  onClick={onDeleteClick}
                >
                  삭제
                </button>
              </Fragment>
            )}
          </div>
        </div>
      </div>
      <div className="relative mt-2 rounded-lg bg-shark-100">
        {!parentId && (
          <details onToggle={onRepliesToggle} className="p-2">
            {comment.replies.length <= 0 ? (
              <Fragment>
                <summary className="pointer-events-none mr-3 flex cursor-pointer justify-end text-end text-xs text-shark-500">
                  <div className="pointer-events-auto select-none">
                    {summaryText}
                  </div>
                </summary>
                <div className="ml-2 text-sm text-shark-500">
                  아직 답글이 없습니다.
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <summary className="pointer-events-none mr-3 flex cursor-pointer justify-end text-end text-xs text-shark-500">
                  <div className="pointer-events-auto select-none">
                    {summaryText}
                  </div>
                </summary>
                {author && summaryText === "닫기" && (
                  <ol className="mt-2 flex flex-col gap-2">
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
                )}
              </Fragment>
            )}

            <div className="mt-4">
              <CommentForm
                author={author}
                imageId={imageId}
                parentId={comment.id}
              />
            </div>
          </details>
        )}
      </div>
    </li>
  );
};

export default Comment;
