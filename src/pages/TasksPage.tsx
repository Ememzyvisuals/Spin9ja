import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, Wallet, Eye, Crown, ExternalLink, Copy, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { sounds } from '../utils/sounds';

export function TasksPage() {
  const { user, settings, redeemGiftCode } = useGameStore();
  const [giftCode, setGiftCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRedeemCode = async () => {
    if (!giftCode.trim()) return;
    
    setIsRedeeming(true);
    sounds.click();
    
    const result = await redeemGiftCode(giftCode);
    
    if (result) {
      setRedeemResult({ success: true, message: `Received ${result.value} ${result.type}!` });
      sounds.success();
      setGiftCode('');
    } else {
      setRedeemResult({ success: false, message: 'Invalid or expired code' });
      sounds.error();
    }
    
    setIsRedeeming(false);
    setTimeout(() => setRedeemResult(null), 3000);
  };

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      sounds.click();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stats = [
    { label: 'Balance', value: `₦${(Number(user?.coins) || 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-400' },
    { label: 'Total Earned', value: `₦${(Number(user?.total_coins_earned) || 0).toLocaleString()}`, icon: Crown, color: 'text-amber-400' },
    { label: 'Ads Watched', value: Number(user?.ads_watched) || 0, icon: Eye, color: 'text-blue-400' },
    { label: 'Referrals', value: Number(user?.referral_count) || 0, icon: Users, color: 'text-purple-400' },
  ];

  const tasks = [
    {
      title: 'Spin the Wheel',
      description: `Use all ${user?.is_premium ? settings.dailySpinsPremium : settings.dailySpinsFree} daily spins`,
      reward: '50-500 coins',
      icon: '🎰',
      action: 'Spin',
    },
    {
      title: 'Daily Check-In',
      description: 'Claim your daily bonus',
      reward: 'Up to 800 coins',
      icon: '📅',
      action: 'Check In',
    },
    {
      title: 'Refer Friends',
      description: `Earn ${settings.coinsPerReferral} coins per referral`,
      reward: `${settings.coinsPerReferral} coins`,
      icon: '👥',
      action: 'Share',
    },
    {
      title: 'Watch Ads',
      description: 'Watch 20 ads for 5 extra spins',
      reward: '5 bonus spins',
      icon: '📺',
      action: 'Watch',
    },
  ];

  return (
    <div className="pb-24 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Earn Coins</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Gift Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Gift size={20} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Redeem Gift Code</h3>
            <p className="text-xs text-slate-400">Enter a code to claim rewards</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRedeemCode}
            disabled={isRedeeming || !giftCode.trim()}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold rounded-xl disabled:opacity-50"
          >
            {isRedeeming ? '...' : 'Redeem'}
          </motion.button>
        </div>

        {redeemResult && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 text-sm ${redeemResult.success ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {redeemResult.message}
          </motion.p>
        )}
      </motion.div>

      {/* Referral Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Your Referral Code</h3>
              <p className="text-xs text-slate-400">Share to earn {settings.coinsPerReferral} coins</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-3">
          <code className="flex-1 text-lg font-mono font-bold text-emerald-400">
            {user?.referral_code || '------'}
          </code>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyReferralCode}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Tasks List */}
      <h2 className="text-lg font-semibold text-white mb-4">Ways to Earn</h2>
      <div className="space-y-3">
        {tasks.map((task, i) => (
          <motion.div
            key={task.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                {task.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{task.title}</h3>
                <p className="text-xs text-slate-400">{task.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-400">{task.reward}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Social Links */}
      <h2 className="text-lg font-semibold text-white mt-6 mb-4">Follow Us</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Telegram', icon: '📱', color: 'bg-blue-500/20 text-blue-400' },
          { name: 'WhatsApp', icon: '💬', color: 'bg-green-500/20 text-green-400' },
        ].map((social) => (
          <motion.button
            key={social.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl ${social.color}`}
          >
            <span className="text-xl">{social.icon}</span>
            <span className="font-medium">{social.name}</span>
            <ExternalLink size={16} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
