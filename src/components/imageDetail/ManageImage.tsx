import { MouseEvent, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertsState,
  authStatusState,
  imageDataState,
  searchHistoryState,
} from "@/recoil/states";
import { useRouter } from "next/navigation";
import _, { uniqueId } from "lodash";
import useResetGrid from "@/hooks/useResetGrid";
import TrashIcon from "@/icons/trash-solid.svg";
import PenIcon from "@/icons/pen-solid.svg";
import Link from "next/link";

const ManageImage = ({ id }: { id: string }) => {
  const setAlerts = useSetRecoilState(alertsState);
  const { back } = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const searchHistory = useRecoilValue(searchHistoryState);
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
  const resetSearchPopularityGrid = useResetGrid({
    gridType: "search-" + "popularity",
  });
  const resetSearchCreatedAtGrid = useResetGrid({
    gridType: "search-" + "createdAt",
  });
  const [imageData, setImageData] = useRecoilState(imageDataState(id));

  const onDeleteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!imageData || authStatus.data?.uid !== imageData.uid) return;

    const ok = window.confirm("이미지를 삭제하시겠습니까?");

    if (!ok) return;

    setIsLoading(true);

    // 이미지 doc의 하위 컬렉션인 comments도 함께 지우려면 admin-sdk를 이용하는게 좋아서 엔드포인트 구현
    await fetch(
      `/api/image/${id}?uid=${imageData.uid}&fileName=${imageData.fileName}&tag=${imageData.tags.join("&tag=")}`,
      {
        method: "DELETE",
      },
    )
      .then(() => {
        setImageData(null);
        resetHomeCreatedAtGrid();
        resetHomePopularityGrid();
        resetFollowingCreatedAtGrid();
        resetFollowingPopularityGrid();
        resetUserCreatedAtGrid();
        resetUserPopularityGrid();
        resetSearchCreatedAtGrid();
        resetSearchPopularityGrid();
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
        back();
      })
      .catch((error) => {
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
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    imageData &&
    authStatus.data &&
    imageData.uid === authStatus.data.uid && (
      <div className="flex gap-2 rounded-l bg-astronaut-50 p-2 pr-2 text-xs">
        <Link href={`/edit/${imageData.id}`}>
          <PenIcon className="h-7 fill-astronaut-700 p-1 transition-all hover:fill-astronaut-500" />
        </Link>
        <button onClick={onDeleteClick} disabled={isLoading}>
          <TrashIcon className="h-7 fill-astronaut-700 p-1 transition-all hover:fill-astronaut-500" />
        </button>
      </div>
    )
  );
};

export default ManageImage;
