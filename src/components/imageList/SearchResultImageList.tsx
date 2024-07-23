"use client";

import _ from "lodash";
import ImageGrid from "../grid/ImageGrid";
import { useRecoilValue } from "recoil";
import { gridState } from "@/recoil/states";
import ImageInfiniteScroller from "./ImageInfiniteScroller";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { where } from "firebase/firestore";
import OrderByFilter from "./OrderByFilter";
import { useRouter } from "next/navigation";

const SearchResultImageList = () => {
  const { replace } = useRouter();
  const grid = useRecoilValue(gridState);
  const params = useSearchParams();
  const queries = params.getAll("query");
  const [orderBy, setOrderBy] = useState<"popularity" | "createdAt">(
    (params.get("orderBy") as "popularity" | "createdAt") || "createdAt",
  );

  useEffect(() => {
    if (queries.length <= 0) {
      replace("/");
    }
  }, [queries.length, replace]);

  const onOrderByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as "popularity" | "createdAt");
    replace(`?orderBy=${e.target.value}&query=` + queries.join("&query="), {
      scroll: false,
    });
  };

  return (
    <div className="relative h-full bg-astronaut-50">
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
