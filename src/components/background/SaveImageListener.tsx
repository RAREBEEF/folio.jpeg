import { saveModalState } from "@/recoil/states";
import { useRecoilState } from "recoil";
import Modal from "../modal/Modal";
import SaveModal from "../modal/SaveModal";

const SaveImageListener = () => {
  const [saveModal, setSaveModal] = useRecoilState(saveModalState);

  const closeModal = () => {
    setSaveModal({ show: false, image: null, imageSavedFolder: null });
  };

  return (
    saveModal.show && (
      <Modal close={closeModal} title="이미지 저장 관리">
        <SaveModal />
      </Modal>
    )
  );
};

export default SaveImageListener;
