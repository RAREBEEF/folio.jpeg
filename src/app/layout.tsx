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
  themeColor: "#ffffff",
  colorScheme: "light",
  minimumScale: 1,
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
};
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://folio-jpeg.rarebeef.co.kr",
  ),
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
  manifest: "/manifest.webManifest",
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
      url: "/images/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
      rel: "icon",
    },
    {
      url: "/images/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
      rel: "icon",
    },
    {
      url: "/images/favicon-96x96.png",
      sizes: "96x96",
      type: "image/png",
      rel: "icon",
    },
    {
      url: "/images/favicon-128.png",
      sizes: "128",
      type: "image/png",
      rel: "icon",
    },
    {
      url: "/images/favicon-196x196.png",
      sizes: "196x196",
      type: "image/png",
      rel: "icon",
    },
    {
      url: "/images/apple-touch-icon-57x57.png",
      sizes: "57x57",
      type: "image/png",
      rel: "apple-touch-icon-precomposed",
    },
    {
      url: "/images/apple-touch-icon-60x60.png",
      sizes: "60x60",
      type: "image/png",
      rel: "apple-touch-icon-precomposed",
    },
    {
      url: "/images/apple-touch-icon-72x72.png",
      sizes: "72x72",
      type: "image/png",
      rel: "apple-touch-icon-precomposed",
    },
    {
      url: "/images/apple-touch-icon-76x76.png",
      sizes: "76x76",
      type: "image/png",
      rel: "apple-touch-icon-precomposed",
    },
    {
      url: "/images/apple-touch-icon-114x114.png",
      sizes: "114x114",
      type: "image/png",
      rel: "apple-touch-icon-precomposed",
    },
    {
      url: "/images/apple-touch-icon-120x120.png",
      sizes: "120x120",
      type: "image/png",
      rel: "apple-touch-icon-precomposed",
    },
    {
      url: "/images/apple-touch-icon-144x144.png",
      sizes: "144x144",
      type: "image/png",
      rel: "apple-touch-icon-precomposed",
    },
    {
      url: "/images/apple-touch-icon-152x152.png",
      sizes: "152x152",
      type: "image/png",
      rel: "apple-touch-icon-precomposed",
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
      <head>
        <link
          rel="apple-touch-icon-precomposed"
          sizes="57x57"
          href="/images/apple-touch-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="114x114"
          href="/images/apple-touch-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="72x72"
          href="/images/apple-touch-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="144x144"
          href="/images/apple-touch-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="60x60"
          href="/images/apple-touch-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="120x120"
          href="/images/apple-touch-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="76x76"
          href="/images/apple-touch-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="152x152"
          href="/images/apple-touch-icon-152x152.png"
        />
        <link
          rel="icon"
          type="image/png"
          href="/images/favicon-196x196.png"
          sizes="196x196"
        />
        <link
          rel="icon"
          type="image/png"
          href="/images/favicon-96x96.png"
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/png"
          href="/images/favicon-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href="/images/favicon-16x16.png"
          sizes="16x16"
        />
        <link
          rel="icon"
          type="image/png"
          href="/images/favicon-128.png"
          sizes="128x128"
        />
        <meta name="application-name" content="folio.JPEG" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-TileImage"
          content="/images/mstile-144x144.png"
        />
        <meta
          name="msapplication-square70x70logo"
          content="/images/mstile-70x70.png"
        />
        <meta
          name="msapplication-square150x150logo"
          content="/images/mstile-150x150.png"
        />
        <meta
          name="msapplication-wide310x150logo"
          content="/images/mstile-310x150.png"
        />
        <meta
          name="msapplication-square310x310logo"
          content="/images/mstile-310x310.png"
        />
        <link
          href="/splashscreens/iphone5_splash.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/iphone6_splash.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/iphoneplus_splash.png"
          media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/iphonex_splash.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/iphonexr_splash.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/iphonexsmax_splash.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/ipad_splash.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/ipadpro1_splash.png"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/ipadpro3_splash.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splashscreens/ipadpro2_splash.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
      </head>
      <body className={inter.className + " flex min-h-lvh flex-col bg-white"}>
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
