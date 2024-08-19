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
      if (args) {
        argList.push(args);
      }
      if (multipleArgs && multipleArgs.length > 0) {
        argList.push(...multipleArgs);
      }

      console.log(argList);

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
