import { userDataState } from "@/recoil/states";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import Modal from "@/components/modal/Modal";
import UserListModal from "@/components/modal/UserListModal";

const Follow = ({ displayId }: { displayId: string }) => {
  const [userData, setUserData] = useRecoilState(userDataState(displayId));
  const follower = useMemo(() => userData?.follower || [], [userData]);
  const following = useMemo(() => userData?.following || [], [userData]);
  const [showModal, setShowModal] = useState<false | "Follower" | "Following">(
    false,
  );

  const onFollowerClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowModal("Follower");
  };
  const onFollowingClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowModal("Following");
  };

  const onModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="flex justify-center gap-12 ">
      <button onClick={onFollowingClick}>
        <div className="font-semibold">팔로잉</div>
        <div className="text-shark-700">
          {following.length.toLocaleString() || 0}명
        </div>
      </button>
      <button onClick={onFollowerClick}>
        <div className="font-semibold">팔로워</div>
        <div className="text-shark-700">
          {follower.length.toLocaleString() || 0}명
        </div>
      </button>
      {showModal && (
        <Modal close={onModalClose} title={!!showModal ? showModal : ""}>
          <UserListModal
            users={showModal === "Follower" ? follower : following}
          />
        </Modal>
      )}
    </div>
  );
};

export default Follow;
