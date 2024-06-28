import useLike from "@/hooks/useLike";
import { imageItemState } from "@/recoil/states";
import { useParams } from "next/navigation";
import { MouseEvent, useState } from "react";
import { useRecoilValue } from "recoil";
import FlashIcon from "@/icons/bolt-lightning-solid.svg";
import Modal from "@/components/modal/Modal";
import FollowModal from "@/components/modal/FollowModal";
import { UserData } from "@/types";

const Like = ({ author }: { author: UserData | null }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { id: imageId } = useParams();
  const { like, dislike, alreadyLiked, isLoading } = useLike(imageId);
  const imageItem = useRecoilValue(imageItemState(imageId as string));

  // 좋아용
  const onLikeClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (imageId && typeof imageId === "string" && imageItem && !isLoading)
      !alreadyLiked
        ? like(author?.fcmToken ? [author.fcmToken] : undefined)
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
    imageItem && (
      <div className="flex items-center justify-end gap-4 text-shark-700">
        <button
          onClick={onLikeListClick}
          className="flex items-center gap-1 text-shark-300"
        >
          <FlashIcon className="aspect-square w-3 fill-[#FADF15]" />
          {imageItem.likes.length.toLocaleString()}
        </button>
        <button
          onClick={onLikeClick}
          className="group flex items-center justify-center rounded-full border p-2"
        >
          {alreadyLiked ? (
            <FlashIcon className="aspect-square w-4 fill-[#FADF15] transition-all" />
          ) : (
            <FlashIcon className="aspect-square w-4 fill-shark-500 transition-all group-hover:fill-[#EAC608] group-active:fill-[#FADF15]" />
          )}
        </button>
        {showModal && (
          <Modal close={onCloseModal} title="좋아요">
            <FollowModal users={imageItem.likes} />
          </Modal>
        )}
      </div>
    )
  );
};

export default Like;
