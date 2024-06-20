"use client";

import Image from "next/image";
import ProfileSvg from "@/icons/user-solid.svg";

const ProfileImage = ({ url }: { url: string | null }) => {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-full bg-gradient-to-br from-shark-100 to-shark-300`}
    >
      {url ? (
        <Image
          src={url}
          alt={"Profile image"}
          layout="fill"
          objectFit="cover"
        />
      ) : (
        <ProfileSvg className="aspect-square translate-y-[10%] fill-white p-[10%]" />
      )}
    </div>
  );
};

export default ProfileImage;
