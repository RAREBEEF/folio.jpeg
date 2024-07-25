import { Comment as CommentType, ImageData, UserData } from "@/types";
import CommentForm from "@/components/comment/CommentForm";
import {
  ChangeEvent,
  Fragment,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
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
import useImagePopularity from "@/hooks/useImagePopularity";
import useDeleteComment from "@/hooks/useDeleteComment";

const Comment = ({
  imageData,
  comment,
  parentId = null,
}: {
  imageData: ImageData;
  comment: CommentType;
  parentId?: string | null;
}) => {
  const { deleteComment } = useDeleteComment({ imageId: imageData.id });
  const { adjustPopularity } = useImagePopularity({ imageId: imageData.id });
  const isInitialMount = useRef(true);
  const { getUserByUid, isLoading: isAuthorLoading } = useGetUserByUid();
  const [summaryText, setSummaryText] = useState<string>(
    comment.replies.length <= 0
      ? "답글 달기"
      : `답글 ${comment.replies.length}개`,
  );
  const dateDiffNow = useDateDiffNow();
  const [displayId, setDisplayId] = useState<string>("");
  const [userData, setUserData] = useRecoilState(userDataState(displayId));
  const authStatus = useRecoilValue(authStatusState);
  const setComments = useSetRecoilState(commentsState(imageData.id));
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

    // 댓글인 경우 (답글x)
    if (!parentId) {
      await deleteComment({ imageData, comment, author });

      // 답글인 경우
    } else {
      await deleteComment({
        imageData,
        comment,
        author,
        parentId,
      });
    }
  };

  // 작성자 상태 업데이트
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } else if (author || isAuthorLoading) return;

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
      className={`relative rounded-lg p-2 ${!parentId ? "shadow-lg" : "bg-astronaut-50"}`}
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
          <div className="mt-1 text-xs text-astronaut-500">
            {dateDiffNow(comment.createdAt).diffSummary}
            {authStatus.data?.uid === comment.uid && (
              <Fragment>
                {" ・ "}
                <button
                  className="text・-astronaut-500 text-xs hover:underline"
                  onClick={onDeleteClick}
                >
                  삭제
                </button>
              </Fragment>
            )}
          </div>
        </div>
      </div>
      <div className="relative mt-2 rounded-lg bg-astronaut-100">
        {!parentId && (
          <details onToggle={onRepliesToggle} className="p-2">
            {comment.replies.length <= 0 ? (
              <Fragment>
                <summary className="pointer-events-none mr-3 flex cursor-pointer justify-end text-end text-xs text-astronaut-500">
                  <div className="pointer-events-auto select-none">
                    {summaryText}
                  </div>
                </summary>
                <div className="ml-2 text-sm text-astronaut-500">
                  아직 답글이 없습니다.
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <summary className="pointer-events-none mr-3 flex cursor-pointer justify-end text-end text-xs text-astronaut-500">
                  <div className="pointer-events-auto select-none">
                    {summaryText}
                  </div>
                </summary>
                {author && summaryText === "닫기" && (
                  <ol className="mt-2 flex flex-col gap-2">
                    {comment.replies.map((reply, j) => {
                      return (
                        <Comment
                          imageData={imageData}
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
                imageId={imageData.id}
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
