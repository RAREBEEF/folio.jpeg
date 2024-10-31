import { uploadStatusState } from "@/recoil/states";
import { UploadStatuses, ImageData } from "@/types";
import _ from "lodash";
import { useSetRecoilState } from "recoil";

const useUpdateUploadStatus = () => {
  const setUploadStatus = useSetRecoilState(uploadStatusState);

  const updateUploadStatus = ({
    id,
    status,
    previewURL = "",
    failMessage = "",
    imageData = null,
  }: {
    id: string;
    status: UploadStatuses;
    previewURL?: string;
    failMessage?: string;
    imageData?: ImageData | null | undefined;
  }) => {
    setUploadStatus((prev) => {
      const newUploadStatus = _.cloneDeep(prev);

      if (status === "start") {
        newUploadStatus.push({
          id,
          previewURL,
          createdAt: Date.now(),
          status,
          failMessage,
        });
      } else {
        const targetIndex = prev.findIndex((upload) => upload.id === id);
        newUploadStatus.splice(targetIndex, 1, {
          ...prev[targetIndex],
          status,
          failMessage,
          imageData,
        });
      }

      return newUploadStatus;
    });
  };

  return { updateUploadStatus };
};

export default useUpdateUploadStatus;
