import { db } from "@/fb";
import {
  gridImageIdsState,
  imageDataPagesState,
  lastVisibleState,
} from "@/recoil/states";
import { ImageData } from "@/types";
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
import useSettleImageDataState from "@/hooks/useSettleImageDataState";
import useFetchWithRetry from "./useFetchWithRetry";
import useTypeGuards from "./useTypeGuards";

const useGetImages = ({ gridType }: { gridType: string }) => {
  const { isImageDocData } = useTypeGuards();
  const { fetchWithRetry } = useFetchWithRetry();
  const { settleImageDataState } = useSettleImageDataState();
  const showErrorAlert = useErrorAlert();
  const setImageDataPages = useSetRecoilState(imageDataPagesState(gridType));
  const [gridImageIds, setGridImageIds] = useRecoilState(
    gridImageIdsState(gridType),
  );
  const [lastVisible, setLastVisible] = useRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState(gridType));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // 다른 타입이 들어오면 lastPage를 초기화한다.
  useEffect(() => {
    if (lastVisible === null) {
      setLastPage(false);
    }
  }, [gridType, lastVisible]);

  // 로딩에 딜레이 발생시키기
  const delay = (ms: number) => {
    return new Promise((res) => {
      setTimeout(() => {
        res(true);
      }, ms);
    });
  };

  const getImagesAsync = async ({
    filter,
    delayMs = 300,
  }: {
    filter?: Filter;
    delayMs?: number;
  }) => {
    console.log("useGetImages");
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
    // await Promise.all([delay(delayMs), documentSnapshots]);

    // 불러온 문서가 없으면 마지막 페이지임
    if (documentSnapshots.empty) {
      setLastPage(true);
    } else {
      // 불러온 문서(이미지)가 존재하면
      const imgs: Array<ImageData> = [];

      // id 목록에서 이미지 중복 체크 후 목록 업데이트
      documentSnapshots.forEach((doc) => {
        const id = doc.id;
        const docData = doc.data();

        if (isImageDocData(docData)) {
          const data = { ...docData, id: doc.id };
          settleImageDataState({ image: data });
          if (!gridImageIds.includes(id)) {
            setGridImageIds((prev) => [...prev, id]);
            imgs.push(data);
          }
        }
      });

      // lastVisible 업데이트
      const lv = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(() => {
        const newLv = _.cloneDeep(lv);
        return newLv;
      });

      // 이미지 데이터 페이지 업데이트
      setImageDataPages((prev) => {
        const newImageDataPages = Array.from(new Set([...prev, imgs]));
        return newImageDataPages;
      });
    }
    setIsError(false);
  };

  const getImages = async ({
    filter,
    delayMs = 300,
  }: {
    filter?: Filter;
    delayMs?: number;
  }) => {
    if (isLoading || isError || lastPage) return;

    try {
      setIsLoading(true);
      await fetchWithRetry({
        asyncFn: getImagesAsync,
        args: { filter, delayMs },
      });
    } catch (error) {
      console.log(error);
      showErrorAlert();
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { getImages, lastPage, isLoading, isError };
};

export default useGetImages;
