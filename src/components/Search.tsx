import useInput from "@/hooks/useInput";
import SearchSvg from "@/icons/magnifying-glass-solid.svg";
import Link from "next/link";
import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { hangulIncludes, choseongIncludes } from "es-hangul";
import useGetExistTags from "@/hooks/useGetExistTags";
import _ from "lodash";
import { deleteField, doc, FieldValue, updateDoc } from "firebase/firestore";
import { db } from "@/fb";
import { useRouter, useSearchParams } from "next/navigation";
import { useRecoilState, useSetRecoilState } from "recoil";
import { navState, searchHistoryState } from "@/recoil/states";

const Search = () => {
  const setNav = useSetRecoilState(navState);
  const [searchHistory, setSearchHistory] = useRecoilState(searchHistoryState);
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useRouter();
  const params = useSearchParams();
  const { getExistTags, isLoading: isExistTagsLoading } = useGetExistTags();
  const isInitialMount = useRef(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [existTagList, setExistTagList] = useState<
    { [key in string]: number } | null
  >(null);
  const { value, onChange } = useInput(params.getAll("query").join(" "));
  const [suggestions, setSuggestions] = useState<{ [key in string]: number }>(
    {},
  );

  // 존재하는 태그 목록 불러오기
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } else if (existTagList || isExistTagsLoading) {
      return;
    }

    (async () => {
      const list = await getExistTags();
      setExistTagList(list as { [key in string]: number });
    })();
  }, [getExistTags, existTagList, isExistTagsLoading]);

  // 개수 체크 및 정리
  useEffect(() => {
    if (!existTagList) return;

    const notExistAnymore = Object.entries(existTagList).filter(
      ([tag, count]) => count <= 0,
    );

    if (notExistAnymore.length <= 0) return;

    const cleanUpMap: { [key in string]: FieldValue } = Object.fromEntries(
      notExistAnymore.map(([tag, count]) => ["list." + tag, deleteField()]),
    );

    const docRef = doc(db, "tags", "data");
    (async () => {
      await updateDoc(docRef, cleanUpMap);
    })();
  }, [existTagList]);

  // 입력값으로 제안 생성
  useEffect(() => {
    if (!existTagList) {
      return;
    } else if (!value) {
      setSuggestions({});
      return;
    }

    const newSuggestions = _.cloneDeep(existTagList);

    for (const [tag, count] of Object.entries(newSuggestions)) {
      if (
        count <= 0 ||
        !(hangulIncludes(tag, value) || choseongIncludes(tag, value))
      ) {
        delete newSuggestions[tag];
      }
    }

    setSuggestions(newSuggestions);
  }, [existTagList, value]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    setSearchHistory((prev) => {
      const newHistory = Array.from(new Set([value, ...prev]));
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      return newHistory;
    });
    inputRef.current?.blur();
    push("/search?query=" + value.split(" ").join("&query="));
  };

  const onFocusInput = () => {
    setNav({ show: false });
    setShowDropdown(true);
  };
  const onBlurInput = () => {
    setShowDropdown(false);
  };

  const onDeleteHistoryItem = (
    e: MouseEvent<HTMLButtonElement>,
    target: string,
  ) => {
    e.preventDefault();
    setSearchHistory((prev) => {
      const newHistory = prev.filter((query) => query !== target);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const onDeleteAllHistory = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
  };

  return (
    <div className="relative mr-4 grow">
      {showDropdown &&
        Object.keys(suggestions).length + searchHistory.length > 0 && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            className="absolute top-7 flex h-fit max-h-[300px] w-full flex-col overflow-scroll rounded-b-lg bg-astronaut-50 text-astronaut-950 shadow-lg"
          >
            {value ? (
              // 입력값과 일치하는 추천 검색어
              Object.keys(suggestions).map((tag, i) => (
                <div key={tag} className="hover:bg-astronaut-100">
                  <Link
                    onMouseUp={(e) => {
                      e.preventDefault();
                      console.log(inputRef.current);
                      inputRef.current?.blur();
                      push("/search?query=" + value.split(" ").join("&query="));
                    }}
                    href={"/search?query=" + value.split(" ").join("&query=")}
                    className="block w-full p-2"
                  >
                    {tag}
                  </Link>
                </div>
              ))
            ) : (
              <div>
                <div className="flex justify-between whitespace-nowrap p-2 text-xs text-astronaut-800">
                  <div>검색기록</div>
                  <button
                    onClick={onDeleteAllHistory}
                    className="text-astronaut-500 underline"
                  >
                    전체 삭제
                  </button>
                </div>
                {searchHistory.map((queries, i) => (
                  <div
                    key={queries}
                    className="flex pr-2 hover:bg-astronaut-100"
                  >
                    <Link
                      onMouseUp={(e) => {
                        e.preventDefault();
                        console.log(inputRef.current);
                        inputRef.current?.blur();
                        push(
                          "/search?query=" + queries.split(" ").join("&query="),
                        );
                      }}
                      href={
                        "/search?query=" + queries.split(" ").join("&query=")
                      }
                      className="block w-full p-2"
                    >
                      {queries}
                    </Link>
                    <button
                      onClick={(e) => {
                        onDeleteHistoryItem(e, queries);
                      }}
                      className="whitespace-nowrap text-xs text-astronaut-500 underline"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      <form onSubmit={onSubmit} className="relative">
        <input
          ref={inputRef}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          value={value}
          onChange={onChange}
          minLength={1}
          maxLength={30}
          type="search"
          className={`h-7 w-full pl-6 pr-2 text-base outline-none ${showDropdown ? "bg-astronaut-50 text-astronaut-950" : "bg-astronaut-500 text-astronaut-50"} ${showDropdown && Object.keys(suggestions).length + searchHistory.length > 0 ? "rounded-t-lg border-b " : "rounded-lg"}`}
        />
        <SearchSvg
          className={`pointer-events-none absolute bottom-0 left-2 top-0 m-auto h-3 w-3 ${showDropdown ? "fill-astronaut-700" : "fill-astronaut-50"}`}
        />
      </form>
    </div>
  );
};

export default Search;
