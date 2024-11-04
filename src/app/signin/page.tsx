import PageHeader from "@/components/layouts/PageHeader";
import SignInFormInPage from "@/components/user/SignInFormInPage";
import { Metadata, ResolvingMetadata } from "next";
import logo from "@/images/logo.png";

type Props = {
  params: { displayId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: `folio.JPEG`,
    description:
      "folio.JPEG에 로그인하고 찍은 사진을 공유해보세요. 그리고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 업로드한 사진을 AI에게 분석 요청할 수도 있습니다.",
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
      url: `https://folio-jpeg.com/signin`,
      title: `folio.JPEG`,
      description:
        "folio.JPEG에 로그인하고 찍은 사진을 공유해보세요. 그리고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 업로드한 사진을 AI에게 분석 요청할 수도 있습니다.",
      siteName: "folio.JPEG",
      images: {
        url: logo.src,
      },
    },
    twitter: {
      card: "summary_large_image",
      title: `folio.JPEG`,
      description:
        "folio.JPEG에 로그인하고 찍은 사진을 공유해보세요. 그리고 다른 사람들이 올린 다양한 사진들도 확인해 보세요. 업로드한 사진을 AI에게 분석 요청할 수도 있습니다.",
      images: logo.src,
    },
  };
}

const SignInPage = () => {
  return (
    <main>
      <PageHeader header="로그인" />
      <SignInFormInPage />
    </main>
  );
};

export default SignInPage;
