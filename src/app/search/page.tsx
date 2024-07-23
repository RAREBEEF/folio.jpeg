import SearchResultImageList from "@/components/imageList/SearchResultImageList";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <main id="search-result">
        <SearchResultImageList />
      </main>
    </Suspense>
  );
}
