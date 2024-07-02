import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RecoilProvider from "@/recoil/recoilProvider";
import LayoutHeader from "@/components/layouts/LayoutHeader";
import LayoutFooter from "@/components/layouts/LaytoutFooter";
import LayoutBody from "@/components/layouts/LayoutBody";
import { Fragment } from "react";
import Init from "@/components/background/Init";
import logo from "@/images/logo.png";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FOLIO.jpeg",
  applicationName: "folio.JPEG",
  authors: { url: "https://rarebeef.co.kr/", name: "RAREBEEF" },
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
  description:
    "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
  themeColor: "#1f1f1f",
  colorScheme: "dark",
  openGraph: {
    type: "website",
    url: "https://folio-jpeg.rarebeef.co.kr",
    title: "folio.JPEG",
    description:
      "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
    siteName: "folio.JPEG",
    images: [
      {
        url: logo.src,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "folio.JPEG",
    description:
      "folio.JPEG에 이미지를 업로드하고 AI에게 분석을 요청하세요. 그리고 다른 사람들이 올린 다양한 이미지들을 확인해 보세요.",
    images: logo.src,
  },
  appleWebApp: {
    capable: true,
    title: "folio.JPEG",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={inter.className + " flex min-h-lvh flex-col bg-shark-950"}
      >
        <RecoilProvider>
          <Fragment>
            <LayoutHeader />
            <LayoutBody>{children}</LayoutBody>
            <LayoutFooter />
            <Init />
          </Fragment>
        </RecoilProvider>
      </body>
    </html>
  );
}
