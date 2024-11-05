import useFollow from "@/hooks/useFollow";
import { UserData } from "@/types";
import Button from "../Button";

const FollowBtn = ({ userData }: { userData: UserData }) => {
  const { follow, unfollow, alreadyFollowing } = useFollow({
    targetUid: userData?.uid || "",
  });

  return (
    <div>
      <Button onClick={alreadyFollowing ? unfollow : follow}>
        <div>{alreadyFollowing ? "팔로우 취소" : "팔로우"}</div>
      </Button>
    </div>
  );
};

export default FollowBtn;
