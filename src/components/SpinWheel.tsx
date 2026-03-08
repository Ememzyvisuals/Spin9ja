import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Eye, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { SPIN_SEGMENTS } from '../config/supabase';
import { sounds } from '../utils/sounds';

interface SpinWheelProps {
  onShowAd: () => void;
}

export function SpinWheel({ onShowAd }: SpinWheelProps) {
  const { user, settings, spin, watchAdForExtraSpin } = useGameStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const maxSpins = user?.is_premium ? settings.dailySpinsPremium : settings.dailySpinsFree;
  const spinsUsed = Number(user?.spins_today) || 0;
  const bonusSpins = Number(user?.bonus_spins) || 0;
  const spinsLeft = maxSpins - spinsUsed + bonusSpins;

  // Extra spins from ads
  const extraSpinAdsWatched = Number(user?.extra_spin_ads_watched) || 0;
  const extraSpinsEarned = Math.floor(extraSpinAdsWatched / 4);
  const adsToNextSpin = 4 - (extraSpinAdsWatched % 4);

  const handleSpin = useCallback(async () => {
    if (isSpinning || spinsLeft <= 0) return;

    // Show ad every 2 spins
    const newSpinCount = spinCount + 1;
    setSpinCount(newSpinCount);
    
    if (newSpinCount > 1 && newSpinCount % 2 === 0) {
      onShowAd();
      return;
    }

    setIsSpinning(true);
    sounds.spinStart();

    try {
      const result = await spin();
      
      if (result > 0) {
        // Calculate winning segment index
        const segmentIndex = SPIN_SEGMENTS.findIndex(s => s.value === result);
        const segmentAngle = 360 / SPIN_SEGMENTS.length;
        const targetAngle = segmentIndex * segmentAngle + segmentAngle / 2;
        
        // Add multiple rotations + offset to land on segment
        const extraRotations = 5 + Math.floor(Math.random() * 3);
        const finalRotation = rotation + (extraRotations * 360) + (360 - targetAngle);
        
        setRotation(finalRotation);
        setLastWin(result);

        // Play tick sounds during spin
        const tickInterval = setInterval(() => sounds.tick(), 100);
        
        setTimeout(() => {
          clearInterval(tickInterval);
          sounds.spinEnd();
          
          // Show result
          setShowResult(true);
          
          // Confetti for wins
          if (result >= 100) {
            confetti({
              particleCount: result >= 200 ? 150 : 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#fbbf24', '#f59e0b'],
            });
          }

          if (result >= 200) {
            sounds.jackpot();
          } else {
            sounds.win();
          }

          // Hide result after 2 seconds
          setTimeout(() => setShowResult(false), 2000);
          setIsSpinning(false);
        }, 4000);
      } else {
        setIsSpinning(false);
      }
    } catch (error) {
      console.error('Spin error:', error);
      setIsSpinning(false);
    }
  }, [isSpinning, spinsLeft, spin, rotation, spinCount, onShowAd]);

  const handleWatchAdForSpin = async () => {
    if (extraSpinAdsWatched >= 20) return;
    
    onShowAd();
    const earnedSpin = await watchAdForExtraSpin();
    
    if (earnedSpin) {
      sounds.coin();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Spins remaining */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Spins Left</p>
          <p className="text-2xl font-bold text-white">
            {spinsLeft} <span className="text-slate-500 text-lg">/ {maxSpins + bonusSpins}</span>
          </p>
        </div>
      </div>

      {/* Wheel container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-emerald-500 drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="relative w-72 h-72 md:w-80 md:h-80"
          style={{ rotate: rotation }}
          transition={{
            duration: 4,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            <defs>
              <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.4"/>
              </filter>
            </defs>
            
            {/* Outer ring */}
            <circle cx="100" cy="100" r="98" fill="none" stroke="url(#goldRing)" strokeWidth="4" filter="url(#wheelShadow)" />
            <defs>
              <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Segments */}
            {SPIN_SEGMENTS.map((segment, i) => {
              const angle = (i * 45 - 90) * (Math.PI / 180);
              const nextAngle = ((i + 1) * 45 - 90) * (Math.PI / 180);
              const x1 = 100 + 90 * Math.cos(angle);
              const y1 = 100 + 90 * Math.sin(angle);
              const x2 = 100 + 90 * Math.cos(nextAngle);
              const y2 = 100 + 90 * Math.sin(nextAngle);
              
              // Text position
              const midAngle = ((i * 45 + 22.5 - 90) * Math.PI) / 180;
              const textX = 100 + 60 * Math.cos(midAngle);
              const textY = 100 + 60 * Math.sin(midAngle);
              const textRotation = i * 45 + 22.5;
              
              return (
                <g key={i}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            
            {/* Center */}
            <circle cx="100" cy="100" r="25" fill="url(#centerGradient)" stroke="#1e293b" strokeWidth="2" />
            <defs>
              <radialGradient id="centerGradient">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
            </defs>
            <text x="100" y="100" fill="#1e293b" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
              SPIN
            </text>
          </svg>
        </motion.div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-3xl -z-10" />
      </div>

      {/* Spin button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSpin}
        disabled={isSpinning || spinsLeft <= 0}
        className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
          isSpinning || spinsLeft <= 0
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
        }`}
      >
        {isSpinning ? (
          <>
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Spinning...</span>
          </>
        ) : spinsLeft <= 0 ? (
          <>
            <Zap size={24} />
            <span>No Spins Left</span>
          </>
        ) : (
          <>
            <Play size={24} fill="currentColor" />
            <span>SPIN NOW</span>
          </>
        )}
      </motion.button>

      {/* Extra spins via ads */}
      <div className="w-full max-w-sm card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-amber-400" />
            <span className="text-sm font-medium text-white">Watch Ads for Extra Spins</span>
          </div>
          <span className="text-xs text-slate-400">{extraSpinAdsWatched}/20</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${(extraSpinAdsWatched / 20) * 100}%` }}
          />
        </div>

        {/* Milestones */}
        <div className="flex justify-between mb-3">
          {[4, 8, 12, 16, 20].map((milestone) => (
            <div
              key={milestone}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                extraSpinAdsWatched >= milestone
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              <Gift size={14} />
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-3 text-center">
          {extraSpinAdsWatched >= 20
            ? 'All 5 spins earned! Resets in 24 hours.'
            : `${adsToNextSpin} more ad${adsToNextSpin > 1 ? 's' : ''} to earn 1 spin • ${5 - extraSpinsEarned} spins left`}
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleWatchAdForSpin}
          disabled={extraSpinAdsWatched >= 20}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            extraSpinAdsWatched >= 20
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900'
          }`}
        >
          {extraSpinAdsWatched >= 20 ? 'All Spins Earned!' : `Watch Ad (${20 - extraSpinAdsWatched} left)`}
        </motion.button>
      </div>

      {/* Win popup */}
      <AnimatePresence>
        {showResult && lastWin > 0 && (
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`px-8 py-6 rounded-3xl ${
              lastWin >= 200 
                ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
            } shadow-2xl`}>
              <p className="text-slate-900 text-center font-bold text-lg mb-1">
                {lastWin >= 200 ? '🎉 JACKPOT!' : '🎊 You Won!'}
              </p>
              <p className="text-4xl font-bold text-white text-center">
                +{lastWin} <span className="text-2xl">coins</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
