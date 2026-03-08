import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MONETAG_CONFIG, isMontagConfigured } from '../config/monetag';

// =====================================================
// MONETAG BANNER AD COMPONENT
// =====================================================
interface BannerAdProps {
  placement: 'top' | 'middle' | 'footer';
  className?: string;
}

export const MontagBannerAd: React.FC<BannerAdProps> = ({ placement, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const getZoneId = () => {
    switch (placement) {
      case 'top':
        return MONETAG_CONFIG.zones.topBanner;
      case 'middle':
        return MONETAG_CONFIG.zones.middleBanner;
      case 'footer':
        return MONETAG_CONFIG.zones.footerBanner;
      default:
        return MONETAG_CONFIG.zones.middleBanner;
    }
  };

  useEffect(() => {
    if (!MONETAG_CONFIG.settings.enableBannerAds || !isMontagConfigured()) {
      return;
    }

    const zoneId = getZoneId();
    
    // Load Monetag banner ad
    const loadAd = () => {
      if (containerRef.current && typeof window !== 'undefined') {
        try {
          // Create ad container
          const adScript = document.createElement('script');
          adScript.async = true;
          adScript.setAttribute('data-cfasync', 'false');
          adScript.src = `//thubanoa.com/1?z=${zoneId}`;
          
          containerRef.current.appendChild(adScript);
          setIsLoaded(true);
        } catch (error) {
          console.log('Monetag banner ad not loaded:', error);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);
    
    return () => clearTimeout(timer);
  }, [placement]);

  if (!MONETAG_CONFIG.settings.enableBannerAds) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`monetag-banner monetag-${placement} min-h-[50px] flex items-center justify-center ${className}`}
    >
      {!isLoaded && !isMontagConfigured() && (
        <div className="bg-gray-800/50 rounded-lg p-2 text-center w-full">
          <p className="text-gray-500 text-xs">Ad Space - {placement}</p>
        </div>
      )}
    </div>
  );
};

// =====================================================
// MONETAG REWARDED AD COMPONENT (Watch to Earn)
// =====================================================
interface RewardedAdProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onError?: (error: string) => void;
  rewardText?: string;
}

