const ensureHttp = (url: string) => {
  if (!url) return "";

  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return "http://" + url;
  }

  return url;
};

export default ensureHttp;
