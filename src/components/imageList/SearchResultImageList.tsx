"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { where } from "firebase/firestore";
import OrderByFilter from "./OrderByFilter";
import { useRouter } from "next/navigation";
import useResetGrid from "@/hooks/useResetGrid";

const SearchResultImageList = () => {
  const { replace } = useRouter();
  const grid = useRecoilValue(gridState);
  const params = useSearchParams();
  const queries = useMemo(() => params.getAll("query"), [params]);
  const [orderBy, setOrderBy] = useState<"popularity" | "createdAt">(
    (params.get("orderBy") as "popularity" | "createdAt") || "createdAt",
  );
  const resetSearchCreatedAtGrid = useResetGrid({
    gridType: "search-" + "createdAt",
  });
  const resetSearchPopularityGrid = useResetGrid({
    gridType: "search-" + "popularity",
  });

  useEffect(() => {
    if (queries.length <= 0) {
      replace("/");
    }
  }, [queries.length, replace]);

  useEffect(() => {
    resetSearchCreatedAtGrid();
    resetSearchPopularityGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  const onOrderByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as "popularity" | "createdAt");
    replace(`?orderBy=${e.target.value}&query=` + queries.join("&query="), {
      scroll: false,
    });
  };

  return (
    <div className="relative h-full bg-white">
      <div className="flex min-h-20 items-center border-b border-astronaut-950 p-4 pl-10">
        <h2 className="text-2xl font-semibold text-astronaut-700">
          &quot;{queries.join(" ")}&quot; 검색 결과
        </h2>
      </div>
      {grid && (
        <div
          style={{
            width:
              grid.colCount * grid.colWidth + grid.gap * (grid.colCount + 1),
          }}
          className="m-auto flex justify-end px-4 pt-4 opacity-50"
        >
          <OrderByFilter onChange={onOrderByChange} value={orderBy} />
        </div>
      )}
      <ImageGrid type={"search-" + orderBy} />
      {grid && (
        <ImageInfiniteScroller
          type={"search-" + orderBy}
          filter={{
            where: where("tags", "array-contains-any", queries),
            orderBy: [orderBy, "desc"],
            limit: Math.min(grid.colCount * 2, 1),
          }}
        />
      )}
    </div>
  );
};

export default SearchResultImageList;
