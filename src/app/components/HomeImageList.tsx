"use client";

import { useCallback, useEffect, useState } from "react";
import * as _ from "lodash";
import { useSetRecoilState } from "recoil";
import { ImageData, ImageDocData } from "@/types";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "@/fb";
import ImageGrid from "./grid/ImageGrid";
import { imageDataPagesState } from "@/recoil/states";

const HomeGrid = () => {
  const setImageDataPages = useSetRecoilState(imageDataPagesState);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null);
  const [lastPage, setLastPage] = useState<boolean>(false);

  const getImgs = useCallback(async () => {
    if (lastPage) return;

    const queries: Array<any> = [orderBy("createdAt", "desc"), limit(2)];
    if (!!lastVisible) {
      queries.push(startAfter(lastVisible));
    }

    const q = query(collectionGroup(db, "images"), ...queries);
    const documentSnapshots = await getDocs(q);

    if (documentSnapshots.empty) {
      setLastPage(true);
    }

    const imgs: Array<ImageData> = [];

    documentSnapshots.forEach((doc) => {
      imgs.push({ ...(doc.data() as ImageDocData), id: doc.id });
    });

    setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
    setImageDataPages((prev) => [...prev, imgs]);
  }, [lastPage, lastVisible, setImageDataPages]);

  return (
    <div className="h-full border bg-shark-50">
      <ImageGrid />
      <button
        onClick={async () => {
          await getImgs();
        }}
      >
        qnffjdhrl
      </button>
    </div>
  );
};

export default HomeGrid;
