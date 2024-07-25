import { commentsState } from "@/recoil/states";
import { MouseEvent, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import Comment from "./Comment";

import { ImageData } from "@/types";
import _ from "lodash";
import Loading from "@/components/loading/Loading";
import useGetComments from "@/hooks/useGetComments";

const CommentList = ({ imageData }: { imageData: ImageData }) => {
  const isInitialMount = useRef(true);
  const [comments, setComments] = useRecoilState(commentsState(imageData.id));
  const { getComments, isLoading, lastPage } = useGetComments({
    imageId: imageData.id,
  });

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
  }, [comments, getComments, imageData.id, isLoading, lastPage, setComments]);

  const onLoadClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await getComments();
  };

  return (
    <div>
      <ol className="flex flex-col gap-4">
        {!comments || Object.keys(comments).length === 0 ? (
          <div className="text-astronaut-500">아직 댓글이 없습니다.</div>
        ) : (
          Object.keys(comments).map((id, i) => {
            const comment = comments[id];
            return <Comment imageData={imageData} comment={comment} key={id} />;
          })
        )}
      </ol>
      {!lastPage &&
        (!comments || Object.keys(comments).length !== 0) &&
        (isLoading ? (
          <div className="mt-4">
            <Loading />
          </div>
        ) : (
          <div className="mt-4 w-full text-center">
            <button
              onClick={onLoadClick}
              className="m-auto text-center text-xs text-astronaut-500"
            >
              댓글 더 보기
            </button>
          </div>
        ))}
    </div>
  );
};

export default CommentList;
