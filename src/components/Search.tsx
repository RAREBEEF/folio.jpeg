import useInput from "@/hooks/useInput";
import SearchSvg from "@/icons/magnifying-glass-solid.svg";
import Link from "next/link";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { hangulIncludes, choseongIncludes } from "es-hangul";
import useGetExistTags from "@/hooks/useGetExistTags";
import _ from "lodash";
const Search = () => {
  const { getExistTags, isLoading: isExistTagsLoading } = useGetExistTags();
  const isInitialMount = useRef(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [existTagList, setExistTagList] = useState<
    { [key in string]: number } | null
  >(null);
  const { value, onChange } = useInput("");
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

  console.log(existTagList);

  // 입력값으로 제안 생성
  useEffect(() => {
    if (!existTagList) {
      return;
    } else if (!value) {
      setSuggestions({});
      return;
    }

    const newSuggestions = _.cloneDeep(existTagList);

    // const includeChar = Object.entries(existTagList)?.filter(
    //   ([tag, count]) =>
    //     hangulIncludes(tag, value) || choseongIncludes(tag, value),
    // );

    for (const [tag, count] of Object.entries(newSuggestions)) {
      if (!(hangulIncludes(tag, value) || choseongIncludes(tag, value))) {
        delete newSuggestions[tag];
      }
    }

    setSuggestions(newSuggestions);
  }, [existTagList, value]);

  const onInputFocus = () => {
    setShowDropdown(true);
  };
  const onInputBlur = () => {
    setShowDropdown(false);
  };
  const onSuggestionClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    console.log("클릭");
  };

  return (
    <div className="relative mr-4 grow">
      {showDropdown && (
        <div className="absolute top-7 flex h-[300px] w-full flex-col overflow-scroll bg-astronaut-50 text-astronaut-950">
          {Object.entries(suggestions).map(([tag, count], i) => (
            <Link
              href={`/search/${tag}`}
              key={tag}
              className="p-2 hover:bg-astronaut-100"
              onClick={onSuggestionClick}
            >
              {tag} ({count})
            </Link>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          value={value}
          onChange={onChange}
          type="text"
          className="h-7 w-full rounded-lg bg-astronaut-500 px-6 text-base text-astronaut-950 outline-none focus:rounded-b-none focus:bg-astronaut-50"
        />
        <SearchSvg className="absolute bottom-0 left-2 top-0 m-auto h-3 w-3 fill-astronaut-700" />
      </div>
    </div>
  );
};

export default Search;
