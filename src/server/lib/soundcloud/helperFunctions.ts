// https://stackoverflow.com/questions/9096120/how-to-get-thumbnail-of-soundcloud-using-api
const buildUrlVariants = (url: string): string[] => {
  if (!url) return [];

  return [
    url.replace("-large", "-t500x500"),
    url.replace("-large", "-original"),
  ];
};

const verifyArtworkUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const getBestArtworkUrl = async (url: string): Promise<string> => {
  const originalUrl = url;
  const urlVariants = buildUrlVariants(url);

  for (const url of urlVariants) {
    if (await verifyArtworkUrl(url)) {
      return url;
    }
  }

  return originalUrl;
};
