import useFollow from "@/hooks/useFollow";
import { authStatusState } from "@/recoil/states";
import { UserData } from "@/types";
import { useRecoilValue } from "recoil";
import Button from "../Button";

const FollowBtn = ({ userData }: { userData: UserData }) => {
  const authStatus = useRecoilValue(authStatusState);
  const { follow, unfollow, alreadyFollowing } = useFollow(userData?.uid || "");

  return (
    <div>
      <Button onClick={alreadyFollowing ? unfollow : follow}>
        <div>{alreadyFollowing ? "언팔로우" : "팔로우"}</div>
      </Button>
    </div>
  );
};

export default FollowBtn;
