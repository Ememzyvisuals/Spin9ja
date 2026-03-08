// ============================================
// MONETAG AD CONFIGURATION
// ============================================
// Replace the placeholder Zone IDs with your actual Zone IDs from Monetag dashboard
// See MONETAG_SETUP.md for step-by-step instructions
// ============================================

export const MONETAG_CONFIG = {
  // ============================================
  // YOUR ZONE IDs - REPLACE THESE!
  // ============================================
  // Go to Monetag Dashboard → Sites → Your Site → Zones
  // Copy each Zone ID and paste below
  
  zones: {
    // POPUNDER ZONE ID
    // Creates a new tab with ad when user clicks
    // Highest revenue ad type
    popunder: '10700245',
    
    // IN-PAGE PUSH ZONE ID  
    // Small notification popup inside the page
    // Shows after 5 seconds
    inPagePush: '10700246',
    
    // BANNER ZONE IDs
    // Display ads in different positions
    topBanner: '10700248',
    middleBanner: '10700249',
    footerBanner: '10700250',
    
    // REWARDED/INTERSTITIAL ZONE ID
    // Full-screen ad user watches for rewards
    rewarded: '10700245',
  },
  
  // ============================================
  // AD SETTINGS
  // ============================================
  // Customize ad behavior
  
  settings: {
    // Enable/Disable ad types
    enableBannerAds: true,
    enableInPagePush: true,
    enablePopunder: true,
    enableRewardedAds: true,
    
    // Popunder Settings
    popunderCooldown: 3600000,    // 1 hour between popunders (in milliseconds)
    popunderMaxPerSession: 3,     // Max popunders per user session
    
    // In-Page Push Settings
    inPagePushDelay: 5000,        // Delay before showing (5 seconds)
    
    // Rewarded Ad Settings
    rewardedAdDuration: 10000,    // How long user watches ad (10 seconds)
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if Monetag is properly configured
 */
export const isMonetadConfigured = (): boolean => {
  const { popunder, inPagePush } = MONETAG_CONFIG.zones;
  
  // Check if Zone IDs have been replaced from placeholders
  const isConfigured = 
    popunder !== 'YOUR_POPUNDER_ZONE_ID' && 
    popunder !== '' &&
    inPagePush !== 'YOUR_INPAGE_PUSH_ZONE_ID' && 
    inPagePush !== '';
  
  return isConfigured;
};

/**
 * Get Popunder script URL
 */
export const getPopunderScript = (): string => {
  return `https://vemtoutcheeg.com/401/${MONETAG_CONFIG.zones.popunder}`;
};

/**
 * Get In-Page Push script URL
 */
export const getInPagePushScript = (): string => {
  return `https://alwingulla.com/88/tag.min.js`;
};

/**
 * Trigger Popunder ad
 * Call this on user click events
 */
export const triggerPopunder = (): void => {
  if (!MONETAG_CONFIG.settings.enablePopunder) return;
  if (!isMonetadConfigured()) return;
  
  // Check cooldown
  const lastPopunder = localStorage.getItem('lastPopunder');
  const now = Date.now();
  
  if (lastPopunder && now - parseInt(lastPopunder) < MONETAG_CONFIG.settings.popunderCooldown) {
    return; // Still in cooldown
  }
  
  // Check max per session
  const sessionCount = parseInt(sessionStorage.getItem('popunderCount') || '0');
  if (sessionCount >= MONETAG_CONFIG.settings.popunderMaxPerSession) {
    return; // Max reached for this session
  }
  
  // Trigger the popunder
  try {
    // Monetag popunder is triggered automatically by their script
    // when user clicks, so we just need to track it
    localStorage.setItem('lastPopunder', now.toString());
    sessionStorage.setItem('popunderCount', (sessionCount + 1).toString());
  } catch (e) {
    console.error('Popunder error:', e);
  }
};

/**
 * Initialize In-Page Push
 * Call this on page load
 */
export const initInPagePush = (): void => {
  if (!MONETAG_CONFIG.settings.enableInPagePush) return;
  if (!isMonetadConfigured()) return;
  
  // In-Page Push is initialized automatically by the script in index.html
  // This function is for any additional setup if needed
  console.log('In-Page Push initialized');
};

// ============================================
// EXAMPLE ZONE IDS (DELETE AFTER ADDING YOURS)
// ============================================
/*
Example of what your config should look like after adding Zone IDs:

export const MONETAG_CONFIG = {
  zones: {
    popunder: '5123456',
    inPagePush: '5234567',
    topBanner: '5345678',
    middleBanner: '5456789',
    footerBanner: '5567890',
    rewarded: '5678901',
  },
  // ... rest of config
};
*/
