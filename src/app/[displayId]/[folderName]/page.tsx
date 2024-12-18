import FolderDetail from "@/components/saveImage/FolderDetail";
import _ from "lodash";
import { ExtraUserData, Folder, ImageData } from "@/types";
import { Metadata, ResolvingMetadata } from "next";
import admin from "firebase-admin";
import logo from "@/images/logo.png";

type Props = {
  params: { displayId: string; folderName: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const displayId = params.displayId;
  const folderName = params.folderName;

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
  const usersCollectionRef = db.collection("users");
  const userDocSnap = await usersCollectionRef
    .where("displayId", "==", displayId)
    .limit(1)
    .get();

  let uid: string = "";
  let userData: ExtraUserData = {
    displayId,
    photoURL: logo.src,
    follower: [],
    following: [],
    allowPush: undefined,
  };

  let folderData: Folder = {
    createdAt: 0,
    id: "",
    images: [],
    isPrivate: false,
    name: folderName,
    uid,
    updatedAt: 0,
  };

  let user;

  if (!userDocSnap.empty) {
    userDocSnap.forEach((doc) => {
      userData = doc.data() as ExtraUserData;
      uid = doc.id;
    });

    user = await admin.auth().getUser(uid);

    // 폴더 데이터 불러오기
    const foldersCollectionRef = db.collection(`users/${uid}/folders`);
    const folderDocSnap = await foldersCollectionRef
      .where("name", "==", folderName)
      .limit(1)
      .get();

    folderDocSnap.forEach((doc) => {
      folderData = doc.data() as Folder;
    });
  }

  // 폴더에서 이미지 네 장 꺼내기
  const thumbnailIds = folderData.images.slice(0, 4);
  const thumbnailURLs: Array<string> = [userData.photoURL || logo.src];

  if (thumbnailIds.length <= 0) {
    // 이미지 없음
  } else {
    const imagesCollectionRef = db.collection(`images`);
    const imagesDocSnap = await imagesCollectionRef
      .where("id", "in", thumbnailIds)
      .limit(thumbnailIds.length)
      .get();

    imagesDocSnap.forEach((doc) => {
      thumbnailURLs.unshift((doc.data() as ImageData).URL);
    });
  }

  return {
    title: `${folderName} - ${user?.displayName}님의 폴더`,
    description:
      `${folderName}는 ${user?.displayName}님이 생성한 폴더입니다. ${user?.displayName}님이 저장한 이미지들을 확인해 보세요. ` +
      "folio.JPEG는 사진 공유형 SNS입니다. 찍은 사진을 공유하고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 또 업로드한 사진을 AI에게 분석을 요청해보세요.",
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
      url: `https://folio-jpeg.com/${displayId}/${folderName}`,
      title: `${folderName} - ${user?.displayName}님의 폴더`,
      description:
        `${folderName}는 ${user?.displayName}님이 생성한 폴더입니다. ${user?.displayName}님이 저장한 이미지들을 확인해 보세요. ` +
        "folio.JPEG는 사진 공유형 SNS입니다. 찍은 사진을 공유하고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 또 업로드한 사진을 AI에게 분석을 요청해보세요.",
      siteName: "folio.JPEG",
      images: thumbnailURLs.map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${folderName} - ${user?.displayName}님의 폴더`,
      description:
        `${folderName}는 ${user?.displayName}님이 생성한 폴더입니다. ${user?.displayName}님이 저장한 이미지들을 확인해 보세요. ` +
        "folio.JPEG는 사진 공유형 SNS입니다. 찍은 사진을 공유하고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 또 업로드한 사진을 AI에게 분석을 요청해보세요.",
      images: thumbnailURLs,
    },
  };
}

const FolderDetailPage = () => {
  return (
    <main id="folder-detail">
      <FolderDetail />
    </main>
  );
};

export default FolderDetailPage;
