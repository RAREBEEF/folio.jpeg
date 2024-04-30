"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as _ from "lodash";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ImageData, ImageDocData } from "@/types";
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
import { db } from "@/fb";
import ImageGrid from "./grid/ImageGrid";
import {
  gridImageIdsState,
  imageDataPagesState,
  lastVisibleState,
} from "@/recoil/states";
import useGetImages from "@/hooks/useGetImages";

const HomeGrid = () => {
  const loadRef = useRef<HTMLButtonElement>(null);
  const { getImages, isLoading, lastPage } = useGetImages();
  const [lastVisible, setLastVisible] = useRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState);
  const [initLoad, setInitLoad] = useState<boolean>(!!lastVisible);
  // const setImageDataPages = useSetRecoilState(imageDataPagesState);
  // const [gridImageIds, setGridimageIds] = useRecoilState(gridImageIdsState);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [lastPage, setLastPage] = useState<boolean>(false);

  // 로딩에 고의적으로 딜레이 발생시키기
  // const delay = () => {
  //   return new Promise((res) => {
  //     setTimeout(() => {
  //       res(true);
  //     }, 500);
  //   });
  // };

  // const getImgs = useCallback(async () => {
  //   if (lastPage || loading) return;
  //   setLoading(true);

  //   const queries: Array<any> = [orderBy("createdAt", "desc"), limit(2)];

  //   if (!!lastVisible) {
  //     queries.push(startAfter(lastVisible));
  //   }

  //   const q = query(collection(db, "images"), ...queries);
  //   const documentSnapshots = await getDocs(q);

  //   // 딜레이 적용
  //   await Promise.all([delay(), documentSnapshots]);

  //   if (documentSnapshots.empty) {
  //     setLastPage(true);
  //   }

  //   const imgs: Array<ImageData> = [];

  //   documentSnapshots.forEach((doc) => {
  //     const id = doc.id;
  //     if (!gridImageIds.includes(id)) {
  //       setGridimageIds((prev) => [...prev, id]);
  //       imgs.push({ ...(doc.data() as ImageDocData), id: doc.id });
  //     }
  //   });
  //   const lv = documentSnapshots.docs[documentSnapshots.docs.length - 1];

  //   setLastVisible(() => {
  //     const newLv = _.cloneDeep(lv);
  //     return newLv;
  //   });
  //   setImageDataPages((prev) => [...prev, imgs]);
  //   setLoading(false);
  // }, [
  //   gridImageIds,
  //   lastPage,
  //   lastVisible,
  //   loading,
  //   setGridimageIds,
  //   setImageDataPages,
  //   setLastVisible,
  // ]);

  // 최초 로드 및 로드 감지 옵저버
  useEffect(() => {
    if (initLoad) return;
    (async () => {
      await getImages({ orderBy: ["createdAt", "desc"] });
    })();
    setInitLoad(true);
  }, [getImages, initLoad]);

  useEffect(() => {
    const loadBtn = loadRef.current;
    if (!initLoad || !loadBtn) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          await getImages({ orderBy: ["createdAt", "desc"] });
        }
      });
    });
    observer.observe(loadBtn);

    return () => {
      observer.unobserve(loadBtn);
    };
  }, [getImages, initLoad, isLoading]);

  return (
    <div className="h-full border bg-shark-50">
      <ImageGrid />
      {!lastPage &&
        (isLoading ? (
          <div>로딩중</div>
        ) : (
          <button
            ref={loadRef}
            className="mt-[100vh]"
            onClick={async () => {
              await getImages({ orderBy: ["createdAt", "desc"] });
            }}
          >
            qnffjdhrl
          </button>
        ))}
    </div>
  );
};

export default HomeGrid;
