import { MouseEvent, useEffect, useRef } from "react";
import useGetImages from "@/hooks/useGetImages";
import Loading from "../Loading";
import { useRecoilValue } from "recoil";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  gridImageIdsState,
  gridState,
  lastVisibleState,
} from "@/recoil/states";
import { Filter, Folder } from "@/types";
import HandleDeletedImage from "./HandleDeletedImage";

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
  const { getImages, isLoading, lastPage } = useGetImages(type);
  const lastVisible = useRecoilValue<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState(type));
  const gridImageIds = useRecoilValue(gridImageIdsState(type));

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
  }, [getImages, isLoading, grid, filter]);

  // toTop 버튼
  const onScrollToTopClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return !lastPage ? (
    <div
      ref={loadRef}
      className="pb-24 pt-12 text-center text-sm text-shark-500"
    >
      <Loading />
    </div>
  ) : (
    grid && (
      <div className="h-[168px] pb-24 pt-12 text-center text-sm text-shark-500">
        <p>
          {grid.cols.reduce((acc, cur) => cur.items.length + acc, 0)} 이미지.
        </p>
        <button className="mt-4" onClick={onScrollToTopClick}>
          맨 위로
        </button>
        {/* 저장된 이미지의 로딩이 모두 끝나면 존재하지 않는 이미지의 id를 추려서 삭제한다. */}
        {/* 이러한 처리는 백엔드에서 하는게 좋겠지만 당장은 구현이 힘드니 여기에 임시로 구현한다.  */}
        {folder && lastPage && (
          <HandleDeletedImage folder={folder} loadedImgIds={gridImageIds} />
        )}
      </div>
    )
  );
};

export default ImageInfiniteScroller;
