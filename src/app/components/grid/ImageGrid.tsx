"use client";

import { useEffect, useRef, useState } from "react";
import * as _ from "lodash";
import { useRecoilState, useRecoilValue } from "recoil";
import { Column, ImageItem } from "@/types";
import ImageGridCols from "./ImageGridCols";
import { gridState, imageDataPagesState } from "@/recoil/states";

const ImageGrid = () => {
  const [grid, setGrid] = useRecoilState(gridState);
  const imageDataPages = useRecoilValue(imageDataPagesState);
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

    // column에 이미지를 추가
    for (let i = 0; i < imageDataPages.length; i++) {
      const currentPage = imageDataPages[i];

      for (let j = 0; j < currentPage.length; j++) {
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
        const image = currentPage[j];
        // column에 추가할 아이템 (이미지, 위치와 높이 등)
        const curItem: ImageItem = {
          ...image,
          page: i,
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
    }
    // grid 업데이트
    setGrid({
      ...gridConfig,
      cols,
      height: Math.max(...cols.map((col) => col.height)),
    });
  }, [innerWidth, setGrid, imageDataPages]);

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
    <div className="transition-all" ref={containerRef}>
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
          minHeight: grid.height,
        }}
      >
        <ImageGridCols />
      </div>
    </div>
  );
};

export default ImageGrid;
