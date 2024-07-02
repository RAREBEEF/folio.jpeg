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
        <div>{alreadyFollowing ? "언팔로우" : "팔로우"}</div>
      </Button>
    </div>
  );
};

export default FollowBtn;
