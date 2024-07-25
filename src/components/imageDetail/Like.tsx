import useLike from "@/hooks/useLike";
import { imageDataState } from "@/recoil/states";
import { useParams } from "next/navigation";
import { MouseEvent, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import FlashIcon from "@/icons/bolt-lightning-solid.svg";
import Modal from "@/components/modal/Modal";
import UserListModal from "@/components/modal/UserListModal";
import { UserData } from "@/types";

const Like = ({ author }: { author: UserData | null }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { id: imageIdParam } = useParams();
  const imageId = useMemo(
    () => JSON.stringify(imageIdParam).replaceAll('"', ""),
    [imageIdParam],
  );
  const imageData = useRecoilValue(imageDataState(imageId as string));
  const { like, dislike, alreadyLiked, isLoading } = useLike({ imageId });

  // 좋아용
  const onLikeClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (imageId && imageData && !isLoading)
      !alreadyLiked
        ? like(author?.fcmToken ? [author.fcmToken] : null)
        : dislike();
  };

  const onLikeListClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowModal(true);
  };

  const onCloseModal = () => {
    setShowModal(false);
  };

  return (
    imageData && (
      <div className="flex items-center justify-end gap-4 text-astronaut-700">
        <button
          onClick={onLikeListClick}
          className="flex items-center gap-1 text-astronaut-300"
        >
          <FlashIcon className="aspect-square w-3 fill-[#FADF15]" />
          {imageData.likes.length.toLocaleString()}
        </button>
        <button
          onClick={onLikeClick}
          className="group flex items-center justify-center rounded-full border p-2"
        >
          {alreadyLiked ? (
            <FlashIcon className="aspect-square w-4 fill-[#FADF15] transition-all" />
          ) : (
            <FlashIcon className="aspect-square w-4 fill-astronaut-500 transition-all group-hover:fill-[#EAC608] group-active:fill-[#FADF15]" />
          )}
        </button>
        {showModal && (
          <Modal close={onCloseModal} title="좋아요">
            <UserListModal users={imageData.likes} />
          </Modal>
        )}
      </div>
    )
  );
};

export default Like;
