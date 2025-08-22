import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.potterytracker',
  appName: 'Pottery Tracker',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://a5ba3b3a-6fb9-4e59-bb28-92b0f9bf15e9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;