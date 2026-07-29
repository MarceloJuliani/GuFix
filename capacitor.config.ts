import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.gufix.app',
  appName: 'GuFix',
  webDir: 'dist',
  android: {
    backgroundColor: '#06131d',
  },
  ios: {
    backgroundColor: '#06131d',
    contentInset: 'automatic',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
