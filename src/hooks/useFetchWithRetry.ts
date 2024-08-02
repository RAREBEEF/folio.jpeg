const useFetchWithRetry = () => {
  const fetchWithRetry = async <T>({
    asyncFn,
    args,
    multipleArgs,
    retries = 2,
  }: {
    asyncFn: (...args: any) => Promise<T>;
    args?: any;
    multipleArgs?: Array<any>;
    retries?: number;
  }): Promise<T> => {
    try {
      // 전달할 인자 종합하기
      const argList = [];
      args && argList.push(args);
      multipleArgs && argList.push(multipleArgs);

      return await asyncFn(...argList);
    } catch (error) {
      if (retries > 0) {
        console.log("retry");
        return await fetchWithRetry({
          asyncFn,
          args,
          multipleArgs,
          retries: retries - 1,
        });
      } else {
        throw error;
      }
    }
  };

  return { fetchWithRetry };
};

export default useFetchWithRetry;
