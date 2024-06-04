import useLike from "@/hooks/useLike";
import { imageItemState } from "@/recoil/states";
import { useParams } from "next/navigation";
import { MouseEvent } from "react";
import { useRecoilValue } from "recoil";
import FlashIcon from "@/icons/bolt-lightning-solid.svg";
import BanIcon from "@/icons/ban-solid.svg";

const Like = () => {
  const { id } = useParams();
  const { like, dislike, alreadyLiked, isLoading } = useLike(id);
  const imageItem = useRecoilValue(imageItemState(id as string));

  // 좋아용
  const onLikeClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (id && typeof id === "string" && imageItem && !isLoading)
      !alreadyLiked ? like() : dislike();
  };

  return (
    imageItem && (
      <div className="flex items-center justify-end gap-4 text-shark-700">
        <div className="flex items-center gap-1 text-shark-300">
          <FlashIcon className="aspect-square w-3 fill-[#FADF15]" />
          {imageItem.likes.length}
        </div>
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
      </div>
    )
  );
};

export default Like;
