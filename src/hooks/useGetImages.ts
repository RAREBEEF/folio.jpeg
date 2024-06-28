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
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import _ from "lodash";
import { Filter } from "@/types";
import useErrorAlert from "./useErrorAlert";

const useGetImages = (type: string) => {
  const showErrorAlert = useErrorAlert();
  const setImageDataPages = useSetRecoilState(imageDataPagesState(type));
  const [gridImageIds, setGridImageIds] = useRecoilState(
    gridImageIdsState(type),
  );
  const [lastVisible, setLastVisible] = useRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState(type));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<boolean>(false);

  // 다른 타입이 들어오면 lastPage를 초기화한다.
  useEffect(() => {
    setLastPage(false);
  }, [type]);

  // 로딩에 딜레이 발생시키기
  const delay = (ms: number) => {
    return new Promise((res) => {
      setTimeout(() => {
        res(true);
      }, ms);
    });
  };

  const getImages = async ({
    filter,
    delayMs = 300,
  }: {
    filter?: Filter;
    delayMs?: number;
  }) => {
    if (lastPage || isLoading) return;
    setIsLoading(true);

    try {
      const queries: Array<any> = [];

      // 필터 파라미터가 존재할 경우
      if (filter) {
        // 쿼리 (orderBy)
        if (filter.orderBy)
          queries.push(orderBy(filter.orderBy[0], filter.orderBy[1]));
        // 쿼리 (where)
        if (filter.where) queries.push(filter.where);
        // 쿼리 (limit)
        if (filter.limit) queries.push(limit(filter.limit));
      }

      // 쿼리 (lastVisible)
      if (lastVisible) queries.push(startAfter(lastVisible));

      const q = query(collection(db, "images"), ...queries);
      const documentSnapshots = await getDocs(q);

      // 딜레이를 적용해 이미지 데이터 불러오기
      await Promise.all([delay(delayMs), documentSnapshots]);

      // 불러온 문서가 없으면 마지막 페이지임
      if (documentSnapshots.empty) {
        setLastPage(true);
      } else {
        // 불러온 문서(이미지)가 존재하면
        const imgs: Array<ImageData> = [];

        // id 목록에서 이미지 중복 체크 후 목록 업데이트
        documentSnapshots.forEach((doc) => {
          const id = doc.id;
          if (!gridImageIds.includes(id)) {
            setGridImageIds((prev) => [...prev, id]);
            imgs.push({ ...(doc.data() as ImageDocData), id: doc.id });
          }
        });

        // lastVisible 업데이트
        const lv = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastVisible(() => {
          const newLv = _.cloneDeep(lv);
          return newLv;
        });

        // 이미지 데이터 페이지 업데이트
        setImageDataPages((prev) => [...prev, imgs]);
      }
    } catch (error) {
      showErrorAlert();
    } finally {
      setIsLoading(false);
    }
  };

  return { getImages, lastPage, isLoading };
};

export default useGetImages;
