import Link from "next/link";
import ProfileImage from "@/components/user/ProfileImage";
import { UserData } from "@/types";

const ProfileCard = ({ profileData }: { profileData: UserData | null }) => {
  return (
    <Link
      onClick={(e) => {
        if (!profileData) {
          e.preventDefault();
        }
      }}
      href={`/${profileData?.displayId}`}
      className="flex w-fit items-center gap-2"
    >
      <div className="w-10">
        <ProfileImage url={profileData?.photoURL || null} />
      </div>
      <div className="font-bold">{profileData?.displayName || ""}</div>
    </Link>
  );
};

export default ProfileCard;
