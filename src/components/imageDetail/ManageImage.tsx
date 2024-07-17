import { MouseEvent, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { alertState, authStatusState, imageItemState } from "@/recoil/states";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading/Loading";
import _ from "lodash";
import useResetGrid from "@/hooks/useResetGrid";
import TrashIcon from "@/icons/trash-solid.svg";
import PenIcon from "@/icons/pen-solid.svg";
import Link from "next/link";

const ManageImage = ({ id }: { id: string }) => {
  const setAlert = useSetRecoilState(alertState);
  const { back } = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const resetUserGrid = useResetGrid({
    gridType: "user-" + authStatus.data?.uid,
  });
  const resetHomeGrid = useResetGrid({ gridType: "home" });
  const resetFollowingGrid = useResetGrid({ gridType: "following" });
  const [imageItem, setImageItem] = useRecoilState(imageItemState(id));

  const onDeleteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!imageItem || authStatus.data?.uid !== imageItem.uid) return;

    const ok = window.confirm("이미지를 삭제하시겠습니까?");

    if (!ok) return;

    setIsLoading(true);

    // 이미지 doc의 하위 컬렉션인 comments도 함께 지우려면 admin-sdk를 이용하는게 좋아서 엔드포인트 구현
    await fetch(
      `/api/image/${id}?uid=${imageItem.uid}&fileName=${imageItem.fileName}`,
      {
        method: "DELETE",
      },
    )
      .then(() => {
        setImageItem(null);
        resetHomeGrid();
        resetFollowingGrid();
        resetUserGrid();
        setAlert({
          show: true,
          type: "success",
          createdAt: Date.now(),
          text: "삭제가 완료되었습니다.",
        });
        back();
      })
      .catch((error) => {
        setAlert({
          show: true,
          type: "warning",
          createdAt: Date.now(),
          text: "삭제 중 문제가 발생하였습니다. 다시 시도해 주세요.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    imageItem &&
    authStatus.data &&
    imageItem.uid === authStatus.data.uid && (
      <div className="bg-astronaut-50 flex gap-2 rounded-l p-2 pr-2 text-xs">
        <Link href={`/edit/${imageItem.id}`}>
          <PenIcon className="fill-astronaut-700 hover:fill-astronaut-500 h-7 p-1 transition-all" />
        </Link>
        <button onClick={onDeleteClick} disabled={isLoading}>
          {isLoading ? (
            <Loading />
          ) : (
            <TrashIcon className="fill-astronaut-700 hover:fill-astronaut-500 h-7 p-1 transition-all" />
          )}
        </button>
      </div>
    )
  );
};

export default ManageImage;
