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
import Share from "../Share";

const SearchResultImageList = () => {
  const { replace } = useRouter();
  const grid = useRecoilValue(gridState);
  const params = useSearchParams();
  const queries = useMemo(() => params.getAll("query"), [params]);
  const [orderBy, setOrderBy] = useState<"popularity" | "createdAt">(
    (params.get("orderBy") as "popularity" | "createdAt") || "createdAt",
  );
  const resetSearchCreatedAtGrid = useResetGrid({
    gridType: "search-" + queries.join(" ") + "-createdAt",
  });
  const resetSearchPopularityGrid = useResetGrid({
    gridType: "search-" + queries.join(" ") + "-popularity",
  });

  useEffect(() => {
    if (queries.length <= 0) {
      replace("/");
    }
  }, [queries.length, replace]);

  // useEffect(() => {
  //   resetSearchCreatedAtGrid();
  //   resetSearchPopularityGrid();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [queries]);

  const onOrderByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as "popularity" | "createdAt");
    replace(`?orderBy=${e.target.value}&query=` + queries.join("&query="), {
      scroll: false,
    });
  };

  return (
    <div className="relative h-full bg-white">
      <div className="flex min-h-20 items-center justify-between border-b border-astronaut-200 p-4 pl-10">
        <h2 className="text-2xl font-semibold text-astronaut-700">
          &quot;{queries.join(" ")}&quot; 검색 결과
        </h2>
        <Share tooltipDirection="bottom" />
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
      <ImageGrid type={"search-" + queries.join(" ") + "-" + orderBy} />
      {grid && (
        <ImageInfiniteScroller
          key={queries.join(" ")}
          type={"search-" + queries.join(" ") + "-" + orderBy}
          filter={{
            where: where("tags", "array-contains-any", queries),
            orderBy: [orderBy, "desc"],
            limit:
              process.env.NODE_ENV === "development" ? 1 : grid.colCount * 2,
          }}
        />
      )}
    </div>
  );
};

export default SearchResultImageList;
