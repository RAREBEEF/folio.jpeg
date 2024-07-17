function removeSymbols(str: string) {
  return str.replace(/[^a-zA-Z가-힣0-9\s]/g, " ");
}

const useCreateKeywordFromContent = () => {
  const createKeywordFromContent = (content: string) => {
    const withoutSymbols = removeSymbols(content);
    const keywords = [];
    const words = withoutSymbols.split(" ");
    const josaList = [
      "이",
      "가",
      "을",
      "를",
      "은",
      "는",
      "으로",
      "로",
      "와",
      "과",
      "이나",
      "나",
      "이에",
      "에",
      "이란",
      "란",
      "아",
      "야",
      "이랑",
      "랑",
      "이에요",
      "예요",
      "으로서",
      "로서",
      "으로써",
      "로써",
      "으로부터",
      "로부터",
      "에서",
      "입니다",
    ];

    for (const word of words) {
      for (const josa of josaList) {
        const regex = new RegExp(`${josa}$`);
        if (regex.test(word)) keywords.push(word.slice(0, -josa.length));
      }
    }

    keywords.push(...words);

    return Array.from(new Set(keywords));
  };

  return { createKeywordFromContent };
};

export default useCreateKeywordFromContent;
