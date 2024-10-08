"use client";

import Image from "next/image";
import { useState } from "react";
import defaultProfileImage from "@/images/user.png";
// import defaultProfileImage from "@/images/user-solid.png";

const ProfileImage = ({ URL }: { URL: string | null }) => {
  const [isImageBroken, setIsImageBroken] = useState<boolean>(false);
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-full bg-white`}
    >
      {/* {URL && !isImageBroken ? ( */}
      <Image
        src={isImageBroken ? defaultProfileImage : URL || defaultProfileImage}
        alt={"Profile image"}
        layout="fill"
        objectFit="cover"
        onError={() => {
          setIsImageBroken(true);
        }}
      />
      {/* ) : (
        <ProfileSvg className="aspect-square translate-y-[10%] fill-white p-[10%]" />
      )} */}
    </div>
  );
};

export default ProfileImage;
