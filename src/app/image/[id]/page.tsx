import ImageDetail from "@/components/imageDetail/ImageDetail";
import { ImageData } from "@/types";
import { Metadata, ResolvingMetadata } from "next";
import admin from "firebase-admin";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const id = params.id;

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
  const docRef = db.doc(`images/${id}`);
  const docSnap = await docRef.get();
  const data: ImageData = docSnap.data() as ImageData;
  if (!data) {
    return {};
  } else {
    const user = await admin.auth().getUser(data.uid);

    return {
      title: data.title || `${user.displayName}님의 사진`,
      description:
        data.description ||
        `${user.displayName}님이 업로드한 사진입니다. ` +
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
        ...data.tags,
      ],
      openGraph: {
        type: "website",
        url: `https://folio-jpeg.rarebeef.co.kr/image/${id}`,
        title: data.title || `${user.displayName}님의 사진`,
        description:
          data.description ||
          `${user.displayName}님이 업로드한 사진입니다. ` +
            "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
        siteName: "folio.JPEG",
        images: [
          {
            url: data.URL,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: data.title || `${user.displayName}님의 사진`,
        description:
          data.description ||
          `${user.displayName}님이 업로드한 사진입니다. ` +
            "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
        images: data.URL,
      },
    };
  }
}

const ImagePage = () => {
  return (
    <main id="image-detail">
      <ImageDetail />
    </main>
  );
};
export default ImagePage;
