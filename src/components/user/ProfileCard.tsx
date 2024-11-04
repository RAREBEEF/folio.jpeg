"use client";

import Link from "next/link";
import ProfileImage from "@/components/user/ProfileImage";
import { UserData } from "@/types";
import Image from "next/image";
import ensureHttp from "@/tools/ensureHttp";
import ExternalLink from "../ExternalLink";
import { useCallback, useEffect, useRef, useState } from "react";
import useGetUserByUid from "@/hooks/useGetUserByUid";
import { useRecoilState } from "recoil";
import { usersDataState } from "@/recoil/states";

const ProfileCard = ({
  profileData,
  onlyImg = false,
  onlyName = false,
}: {
  profileData:
    | UserData
    | {
        uid: string | null | undefined;
        displayId: string | null | undefined;
        displayName: string | null | undefined;
        photoURL: string | null | undefined;
      }
    | null;
  onlyImg?: boolean;
  onlyName?: boolean;
}) => {
  const profileCardRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<UserData | null>(null);
  const { getUserByUid } = useGetUserByUid();
  const [usersData, setUsersData] = useRecoilState(usersDataState);

  const profileCardMouseoverHandler = useCallback(async () => {
    if (!profileData || profile) {
      return;
    }

    const { uid } = profileData;

    if (Object.keys(profileData).length <= 4) {
      if (!uid) {
        return;
      }
      if (usersData[uid]) {
        const profile = usersData[uid];
        setProfile(profile);
        setUsersData((prev) => ({ ...prev, [uid]: profile }));
      } else {
        (async () => {
          const profile = await getUserByUid({ uid });
          setProfile(profile);
        })();
      }
    } else {
      setProfile(profileData as UserData);
    }
  }, [getUserByUid, profile, profileData, setUsersData, usersData]);

  useEffect(() => {
    if (!profileCardRef.current) {
      return;
    }

    if (profileData && Object.keys(profileData).length > 4) {
      setProfile(profileData as UserData);
    } else {
      const profileCard = profileCardRef.current;

      profileCard.addEventListener("mouseover", profileCardMouseoverHandler, {
        once: true,
      });

      return () => {
        profileCard.removeEventListener(
          "mouseover",
          profileCardMouseoverHandler,
        );
      };
    }
  }, [getUserByUid, profileCardMouseoverHandler, profileData]);

  return (
    <div ref={profileCardRef} className={`group relative inline`}>
      <Link
        href={`/${profile ? profile.displayId : profileData?.displayId || ""}`}
        className={`w-fit items-center gap-2 ${!onlyName && "flex"}`}
      >
        {!onlyName && (
          <span className="w-10">
            <ProfileImage
              URL={profile ? profile.photoURL : profileData?.photoURL || null}
            />
          </span>
        )}
        {!onlyImg && (
          <span className="font-semibold">
            {profile ? profile.displayId : profileData?.displayId || ""}
          </span>
        )}
      </Link>

      <div className="absolute top-full z-50 hidden h-fit w-[200px] flex-col items-start rounded-lg bg-white p-4 pb-0 shadow group-hover:flex">
        {/* 마우스오버 프로필카드 */}
        <Link
          className="w-full pb-4"
          href={`/${profile ? profile.displayId : profileData?.displayId || ""}`}
        >
          <div
            className={`relative mx-auto w-full overflow-hidden rounded-md ${profile?.bgPhotoURL ? "aspect-video" : "h-14"}`}
          >
            {profile?.bgPhotoURL && (
              <div className="left-0 right-0 m-auto overflow-hidden rounded-md">
                <Image
                  src={profile?.bgPhotoURL}
                  layout="fill"
                  objectFit="cover"
                  alt="banner image"
                />
              </div>
            )}
            <div className="absolute bottom-2 left-0 right-0 m-auto w-12">
              <ProfileImage
                URL={profile ? profile.photoURL : profileData?.photoURL || null}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 pt-1">
            <div className="w-full text-center text-base font-semibold">
              {profile ? profile.displayName : profileData?.displayName || ""}
              <div className="text-xs font-normal text-astronaut-600">
                @{profile ? profile.displayId : profileData?.displayId || ""}
              </div>
            </div>

            <div className="flex justify-around text-sm">
              <div className="flex flex-col items-center">
                <div className="font-semibold">팔로워</div>
                <div className="text-xs">
                  {profile?.follower?.length || "0"}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="font-semibold">팔로잉</div>
                <div className="text-xs">
                  {profile?.following?.length || "0"}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="flex w-full justify-center border-t pt-4">
          {profile?.links?.some((link) => link !== "") && (
            <div className="flex flex-col gap-2">
              {profile.links.map((link, i) => (
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
  );
};

export default ProfileCard;
