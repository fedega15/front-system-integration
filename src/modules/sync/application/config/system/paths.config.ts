import * as path from 'path';

export const SystemPaths = {
  TEMP_DIR: path.join(process.cwd(), 'temp'),
  API_PATHS: {
    WOOCOMMERCE: '/wp-json/wc/v3'
  }
} as const; 