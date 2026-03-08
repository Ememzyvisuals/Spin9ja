// Monetag Configuration
// Get your Zone IDs from https://www.monetag.com after approval

export const MONETAG_CONFIG = {
  // Your Monetag Publisher ID
  publisherId: 'YOUR_PUBLISHER_ID',
  
  // Zone IDs for different ad types
  zones: {
    topBanner: 'YOUR_TOP_BANNER_ZONE_ID',
    middleBanner: 'YOUR_MIDDLE_BANNER_ZONE_ID',
    footerBanner: 'YOUR_FOOTER_BANNER_ZONE_ID',
    inPagePush: 'YOUR_INPAGE_PUSH_ZONE_ID',
    popunder: 'YOUR_POPUNDER_ZONE_ID',
    rewarded: 'YOUR_REWARDED_ZONE_ID',
  },
  
  // Ad behavior settings
  settings: {
    enableBannerAds: true,
    enableInPagePush: true,
    enablePopunder: true,
    enableRewardedAds: true,
    popunderCooldown: 3600000, // 1 hour between popunders
    popunderMaxPerSession: 2,
    inPagePushDelay: 5000, // Show in-page push after 5 seconds
    rewardedAdDuration: 3000, // 3 seconds to "watch" ad
  }
};

// Check if Monetag is configured
export const isMontagConfigured = () => {
  return MONETAG_CONFIG.publisherId !== 'YOUR_PUBLISHER_ID';
};

// Get last popunder timestamp
export const getLastPopunderTime = (): number => {
  const stored = localStorage.getItem('spin9ja_last_popunder');
  return stored ? parseInt(stored, 10) : 0;
};

// Set last popunder timestamp
export const setLastPopunderTime = (): void => {
  localStorage.setItem('spin9ja_last_popunder', Date.now().toString());
};

// Check if popunder is allowed
export const canShowPopunder = (): boolean => {
  const lastTime = getLastPopunderTime();
  const cooldown = MONETAG_CONFIG.settings.popunderCooldown;
  return Date.now() - lastTime > cooldown;
};

// Get session popunder count
export const getSessionPopunderCount = (): number => {
  const stored = sessionStorage.getItem('spin9ja_popunder_count');
  return stored ? parseInt(stored, 10) : 0;
};

// Increment session popunder count
export const incrementPopunderCount = (): void => {
  const count = getSessionPopunderCount();
  sessionStorage.setItem('spin9ja_popunder_count', (count + 1).toString());
};
