import FolderDetail from "@/components/user/FolderDetail";
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
    fcmToken: "",
  };

  userDocSnap.forEach((doc) => {
    userData = doc.data() as ExtraUserData;
    uid = doc.id;
  });

  const user = await admin.auth().getUser(uid);

  // 폴더 데이터 불러오기
  const foldersCollectionRef = db.collection(`users/${uid}/folders`);
  const folderDocSnap = await foldersCollectionRef
    .where("name", "==", folderName)
    .limit(1)
    .get();

  let folderData: Folder = {
    createdAt: 0,
    id: "",
    images: [],
    isPrivate: false,
    name: folderName,
    uid,
    updatedAt: 0,
  };

  folderDocSnap.forEach((doc) => {
    folderData = doc.data() as Folder;
  });

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
    title: `${folderName} - ${user.displayName}님의 폴더`,
    description:
      `${user.displayName}님이 업로드한 이미지들을 확인해 보세요. ` +
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
      url: `https://folio-jpeg.rarebeef.co.kr/${displayId}`,
      title: `${folderName} - ${user.displayName}님의 폴더`,
      description:
        `${user.displayName}님이 업로드한 이미지들을 확인해 보세요. ` +
        "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
      siteName: "folio.JPEG",
      images: thumbnailURLs.map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${folderName} - ${user.displayName}님의 폴더`,
      description:
        `${user.displayName}님이 업로드한 이미지들을 확인해 보세요. ` +
        "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
      images: thumbnailURLs,
    },
  };
}

const FolderDetailPage = () => {
  return (
    <main>
      {/* <PageHeader header={currentFolder?.name || ""} /> */}
      <FolderDetail />
    </main>
  );
};

export default FolderDetailPage;
