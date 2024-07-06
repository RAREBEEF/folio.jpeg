import { imageItemState } from "@/recoil/states";
import { ImageData, ImageItem } from "@/types";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

const useSettleImageItemState = () => {
  const [id, setId] = useState<string>("");
  const [data, setData] = useState<ImageItem | null>(null);
  const setImageItem = useSetRecoilState(imageItemState(id));

  // id와 imageData를 받아와서 업데이트
  const settleImageItemState = ({ image }: { image: ImageData }) => {
    setId(image.id);
    setData(image);
  };

  // id와 imageData가 변경되면 둘의 일치 여부를 확인하고 상태 업데이트
  useEffect(() => {
    if (data && id === data.id) {
      setImageItem(data);
    }
  }, [data, id, setImageItem]);

  return { settleImageItemState };
};

export default useSettleImageItemState;
