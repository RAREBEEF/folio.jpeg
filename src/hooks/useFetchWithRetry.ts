const useFetchWithRetry = () => {
  const fetchWithRetry = async <T>({
    asyncFn,
    args,
    retries = 2,
  }: {
    asyncFn: (arg: any) => Promise<T>;
    args?: any;
    retries?: number;
  }): Promise<T> => {
    try {
      return await asyncFn(args);
    } catch (error) {
      if (retries > 0) {
        console.log("retry");
        return await fetchWithRetry({ asyncFn, args, retries: retries - 1 });
      } else {
        throw error;
      }
    }
  };

  return { fetchWithRetry };
};

export default useFetchWithRetry;
