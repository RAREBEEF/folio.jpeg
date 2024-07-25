import { imageDataState } from "@/recoil/states";
import { ImageData } from "@/types";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

const useSettleImageDataState = () => {
  const [id, setId] = useState<string>("");
  const [data, setData] = useState<ImageData | null>(null);
  const setImageData = useSetRecoilState(imageDataState(id));

  // id와 imageData를 받아와서 업데이트
  const settleImageDataState = ({ image }: { image: ImageData }) => {
    setId(image.id);
    setData(image);
  };

  // id와 imageData가 변경되면 둘의 일치 여부를 확인하고 상태 업데이트
  useEffect(() => {
    if (data && id === data.id) {
      setImageData(data);
    }
  }, [data, id, setImageData]);

  return { settleImageDataState };
};

export default useSettleImageDataState;
