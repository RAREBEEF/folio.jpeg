import { db } from "@/fb";
import { commentsState, lastVisibleState } from "@/recoil/states";
import { Comment, Comments } from "@/types";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { useState } from "react";
import { useRecoilState } from "recoil";
import useErrorAlert from "./useErrorAlert";
import useFetchWithRetry from "./useFetchWithRetry";
import _ from "lodash";

const useGetComments = ({ imageId }: { imageId: string }) => {
  const { fetchWithRetry } = useFetchWithRetry();
  const showErrorAlert = useErrorAlert();
  const [comments, setComments] = useRecoilState(
    commentsState(imageId as string),
  );
  const [lastVisible, setLastVisible] = useRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState("comments-" + imageId));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<boolean>(false);

  const getCommentsAsync = async () => {
    console.log("useGetComments");
    const commentsRef = collection(db, "images", imageId, "comments");

    const queries: Array<any> = [orderBy("createdAt", "asc"), limit(2)];

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
        newComments[doc.id] = doc.data() as Comment;
      });
      const lv = docSnap.docs[docSnap.docs.length - 1];
      setLastVisible(() => {
        const newLv = _.cloneDeep(lv);
        return newLv;
      });
      setComments(newComments);
    }
  };

  const getComments = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await fetchWithRetry({ asyncFn: getCommentsAsync });
    } catch (error) {
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  return { getComments, isLoading, lastPage };
};

export default useGetComments;
