import { uploadStatusState } from "@/recoil/states";
import { UploadStatuses, AnalysisResult } from "@/types";
import _ from "lodash";
import { useSetRecoilState } from "recoil";

const useUpdateUploadStatus = () => {
  const setUploadStatus = useSetRecoilState(uploadStatusState);

  const updateUploadStatus = ({
    id,
    status,
    previewURL = "",
    failMessage = "",
    analysisResult = null,
  }: {
    id: string;
    status: UploadStatuses;
    previewURL?: string;
    failMessage?: string;
    analysisResult?: AnalysisResult | null;
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
          analysisResult,
        });
      }

      return newUploadStatus;
    });
  };

  return { updateUploadStatus };
};
export default useUpdateUploadStatus;
