import { MouseEvent, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { alertState, authStatusState, imageItemState } from "@/recoil/states";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading/Loading";
import _ from "lodash";
import useResetGrid from "@/hooks/useResetGrid";
import TrashIcon from "@/icons/trash-solid.svg";
import PenIcon from "@/icons/pen-solid.svg";
import Link from "next/link";

const ManageImage = ({ id }: { id: string }) => {
  const [alert, setAlert] = useRecoilState(alertState);
  const { back } = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authStatus = useRecoilValue(authStatusState);
  const resetUserGrid = useResetGrid("user-" + authStatus.data?.uid);
  const resetHomeGrid = useResetGrid("home");
  const resetFollowingGrid = useResetGrid("following");
  const [imageItem, setImageItem] = useRecoilState(imageItemState(id));

  const onDeleteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!imageItem || authStatus.data?.uid !== imageItem.uid) return;

    const ok = window.confirm("이미지를 삭제하시겠습니까?");

    if (!ok) return;

    setIsLoading(true);

    await fetch("/api/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId: id,
        uid: imageItem.uid,
        fileName: imageItem.fileName,
      }),
    })
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
      <div className="flex gap-2 rounded-l bg-shark-50 p-2 pr-2 text-xs">
        <Link href={`/edit/${imageItem.id}`}>
          <PenIcon className="h-7 fill-shark-700 p-1 transition-all hover:fill-shark-500" />
        </Link>
        <button onClick={onDeleteClick} disabled={isLoading}>
          {isLoading ? (
            <Loading />
          ) : (
            <TrashIcon className="h-7 fill-shark-700 p-1 transition-all hover:fill-shark-500" />
          )}
        </button>
      </div>
    )
  );
};

export default ManageImage;
