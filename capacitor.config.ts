import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.gufix.app',
  appName: 'GuFix',
  webDir: 'dist',
  android: {
    backgroundColor: '#0a0a0a',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
