import { db } from "@/fb";
import { commentsState, lastVisibleState } from "@/recoil/states";
import { MouseEvent, useCallback, useEffect, useState } from "react";
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

const CommentList = ({ imageId }: { imageId: string }) => {
  const [comments, setComments] = useRecoilState(
    commentsState(imageId as string),
  );
  const [lastVisible, setLastVisible] = useRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState("comments-" + imageId));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<boolean>(false);

  const getComments = useCallback(async () => {
    setIsLoading(true);
    console.log("댓글 로딩");
    const commentsRef = collection(db, "images", imageId, "comments");

    const queries: Array<any> = [orderBy("createdAt", "desc"), limit(2)];

    // 쿼리 (lastVisible)
    if (lastVisible) queries.push(startAfter(lastVisible));

    const q = query(commentsRef, ...queries);
    const docSnap = await getDocs(q);

    if (docSnap.empty) {
      setLastPage(true);
      if (!comments) setComments({});
    } else {
      const newComments: Comments = { ...comments };
      docSnap.forEach((doc) => {
        newComments[doc.id] = doc.data() as CommentType;
      });
      const lv = docSnap.docs[docSnap.docs.length - 1];
      setLastVisible(() => {
        const newLv = _.cloneDeep(lv);
        return newLv;
      });
      setComments(newComments);
    }

    setIsLoading(false);
  }, [comments, imageId, lastVisible, setComments, setLastVisible]);

  // 최초 댓글
  useEffect(() => {
    if (isLoading || lastPage || comments) {
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
