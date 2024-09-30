import Link from "next/link";
import ProfileImage from "@/components/user/ProfileImage";
import { UserData } from "@/types";
import Image from "next/image";
import ensureHttp from "@/tools/ensureHttp";
import ExternalLink from "../ExternalLink";

const ProfileCard = ({
  profileData,
  onlyImg = false,
  onlyName = false,
}: {
  profileData: UserData | null;
  onlyImg?: boolean;
  onlyName?: boolean;
}) => {
  return (
    <Link
      onClick={(e) => {
        if (!profileData) {
          e.preventDefault();
        }
      }}
      href={`/${profileData?.displayId}`}
      className={`group relative w-fit items-center gap-2 ${!onlyName && "flex"}`}
    >
      {!onlyName && (
        <span className="w-10">
          <ProfileImage URL={profileData?.photoURL || null} />
        </span>
      )}
      {!onlyImg && (
        <span className="font-semibold">{profileData?.displayName || ""}</span>
      )}
      {/* 마우스오버 프로필카드 */}
      <div className="absolute top-full z-50 hidden h-fit w-[200px] flex-col items-start rounded-lg bg-white p-4 shadow group-hover:flex">
        <div
          className={`relative mx-auto w-full overflow-hidden rounded-md ${profileData?.bgPhotoURL ? "aspect-video" : "h-14"}`}
        >
          {profileData?.bgPhotoURL && (
            <div className="left-0 right-0 m-auto overflow-hidden rounded-md">
              <Image
                src={profileData?.bgPhotoURL}
                layout="fill"
                objectFit="cover"
                alt="banner image"
              />
            </div>
          )}
          <div className="absolute bottom-2 left-0 right-0 m-auto w-12">
            <ProfileImage URL={profileData?.photoURL || null} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 pt-1">
          <div className="w-full text-center text-base font-semibold">
            {profileData?.displayName || ""}
            <div className="text-xs font-normal text-astronaut-600">
              @{profileData?.displayId || ""}
            </div>
          </div>

          <div className="flex justify-around text-sm">
            <div className="flex flex-col items-center">
              <div className="font-semibold">팔로워</div>
              <div className="text-xs">{profileData?.follower?.length}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-semibold">팔로잉</div>
              <div className="text-xs">{profileData?.following?.length}</div>
            </div>
          </div>

          <div className="flex w-full justify-center">
            {profileData?.links?.some((link) => link !== "") && (
              <div className="flex flex-col gap-1">
                {profileData.links.map((link, i) => (
                  <a
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    key={link + i}
                    href={ensureHttp(link)}
                    target="_blank"
                    className="fill-astronaut-500 text-sm text-astronaut-500"
                  >
                    <ExternalLink href={link} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProfileCard;
