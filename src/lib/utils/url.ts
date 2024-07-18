/**
 * combines the given url with base url if there's any
 * @param baseUrl
 * @param url
 * @returns Full URL
 */
export function combineUrls(url: string, baseUrl?: string) {
  if (!baseUrl || isValidUrl(url)) return url;

  // Avoid double slash
  if (baseUrl.endsWith("/") && url.startsWith("/")) url = url.substring(1);
  // Avoid no slash between them
  else if (!baseUrl.endsWith("/") && !url.startsWith("/")) url = "/" + url;

  return baseUrl + url;
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}
