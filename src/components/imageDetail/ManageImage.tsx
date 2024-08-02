import { Fragment, MouseEvent, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertsState,
  authStatusState,
  commentsState,
  imageDataState,
  lastVisibleState,
} from "@/recoil/states";
import { useRouter } from "next/navigation";
import _, { uniqueId } from "lodash";
import useResetGrid from "@/hooks/useResetGrid";
import TrashIcon from "@/icons/trash-solid.svg";
import PenIcon from "@/icons/pen-solid.svg";
import Link from "next/link";
import RefreshIcon from "@/icons/rotate-right-solid.svg";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import Share from "../Share";
import IconWithTooltip from "../IconWithTooltip";

const ManageImage = ({ imageId }: { imageId: string }) => {
  const setAlerts = useSetRecoilState(alertsState);
  const { back } = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const setComments = useSetRecoilState(commentsState(imageId));
  const setLastVisible = useSetRecoilState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(lastVisibleState("comments-" + imageId));
  const resetUserCreatedAtGrid = useResetGrid({
    gridType: "user-" + authStatus.data?.uid + "-" + "createdAt",
  });
  const resetUserPopularityGrid = useResetGrid({
    gridType: "user-" + authStatus.data?.uid + "-" + "Popularity",
  });
  const resetHomeCreatedAtGrid = useResetGrid({ gridType: "home-createdAt" });
  const resetHomePopularityGrid = useResetGrid({ gridType: "home-popularity" });
  const resetFollowingCreatedAtGrid = useResetGrid({
    gridType: "following-createdAt",
  });
  const resetFollowingPopularityGrid = useResetGrid({
    gridType: "following-popularity",
  });
  // const resetSearchPopularityGrid = useResetGrid({
  //   gridType: "search-" + "popularity",
  // });
  // const resetSearchCreatedAtGrid = useResetGrid({
  //   gridType: "search-" + "createdAt",
  // });
  const [imageData, setImageData] = useRecoilState(imageDataState(imageId));

  const onDeleteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!imageData || authStatus.data?.uid !== imageData.uid) return;

    const ok = window.confirm("이미지를 삭제하시겠습니까?");

    if (!ok) return;

    setIsLoading(true);

    try {
      // 이미지 doc의 하위 컬렉션인 comments도 함께 지우려면 admin-sdk를 이용하는게 좋아서 엔드포인트 구현
      await fetch(
        `/api/image/${imageId}?uid=${imageData.uid}&fileName=${imageData.fileName}&tag=${imageData.tags.join("&tag=")}`,
        {
          method: "DELETE",
        },
      );

      setImageData(null);
      resetHomeCreatedAtGrid();
      resetHomePopularityGrid();
      resetFollowingCreatedAtGrid();
      resetFollowingPopularityGrid();
      resetUserCreatedAtGrid();
      resetUserPopularityGrid();
      // resetSearchCreatedAtGrid();
      // resetSearchPopularityGrid();
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "success",
          createdAt: Date.now(),
          text: "삭제가 완료되었습니다.",
        },
      ]);
      // 뒤로가기
      back();
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: uniqueId(),
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "삭제 중 문제가 발생하였습니다. 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 새로고침
  const refreshImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setImageData(null);
    setLastVisible(null);
    setComments(null);
  };

  return (
    <div className="flex gap-2 rounded-l bg-white p-2 pr-2 text-xs">
      <button className="group relative" onClick={refreshImage}>
        <IconWithTooltip text="새로고침" tooltipDirection="top">
          <RefreshIcon className="h-7 fill-astronaut-700 p-1 transition-all hover:fill-astronaut-500" />
        </IconWithTooltip>
      </button>
      <Share />
      {imageData &&
        authStatus.data &&
        imageData.uid === authStatus.data.uid && (
          <Fragment>
            <Link className="group relative" href={`/edit/${imageData.id}`}>
              <IconWithTooltip text="수정" tooltipDirection="top">
                <PenIcon className="h-7 fill-astronaut-700 p-1 transition-all hover:fill-astronaut-500" />
              </IconWithTooltip>
            </Link>
            <button
              className="group relative"
              onClick={onDeleteClick}
              disabled={isLoading}
            >
              <IconWithTooltip text="삭제" tooltipDirection="top">
                <TrashIcon className="h-7 fill-astronaut-700 p-1 transition-all hover:fill-astronaut-500" />
              </IconWithTooltip>
            </button>
          </Fragment>
        )}
    </div>
  );
};

export default ManageImage;
