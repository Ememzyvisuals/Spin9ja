import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const Countdown = () => {
  const { user, settings } = useGameStore();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const maxSpins = user?.is_premium ? settings.dailySpinsPremium : settings.dailySpinsFree;
  const spinsLeft = maxSpins - (user?.spins_today || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Spins Reset In</p>
          <p className="text-2xl font-bold text-white font-mono">{timeLeft}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Spins Left</p>
          <p className="text-2xl font-bold text-green-400">{spinsLeft}/{maxSpins}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Countdown;
