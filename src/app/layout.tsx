import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RecoilProvider from "./recoilProvider";
import LayoutHeader from "./components/layouts/LayoutHeader";
import LayoutFooter from "./components/layouts/LaytoutFooter";
import LayoutContent from "./components/layouts/LayoutContent";

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
      <RecoilProvider>
        <body
          className={inter.className + " flex min-h-lvh flex-col bg-shark-950"}
        >
          <LayoutHeader />
          <LayoutContent>{children}</LayoutContent>
          <LayoutFooter />
        </body>
      </RecoilProvider>
    </html>
  );
}