export const MontagRewardedAd: React.FC<RewardedAdProps> = ({
  isOpen,
  onClose,
  onComplete,
  onError,
  rewardText = '1 extra spin'
}) => {
  const [isWatching, setIsWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && !isWatching) {
      // Check if Monetag is configured
      if (isMontagConfigured()) {
        setAdLoaded(true);
      } else {
        // Demo mode - simulate ad loading
        setTimeout(() => setAdLoaded(true), 500);
      }
    }
  }, [isOpen, isWatching]);

  const handleWatchAd = async () => {
    if (isWatching) return;
    
    setIsWatching(true);
    setProgress(0);

    try {
      if (isMontagConfigured()) {
        // Trigger Monetag rewarded ad
        // @ts-ignore
        if (window.monetag && window.monetag.showRewarded) {
          // @ts-ignore
          await window.monetag.showRewarded(MONETAG_CONFIG.zones.rewarded);
          onComplete();
        } else {
          // Fallback to simulated ad
          await simulateAdWatch();
        }
      } else {
        // Demo mode - simulate watching ad
        await simulateAdWatch();
      }
    } catch (error) {
      onError?.('Ad failed to load. Please try again.');
      setIsWatching(false);
    }
  };

  const simulateAdWatch = async () => {
    const duration = MONETAG_CONFIG.settings.rewardedAdDuration;
    const interval = 100;
    const steps = duration / interval;
    
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      setProgress(Math.round((i / steps) * 100));
    }
    
    setIsWatching(false);
    setProgress(0);
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-yellow-500/30"
        >
          {isWatching ? (
            <div className="text-center">
              <motion.div 
                className="text-5xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🎬
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Watching Ad...</h3>
              
              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              <p className="text-gray-400 text-sm">{progress}% complete</p>
              <p className="text-yellow-400 text-xs mt-2">
                Don't close - watch full ad to earn reward!
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">📺</div>
              <h3 className="text-xl font-bold text-white mb-2">Message from our Sponsor</h3>
              <p className="text-gray-400 mb-4">
                Watch a short video ad to earn {rewardText}!
              </p>
              
              {adLoaded ? (
                <>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWatchAd}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-lg shadow-lg mb-3"
                  >
                    🎬 Watch Ad Now
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="text-gray-500 text-sm hover:text-gray-400"
                  >
                    Skip for now
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full"
                  />
                  <span className="ml-3 text-gray-400">Loading ad...</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// =====================================================
// MONETAG IN-PAGE PUSH INITIALIZER
// =====================================================
export const initInPagePush = () => {
  if (!MONETAG_CONFIG.settings.enableInPagePush || !isMontagConfigured()) {
    return;
  }

  const delay = MONETAG_CONFIG.settings.inPagePushDelay;
  
  setTimeout(() => {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = `//thubanoa.com/pfe/current/tag.min.js?z=${MONETAG_CONFIG.zones.inPagePush}`;
      document.head.appendChild(script);
    } catch (error) {
      console.log('In-page push not loaded:', error);
    }
  }, delay);
};

// =====================================================
// MONETAG POPUNDER HANDLER
// =====================================================
let popunderCount = 0;
let lastPopunderTime = 0;

export const triggerPopunder = () => {
  if (!MONETAG_CONFIG.settings.enablePopunder || !isMontagConfigured()) {
    return false;
  }

  const now = Date.now();
  const cooldown = MONETAG_CONFIG.settings.popunderCooldown;
  const maxPerSession = MONETAG_CONFIG.settings.popunderMaxPerSession;

  // Check cooldown and session limit
  if (now - lastPopunderTime < cooldown || popunderCount >= maxPerSession) {
    return false;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = `//thubanoa.com/4/${MONETAG_CONFIG.zones.popunder}`;
    document.head.appendChild(script);
    
    popunderCount++;
    lastPopunderTime = now;
    return true;
  } catch (error) {
    console.log('Popunder not triggered:', error);
    return false;
  }
};

// =====================================================
// AD CONSENT COMPONENT (REQUIRED TO USE APP)
// =====================================================
interface AdConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const AdConsent: React.FC<AdConsentProps> = ({ onAccept }) => {
  const [showDeclineWarning, setShowDeclineWarning] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('spin9ja_ad_consent', 'true');
    onAccept();
  };

  const handleDeclineClick = () => {
    setShowDeclineWarning(true);
  };

  const handleConfirmDecline = () => {
    // Show warning but don't actually allow declining
    // They must accept to use the app
    setShowDeclineWarning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-yellow-500/30"
      >
        {showDeclineWarning ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-white mb-2">Ads Are Required</h3>
            <p className="text-gray-400 text-sm mb-4">
              Spin9ja is a free reward platform. Ads help us pay for your earnings and keep the app running.
            </p>
            <p className="text-red-400 text-sm mb-4 font-semibold">
              Without ads, we cannot give you coins, spins, or rewards.
            </p>
            <p className="text-yellow-400 text-sm mb-6">
              Please accept ads to continue using Spin9ja and earn rewards!
            </p>
            <button
              onClick={handleConfirmDecline}
              className="w-full py-3 bg-gray-700 rounded-xl text-gray-300 text-sm font-semibold mb-3"
            >
              Go Back
            </button>
            <button
              onClick={handleAccept}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-bold text-lg shadow-lg"
            >
              ✅ Accept Ads & Continue
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">📺</div>
            <h3 className="text-xl font-bold text-white mb-2">Welcome to Spin9ja!</h3>
            <p className="text-gray-400 text-sm mb-4">
              We use ads to keep Spin9ja 100% free and pay for your rewards.
            </p>
            
            <div className="bg-gray-800/50 rounded-xl p-4 mb-4 text-left">
              <p className="text-yellow-400 font-semibold mb-2">By accepting, you get:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>✓ 100 coins signup bonus</li>
                <li>✓ 5 free daily spins</li>
                <li>✓ Daily check-in rewards up to 9,000 coins</li>
                <li>✓ 200 coins for every friend you refer</li>
              </ul>
            </div>
            
            <p className="text-gray-500 text-xs mb-4">
              Ads are short and help fund your earnings. You'll watch quick ads to earn spins and bonuses.
            </p>
            
            <button
              onClick={handleAccept}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-bold text-lg shadow-lg mb-3"
            >
              ✅ Accept & Start Earning
            </button>
            <button
              onClick={handleDeclineClick}
              className="text-gray-500 text-sm hover:text-gray-400"
            >
              What if I decline?
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// =====================================================
// ADS BLOCKED SCREEN (When user declines or blocks ads)
// =====================================================
export const AdsBlockedScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="text-2xl font-bold text-white mb-2">Ads Required</h2>
      <p className="text-gray-400 mb-4 max-w-sm">
        Spin9ja uses ads to pay for your rewards. Without ads, we cannot give you coins or let you withdraw.
      </p>
      <p className="text-yellow-400 mb-6 text-sm">
        Please accept ads or disable your ad blocker to continue.
      </p>
      <button
        onClick={onRetry}
        className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-bold text-lg shadow-lg"
      >
        Accept Ads & Continue
      </button>
    </div>
  );
};

// =====================================================
// INITIALIZE ALL MONETAG ADS
// =====================================================
export const initializeMonetag = () => {
  // Check consent first
  const consent = localStorage.getItem('spin9ja_ad_consent');
  if (consent !== 'true') {
    return;
  }

  // Initialize in-page push
  initInPagePush();

  // Add main Monetag script
  if (isMontagConfigured()) {
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = `//thubanoa.com/1?z=${MONETAG_CONFIG.publisherId}`;
    document.head.appendChild(script);
  }
};
