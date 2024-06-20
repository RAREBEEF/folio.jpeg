import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RecoilProvider from "@/recoil/recoilProvider";
import LayoutHeader from "@/components/layouts/LayoutHeader";
import LayoutFooter from "@/components/layouts/LaytoutFooter";
import LayoutBody from "@/components/layouts/LayoutBody";
import { Fragment } from "react";
import Init from "@/components/Init";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FOLIO.jpeg",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
