export class TextUtils {
  static formatText(template: string, data: Record<string, any>): string {
    return template.replace(/{(\w+)}/g, (match, key) => data[key] || match);
  }

  static formatSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  static formatWooCommerceUrl(url: string): string {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    if (baseUrl.includes('/wp-json/wc/v3')) {
      return baseUrl;
    }
    
    return `${baseUrl}/wp-json/wc/v3`;
  }
} 