import HomeImageList from "@/components/imageList/HomeImageList";
import { Suspense } from "react";

export default function Home() {
  return (
    <main id="home">
      <Suspense>
        <HomeImageList />
      </Suspense>
    </main>
  );
}
