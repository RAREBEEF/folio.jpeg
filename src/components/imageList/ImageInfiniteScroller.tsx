import { MouseEvent, useEffect, useRef, useState } from "react";
import useGetImages from "@/hooks/useGetImages";
import Loading from "@/components/loading/Loading";
import { useRecoilValue } from "recoil";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  gridImageIdsState,
  gridState,
  lastVisibleState,
} from "@/recoil/states";
import { Filter, Folder } from "@/types";
import HandleDeletedImage from "./HandleDeletedImage";
import ArrowSvg from "@/icons/arrow-left-solid.svg";

const ImageInfiniteScroller = ({
  filter,
  type,
  folder,
}: {
  filter: Filter;
  type: string;
  folder?: Folder; // 저장한 이미지 중 삭제된 이미지 찾을 때 사용
}) => {
  const loadRef = useRef<HTMLDivElement>(null);
  const grid = useRecoilValue(gridState);
  const { getImages, isLoading, lastPage, isError } = useGetImages({
    gridType: type,
  });
  const lastVisible = useRecoilValue<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState(type));
  const gridImageIds = useRecoilValue(gridImageIdsState(type));
  const [imageCount, setImageCount] = useState<number>(0);

  // 무한 스크롤에 사용할 옵저버 (뷰포트에 감지되면 다음 페이지 불러온다.)
  useEffect(() => {
    const loadBtn = loadRef.current;
    if (!loadBtn || !grid) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          await getImages({ filter });
        }
      });
    });

    observer.observe(loadBtn);

    return () => {
      observer.unobserve(loadBtn);
    };
  }, [getImages, grid, filter]);

  // toTop 버튼
  const onScrollToTopClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 이미지 수
  useEffect(() => {
    if (!grid) return;
    const count = grid.cols.reduce((acc, cur) => cur.items.length + acc, 0);
    setImageCount(count);
  }, [grid]);

  return !lastPage && !isError ? (
    <div
      ref={loadRef}
      className="pb-24 pt-12 text-center text-sm text-astronaut-500"
    >
      <Loading />
    </div>
  ) : (
    grid && (
      <div className="h-[168px] pb-24 pt-12 text-center text-sm text-astronaut-500">
        {imageCount > 0 ? (
          <div className="flex flex-col">
            <p>{imageCount} 이미지</p>
            <button
              className="group m-auto mt-4 flex items-center gap-1 whitespace-nowrap text-astronaut-500"
              onClick={onScrollToTopClick}
            >
              <ArrowSvg className="h-3 w-3 rotate-90 fill-astronaut-500 transition-transform  group-hover:translate-y-[-5px]" />
              <div>맨 위로</div>
            </button>
          </div>
        ) : (
          <div>이미지가 존재하지 않습니다.</div>
        )}
        {/* 저장된 이미지의 로딩이 모두 끝나면 존재하지 않는 이미지의 id를 추려서 삭제한다. */}
        {/* 백엔드에서 구현하면 좋겠지만 지금은 프론트에서 처리  */}
        {folder && lastPage && (
          <HandleDeletedImage folder={folder} loadedImgIds={gridImageIds} />
        )}
      </div>
    )
  );
};

export default ImageInfiniteScroller;
