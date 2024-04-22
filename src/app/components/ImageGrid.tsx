"use client";

import img1 from "@/images/sample1.jpeg";
import img2 from "@/images/sample2.png";
import img3 from "@/images/sample3.jpeg";
import img4 from "@/images/sample4.png";
import img5 from "@/images/sample5.png";
import img6 from "@/images/sample6.jpeg";
import img7 from "@/images/sample7.png";
import img8 from "@/images/sample8.jpeg";
import img9 from "@/images/sample9.png";
import img10 from "@/images/sample10.jpeg";
import { Suspense, useEffect, useRef, useState } from "react";
import * as _ from "lodash";
import { atom, useRecoilState } from "recoil";
import {
  Column,
  Grid,
  ImageDataList,
  ColumnItem,
  ImageData,
  ImageDocData,
} from "../../../type";
import ImageGridCols from "./ImageGridCols";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../fb";

const imgs = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

export const imageDataListState = atom({
  key: "photos",
  default: [] as ImageDataList,
});

export const imageIdsState = atom({
  key: "imageIdsState",
  default: [] as Array<string>,
});

export const gridState = atom<Grid>({
  key: "gridState",
  default: {
    cols: [],
    gap: 15,
    colCount: 3,
    colWidth: 200,
    height: 0,
  },
});

const ImageGrid = () => {
  const [imageDataList, setImageDataList] = useRecoilState(imageDataListState);
  const containerRef = useRef<HTMLDivElement>(null);
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const [grid, setGrid] = useRecoilState(gridState);

  // 이미지 데이터 로드
  // TODO:쿼리 페이지 구현하기
  useEffect(() => {
    const getImgs = async () => {
      const querySnapshot = await getDocs(collection(db, "photos"));
      const imgs: Array<ImageData> = [];

      querySnapshot.forEach((doc) => {
        imgs.push({ ...(doc.data() as ImageDocData), id: doc.id });
      });

      setImageDataList(imgs);
    };
    getImgs();
  }, [setImageDataList]);

  // 뷰포트 너비가 바뀌면 그리드도 업데이트
  useEffect(() => {
    if (innerWidth === 0) return;

    // 뷰포트 너비에 맞춰서 그리드 설정
    const gridConfig = { gap: 15, colCount: 3, colWidth: 200, height: 0 };
    gridConfig.colCount = Math.floor(
      innerWidth / (gridConfig.colWidth + gridConfig.gap * 2),
    );

    if (gridConfig.colCount <= 2) {
      if (innerWidth <= 450) {
        gridConfig.colCount = 1;
        gridConfig.colWidth = innerWidth - gridConfig.gap * 2;
      } else {
        gridConfig.colCount = 2;
        gridConfig.colWidth = innerWidth / 2 - gridConfig.gap * 3;
      }
    }

    // columns
    const cols: Array<Column> = Array.from(
      { length: gridConfig.colCount },
      () => ({ items: [], height: 0 }),
    );

    // 각 column에 이미지를 추가
    for (let i = 0; i < imageDataList.length; i++) {
      // 가장 길이가 짧은 column 찾기
      const colIndex = cols.reduce((acc, cur, i) => {
        if (cur.height < cols[acc].height) {
          return i;
        } else {
          return acc;
        }
      }, 0);
      // 아이템을 추가할 column (가장 길이가 짧은 column)
      const currentCol = cols[colIndex] || { list: [], height: 0 };

      // 추가할 이미지
      const image = imageDataList[i];
      // column에 추가할 아이템 (이미지, 위치와 높이 등)
      const curItem: ColumnItem = {
        id: image.id,
        name: image.name,
        height: (gridConfig.colWidth * image.size.height) / image.size.width,
        x: colIndex * gridConfig.colWidth + gridConfig.gap * (1 + colIndex),
        y: currentCol.height + gridConfig.gap,
      };
      // column에 아이템 추가
      currentCol.items.push(curItem);

      // column의 높이 업데이트
      currentCol.height += curItem.height + gridConfig.gap;

      // cols 업데이트
      cols[colIndex] = currentCol;
    }

    // grid 업데이트
    setGrid({
      ...gridConfig,
      cols,
      height: Math.max(...cols.map((col) => col.height)),
    });
  }, [innerWidth, setGrid, imageDataList]);

  // 컨테이너 리사이즈 옵저버
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(
      _.debounce((entries) => {
        for (const entry of entries) {
          const contentBoxSize = entry.contentBoxSize[0];
          setInnerWidth(contentBoxSize.inlineSize);
        }
      }, 100),
    );

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  return (
    <div
      className="min-h-[200vh] bg-shark-50 py-12 transition-all"
      ref={containerRef}
    >
      <div
        className="transition-all"
        style={{
          paddingLeft:
            (innerWidth -
              (grid.colCount * grid.colWidth +
                (grid.colCount + 1) * grid.gap)) /
            2,
          paddingRight:
            (innerWidth -
              (grid.colCount * grid.colWidth +
                (grid.colCount + 1) * grid.gap)) /
            2,
          height: grid.height,
        }}
      >
        <ImageGridCols />
      </div>
    </div>
  );
};

export default ImageGrid;
