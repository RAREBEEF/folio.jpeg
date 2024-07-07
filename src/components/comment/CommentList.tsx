import { db } from "@/fb";
import { commentsState, lastVisibleState } from "@/recoil/states";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { Comment as CommentType, Comments } from "@/types";
import _ from "lodash";
import Loading from "@/components/loading/Loading";
import useGetComments from "@/hooks/useGetComments";

const CommentList = ({ imageId }: { imageId: string }) => {
  const isInitialMount = useRef(true);
  const [comments, setComments] = useRecoilState(
    commentsState(imageId as string),
  );
  const { getComments, isLoading, lastPage } = useGetComments({ imageId });

  // 최초 댓글
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } else if (isLoading || comments || lastPage) {
      return;
    } else {
      (async () => {
        await getComments();
      })();
    }
  }, [comments, getComments, imageId, isLoading, lastPage, setComments]);

  const onLoadClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await getComments();
  };

  return (
    <div>
      <ol className="flex flex-col gap-4">
        {!comments || Object.keys(comments).length === 0 ? (
          <div className="text-shark-500">아직 댓글이 없습니다.</div>
        ) : (
          Object.keys(comments).map((id, i) => {
            const comment = comments[id];
            return <Comment imageId={imageId} comment={comment} key={i} />;
          })
        )}
      </ol>
      {!lastPage &&
        (isLoading ? (
          <div className="mt-4">
            <Loading />
          </div>
        ) : (
          <div className="mt-4 w-full text-center">
            <button
              onClick={onLoadClick}
              className="m-auto text-center text-xs text-shark-500"
            >
              댓글 더 보기
            </button>
          </div>
        ))}
    </div>
  );
};

export default CommentList;
