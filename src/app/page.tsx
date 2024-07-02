import HomeImageList from "@/components/imageList/HomeImageList";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <main id="home">
        <HomeImageList />
      </main>
    </Suspense>
  );
}
