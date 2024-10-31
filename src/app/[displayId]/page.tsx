import UserDetail from "@/components/user/UserDetail";
import { Metadata, ResolvingMetadata } from "next";
import admin from "firebase-admin";
import { ExtraUserData } from "@/types";
import logo from "@/images/logo.png";
import { Suspense } from "react";

type Props = {
  params: { displayId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const displayId = params.displayId;

  // displayId로 extraUserData 불러오기
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY,
    clientEmail: process.env.NEXT_PUBLIC_CLIENT_EMAIL,
  };
  if (!admin.apps.length) {
    admin.initializeApp({
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const db = admin.firestore();
  const collectionRef = db.collection("users");
  const docSnap = await collectionRef
    .where("displayId", "==", displayId)
    .limit(1)
    .get();

  let data: ExtraUserData = {
    displayId,
    photoURL: logo.src,
    follower: [],
    following: [],
    allowPush: undefined,
  };
  let uid: string = "";

  docSnap.forEach((doc) => {
    data = doc.data() as ExtraUserData;
    uid = doc.id;
  });

  if (!uid) {
    return {};
  } else {
    const user = await admin.auth().getUser(uid);

    return {
      title: `${user.displayName}`,
      description:
        `${user.displayName}님의 프로필입니다. ${user.displayName}님이 업로드하고 저장한 이미지들을 확인해 보세요. ` +
        "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
      keywords: [
        "SNS",
        "소셜 네트워크 서비스",
        "Image",
        "이미지",
        "Photography",
        "사진",
        "AI Image Analysis",
        "AI 이미지 분석",
        "Frontend portfolio",
        "프론트엔드 포트폴리오",
      ],
      openGraph: {
        type: "website",
        url: `https://folio-jpeg.com/${displayId}`,
        title: `${user.displayName}.JPEG`,
        description:
          `${user.displayName}님이 업로드한 이미지들을 확인해 보세요. ` +
          "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
        siteName: "folio.JPEG",
        images: [
          {
            url: data.photoURL || logo.src,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${user.displayName}.JPEG`,
        description:
          `${user.displayName}님이 업로드한 이미지들을 확인해 보세요. ` +
          "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
        images: data.photoURL || logo.src,
      },
    };
  }
}

const UserPage = () => {
  return (
    <Suspense>
      <main id="user-detail">
        <UserDetail />
      </main>
    </Suspense>
  );
};

export default UserPage;
