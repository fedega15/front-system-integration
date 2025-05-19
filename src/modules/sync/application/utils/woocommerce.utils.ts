export const formatWooCommerceUrl = (url: string): string => {
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  if (baseUrl.includes('/wp-json/wc/v3')) {
    return baseUrl;
  }
  return `${baseUrl}/wp-json/wc/v3`;
}; 