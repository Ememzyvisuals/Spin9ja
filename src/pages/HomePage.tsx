import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Gift, TrendingUp, Users, Wallet, Crown, X, Eye } from 'lucide-react';
import { SpinWheel } from '../components/SpinWheel';
import { useGameStore } from '../store/gameStore';
import { DAILY_CHECKIN_REWARDS } from '../config/supabase';
import { sounds } from '../utils/sounds';

export function HomePage() {
  const { user, settings, claimDailyCheckIn, incrementAdsWatched } = useGameStore();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [pendingAction, setPendingAction] = useState<'spin' | 'checkin' | null>(null);
  const [checkInResult, setCheckInResult] = useState<{ coins: number; bonus: string | null } | null>(null);

  const checkInDay = Number(user?.check_in_day) || 0;
  const lastCheckIn = user?.last_check_in;
  const today = new Date().toISOString().split('T')[0];
  const canClaimToday = lastCheckIn !== today;
  const currentHour = new Date().getHours();
  const isLate = currentHour >= 12;

  const handleShowAd = (action: 'spin' | 'checkin' | null = null) => {
    setPendingAction(action);
    setShowAdModal(true);
    setAdProgress(0);
  };

  const handleWatchAd = async () => {
    setAdProgress(0);
    sounds.click();
    
    // Simulate ad watching - 10 seconds
    const totalTime = 10000; // 10 seconds
    const updateInterval = 100; // Update every 100ms
    const steps = totalTime / updateInterval;
    const increment = 100 / steps;
    
    const interval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, updateInterval);

    setTimeout(async () => {
      clearInterval(interval);
      setAdProgress(100);
      await incrementAdsWatched();
      sounds.adComplete();
      
      setTimeout(() => {
        setShowAdModal(false);
        setAdProgress(0);
        
        if (pendingAction === 'checkin') {
          performCheckIn();
        }
        setPendingAction(null);
      }, 500);
    }, totalTime);
  };

  const performCheckIn = async () => {
    const result = await claimDailyCheckIn();
    if (result) {
      setCheckInResult(result);
      sounds.checkIn();
      setTimeout(() => setCheckInResult(null), 3000);
    }
    setShowCheckIn(false);
  };

  const handleClaimCheckIn = () => {
    if (isLate) {
      handleShowAd('checkin');
    } else {
      performCheckIn();
    }
  };

  const coins = Number(user?.coins) || 0;
  const progress = Math.min((coins / settings.minWithdrawal) * 100, 100);

  return (
    <div className="pb-24 px-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Wallet size={16} className="text-emerald-400" />
            </div>
            <span className="text-xs text-slate-400">Balance</span>
          </div>
          <p className="text-xl font-bold text-white">₦{coins.toLocaleString()}</p>
          <div className="mt-2">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {progress.toFixed(0)}% to ₦{settings.minWithdrawal.toLocaleString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-400" />
            </div>
            <span className="text-xs text-slate-400">Total Earned</span>
          </div>
          <p className="text-xl font-bold text-white">
            ₦{(Number(user?.total_coins_earned) || 0).toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Check-In Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-elevated p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">Daily Check-In</p>
              <p className="text-sm text-slate-400">
                Day {checkInDay + 1}/30 • {DAILY_CHECKIN_REWARDS[checkInDay]?.coins || 0} coins
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => canClaimToday ? setShowCheckIn(true) : null}
            className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              canClaimToday
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {canClaimToday ? (isLate ? 'Watch Ad' : 'Claim') : 'Claimed'}
          </motion.button>
        </div>
      </motion.div>

      {/* Spin Wheel */}
      <SpinWheel onShowAd={() => handleShowAd('spin')} />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="card p-3 text-center">
          <Users size={18} className="mx-auto text-blue-400 mb-1" />
          <p className="text-lg font-bold text-white">{Number(user?.referral_count) || 0}</p>
          <p className="text-[10px] text-slate-500">Referrals</p>
        </div>
        <div className="card p-3 text-center">
          <Gift size={18} className="mx-auto text-green-400 mb-1" />
          <p className="text-lg font-bold text-white">{checkInDay}</p>
          <p className="text-[10px] text-slate-500">Check-Ins</p>
        </div>
        <div className="card p-3 text-center">
          <Eye size={18} className="mx-auto text-orange-400 mb-1" />
          <p className="text-lg font-bold text-white">{Number(user?.ads_watched) || 0}</p>
          <p className="text-[10px] text-slate-500">Ads Watched</p>
        </div>
      </div>

      {/* Premium Banner */}
      {!user?.is_premium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 card-elevated p-4 border-amber-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
              <Crown size={24} className="text-slate-900" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-400">Go Premium</p>
              <p className="text-sm text-slate-400">
                {settings.dailySpinsPremium} spins/day • Required to withdraw
              </p>
            </div>
            <p className="text-lg font-bold text-amber-400">₦{settings.premiumPrice}</p>
          </div>
        </motion.div>
      )}

      {/* Check-In Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCheckIn(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Daily Check-In</h3>
                <button onClick={() => setShowCheckIn(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {isLate && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 mb-4">
                  <p className="text-sm text-amber-400">
                    ⚠️ It's past 12 PM! Watch an ad to claim your bonus.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2 mb-4">
                {DAILY_CHECKIN_REWARDS.slice(0, 30).map((reward, i) => {
                  const isClaimed = i < checkInDay;
                  const isCurrent = i === checkInDay;
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] p-1 ${
                        isClaimed
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : isCurrent
                          ? 'bg-purple-500/20 border-2 border-purple-500'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      <span className={isClaimed ? 'text-emerald-400' : isCurrent ? 'text-purple-400' : 'text-slate-500'}>
                        {i + 1}
                      </span>
                      {reward.coins > 0 && (
                        <span className={`font-bold ${isClaimed ? 'text-emerald-400' : 'text-white'}`}>
                          {reward.coins}
                        </span>
                      )}
                      {reward.bonus && (
                        <Gift size={10} className="text-amber-400" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-800 rounded-xl p-4 mb-4">
                <p className="text-center text-white font-semibold mb-1">
                  Day {checkInDay + 1} Reward
                </p>
                <p className="text-center text-2xl font-bold text-emerald-400">
                  {DAILY_CHECKIN_REWARDS[checkInDay]?.coins || 0} coins
                </p>
                {DAILY_CHECKIN_REWARDS[checkInDay]?.bonus && (
                  <p className="text-center text-sm text-amber-400 mt-1">
                    + {DAILY_CHECKIN_REWARDS[checkInDay].bonus}
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaimCheckIn}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600"
              >
                {isLate ? 'Watch Ad to Claim' : 'Claim Bonus'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Modal */}
      <AnimatePresence>
        {showAdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Eye size={32} className="text-slate-900" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Message from our Sponsor</h3>
              <p className="text-slate-400 text-sm mb-6">
                Watch a short ad to continue and support Spin9ja!
              </p>

              {adProgress > 0 && adProgress < 100 ? (
                <div className="mb-4">
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      animate={{ width: `${adProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    Watching... {Math.round(adProgress)}% ({Math.ceil((100 - adProgress) / 10)}s left)
                  </p>
                </div>
              ) : adProgress === 100 ? (
                <div className="mb-4">
                  <p className="text-emerald-400 font-semibold">✓ Ad Complete!</p>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWatchAd}
                  className="w-full py-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500"
                >
                  Watch Ad
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check-In Result Toast */}
      <AnimatePresence>
        {checkInResult && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 bg-emerald-500 text-white p-4 rounded-xl z-50 text-center"
          >
            <p className="font-bold text-lg">+{checkInResult.coins} coins!</p>
            {checkInResult.bonus && (
              <p className="text-sm opacity-90">+ {checkInResult.bonus}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
