import SearchResultImageList from "@/components/imageList/SearchResultImageList";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import _ from "lodash";
import { ImageData } from "@/types";
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
  const { query } = searchParams;
  const queries = Array.isArray(query) ? query : [query || ""];

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

  const imgURLs: Array<string> = [logo.src];

  const db = admin.firestore();
  const imagesCollectionRef = db.collection(`images`);
  const imagesDocSnap = await imagesCollectionRef
    .where("tags", "array-contains-any", queries)
    .limit(4)
    .get();

  if (imagesDocSnap.empty) {
  } else {
    imagesDocSnap.forEach((doc) => {
      imgURLs.unshift((doc.data() as ImageData).URL);
    });
  }

  return {
    title: `folio.jpeg - "${queries.join(" ")}" 검색 결과`,
    description:
      `"${queries.join(" ")}"와 관련된 이미지들을 확인해 보세요. ` +
      "folio.JPEG는 사진 공유형 SNS입니다. 찍은 사진을 공유하고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 또 업로드한 사진을 AI에게 분석을 요청해보세요.",
    keywords: [
      ...queries,
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
      url: `https://folio-jpeg.com/${"search?query=" + queries.join("&query=")}`,
      title: `folio.jpeg - "${queries.join(" ")}" 검색 결과`,
      description:
        `"${queries.join(" ")}"와 관련된 이미지들을 확인해 보세요. ` +
        "folio.JPEG는 사진 공유형 SNS입니다. 찍은 사진을 공유하고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 또 업로드한 사진을 AI에게 분석을 요청해보세요.",
      siteName: "folio.JPEG",
      images: imgURLs.map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: `folio.jpeg - "${queries.join(" ")}" 검색 결과`,
      description:
        `"${queries.join(" ")}"와 관련된 이미지들을 확인해 보세요. ` +
        "folio.JPEG는 사진 공유형 SNS입니다. 찍은 사진을 공유하고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 또 업로드한 사진을 AI에게 분석을 요청해보세요.",
      images: imgURLs,
    },
  };
}

export default function Home() {
  return (
    <main id="search-result">
      <Suspense>
        <SearchResultImageList />
      </Suspense>
    </main>
  );
}
