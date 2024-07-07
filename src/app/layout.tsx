import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#1f1f1f",
  colorScheme: "dark",
};
export const metadata: Metadata = {
  title: "folio.JPEG",
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
  icons: [
    {
      url: "/images/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      rel: "icon",
    },
    {
      url: "/images/icon-256x256.png",
      sizes: "256x256",
      type: "image/png",
      rel: "icon",
    },
    {
      url: "/images/icon-384x384.png",
      sizes: "384x384",
      type: "image/png",
      rel: "icon",
    },
    {
      url: "/images/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      rel: "icon",
    },
  ],
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
