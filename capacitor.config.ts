import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pharmacy.santonino',
  appName: 'Pharmacy Santo Niño',
  webDir: 'dist',
  server: {
    // Allow cleartext HTTP to reach the local backend API at 10.0.2.2
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
