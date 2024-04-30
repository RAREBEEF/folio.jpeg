import { db } from "@/fb";
import {
  gridImageIdsState,
  imageDataPagesState,
  lastVisibleState,
} from "@/recoil/states";
import { ImageDocData, ImageData } from "@/types";
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
import { useRecoilState, useSetRecoilState } from "recoil";
import _ from "lodash";

const useGetImages = () => {
  const setImageDataPages = useSetRecoilState(imageDataPagesState);
  const [gridImageIds, setGridimageIds] = useRecoilState(gridImageIdsState);
  const [lastVisible, setLastVisible] = useRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<boolean>(false);

  // 로딩에 고의적으로 딜레이 발생시키기
  const delay = () => {
    return new Promise((res) => {
      setTimeout(() => {
        res(true);
      }, 500);
    });
  };

  console.log(lastVisible);

  const getImages = async (filter: {
    orderBy: ["createdAt" | "popular", "desc" | "asc"];
    where?: [string, string, string];
  }) => {
    if (lastPage || isLoading) return;
    setIsLoading(true);

    const queries: Array<any> = [
      orderBy(filter.orderBy[0], filter.orderBy[1]),
      limit(2),
    ];

    if (!!lastVisible) {
      queries.push(startAfter(lastVisible));
    }

    const q = query(collection(db, "images"), ...queries);
    const documentSnapshots = await getDocs(q);

    // 딜레이 적용
    await Promise.all([delay(), documentSnapshots]);

    if (documentSnapshots.empty) {
      setLastPage(true);
    } else {
      const imgs: Array<ImageData> = [];

      documentSnapshots.forEach((doc) => {
        const id = doc.id;
        if (!gridImageIds.includes(id)) {
          setGridimageIds((prev) => [...prev, id]);
          imgs.push({ ...(doc.data() as ImageDocData), id: doc.id });
        }
      });

      const lv = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(() => {
        const newLv = _.cloneDeep(lv);
        return newLv;
      });

      setImageDataPages((prev) => [...prev, imgs]);
    }

    setIsLoading(false);
  };

  return { getImages, lastPage, isLoading };
};

export default useGetImages;
