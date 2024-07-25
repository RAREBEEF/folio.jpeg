"use client";

import { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { useRecoilState, useRecoilValue } from "recoil";
import { Column, GridItem } from "@/types";
import ImageGridCols from "./ImageGridCols";
import { gridState, imageDataPagesState } from "@/recoil/states";
import { usePathname } from "next/navigation";

const ImageGrid = ({ type }: { type: string }) => {
  const pathname = usePathname();
  const [gridInit, setGridInit] = useState<boolean>(false);
  const [grid, setGrid] = useRecoilState(gridState);
  const imageDataPages = useRecoilValue(imageDataPagesState(type));
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 컨테이너 너비가 바뀌면 그리드도 업데이트
  useEffect(() => {
    if (containerWidth === 0) return;

    setGrid((prev) => {
      let newGrid = _.cloneDeep(prev);

      // 그리드 초기화
      // 이전 상태가 없거나 컨테이너의 너비가 변경되어 colCount에 변동이 있을 경우
      const initRequire =
        !newGrid ||
        Math.floor(containerWidth / (newGrid.colWidth + newGrid.gap * 2)) !==
          newGrid.colCount;

      if (initRequire) {
        let initGrid = {
          gap: 15,
          colCount: 3,
          colWidth: 250,
          height: 0,
          page: 0,
        };

        // 컨테이너 너비에 맞춰서 그리드 설정
        initGrid.colCount = Math.max(
          Math.min(
            Math.floor(containerWidth / (initGrid.colWidth + initGrid.gap * 2)),
            5,
          ),
          2,
        );
        if (initGrid.colCount <= 2) {
          // if (containerWidth <= 450) {
          //   initGrid.colCount = 1;
          //   initGrid.colWidth = containerWidth - initGrid.gap * 2;
          // } else {
          initGrid.colCount = 2;
          initGrid.colWidth = containerWidth / 2 - initGrid.gap * 2;
          // }
        }
        const cols: Array<Column> = Array.from(
          { length: initGrid.colCount },
          () => ({
            items: [],
            height: 0,
          }),
        );
        newGrid = { ...initGrid, cols };
      }

      if (!newGrid) return newGrid;

      // 이미지 페이지 목록에서 이미지를 꺼내 column에 추가
      // 이전 페이지들은 그대로 유지하고 새롭게 추가된 페이지부터 시작 (prevGrid.page)
      for (let i = newGrid.page || 0; i < imageDataPages.length; i++) {
        // 현재 처리할 페이지
        const currentPage = imageDataPages[i];

        // 현재 페이지에 존재하는 이미지 꺼내기
        for (let j = 0; j < currentPage.length; j++) {
          // 추가할 이미지
          const image = currentPage[j];

          // 가장 길이가 짧은 column 찾기
          const colIndex = newGrid.cols.reduce((acc, cur, i) => {
            if (cur.height < newGrid.cols[acc].height) {
              return i;
            } else {
              return acc;
            }
          }, 0);
          const currentCol = newGrid.cols[colIndex];

          // column에 추가할 아이템 (이미지 데이터에 그리드 데이터 추가)
          const curItem: GridItem = {
            id: image.id,
            page: i, // 불러온 이미지의 수가 많을 때 페이지 목록에서 이미지를 찾기 쉽도록 페이지 인덱스를 아이템에 저장, 현재는 이미지 삭제 시 목록 상태 업데이트에서만 활용되지만 나중에 기능이 추가된다면 더 필요할지도
            height: (newGrid.colWidth * image.size.height) / image.size.width, // 원본 비율을 유지하며 colWidth에 맞게 height 조절
            x: colIndex * newGrid.colWidth + newGrid.gap * (1 + colIndex), // 그리드에서 이미지가 위치할 x 좌표
            y: currentCol.height + newGrid.gap, // 그리드에서 이미지가 위치할 y 좌표
          };
          // column에 아이템 추가
          currentCol.items.push(curItem);

          // 추가한 이미지의 높이만큼 column의 높이 업데이트
          currentCol.height += curItem.height + newGrid.gap;

          // cols 업데이트
          newGrid.cols[colIndex] = currentCol;
        }
        // 다음 번에 시작할 페이지
        newGrid.page = i + 1;
      }

      // grid 업데이트
      return {
        ...newGrid,
        height: Math.max(...newGrid.cols.map((col) => col.height)),
      };
    });

    setGridInit(true);

    return () => {
      setGrid(null);
    };
  }, [containerWidth, imageDataPages, setGrid]);

  // 컨테이너 리사이즈 옵저버
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(
      _.debounce((entries) => {
        for (const entry of entries) {
          const contentBoxSize = entry.contentBoxSize[0];
          setContainerWidth(contentBoxSize.inlineSize);
        }
      }, 100),
    );

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  // 그리드 페이지 스크롤 복원
  useEffect(() => {
    if (!gridInit || !grid) return;

    const storedScroll = sessionStorage.getItem(pathname);
    const storedPrevPath = sessionStorage.getItem("prevPath");

    if (storedScroll && storedPrevPath) {
      const scroll = JSON.parse(storedScroll);
      const { scrollY, restoreWhenFrom } = scroll as {
        scrollY: number;
        restoreWhenFrom: string;
      };

      if (restoreWhenFrom === storedPrevPath || pathname === "/") {
        window.scrollTo({ top: scrollY });
        sessionStorage.removeItem(pathname);
      }
    }
  }, [pathname, gridInit, grid]);

  return (
    <div className="pb-4 pt-4" ref={containerRef}>
      {gridInit && grid && (
        <div
          className="m-auto"
          style={{
            width:
              grid!.colCount * grid!.colWidth +
              grid!.gap * (grid!.colCount + 1),
            minHeight: grid!.height,
          }}
        >
          <ImageGridCols imageDataPages={imageDataPages} />
        </div>
      )}
    </div>
  );
};

export default ImageGrid;
