import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Share2, Crown, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { sounds } from '../utils/sounds';

export function ReferralPage() {
  const { user, settings, leaderboard } = useGameStore();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referral_code || '------';
  const referralLink = `https://spin9ja.com/r/${referralCode}`;
  const referralCount = Number(user?.referral_count) || 0;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    sounds.click();
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    sounds.click();
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `🎰 Join Spin9ja and earn money! Use my code: ${referralCode}\n\n✨ Get 100 coins signup bonus\n🎁 Win 50-500 coins per spin\n💰 Withdraw to your bank\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    sounds.click();
  };

  const progress = (referralCount / settings.minReferrals) * 100;

  return (
    <div className="pb-24 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Refer & Earn</h1>

      {/* Earnings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated p-6 mb-6"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Users size={40} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-center text-2xl font-bold text-white mb-2">
          {settings.coinsPerReferral} Coins Per Referral!
        </h2>
        <p className="text-center text-slate-400 text-sm mb-4">
          + {settings.premiumReferralBonus} bonus when they go Premium
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{referralCount}</p>
            <p className="text-xs text-slate-400">Total Referrals</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">
              ₦{(referralCount * settings.coinsPerReferral).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">Total Earned</p>
          </div>
        </div>

        {/* Progress to withdrawal */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress to Withdraw</span>
            <span className="text-sm font-medium text-white">{referralCount}/{settings.minReferrals}</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {referralCount >= settings.minReferrals 
              ? '✓ You can now withdraw!' 
              : `${settings.minReferrals - referralCount} more referrals needed`}
          </p>
        </div>
      </motion.div>

      {/* Referral Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4 mb-4"
      >
        <p className="text-sm text-slate-400 mb-2">Your Referral Code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-800 rounded-xl p-4">
            <code className="text-2xl font-mono font-bold text-emerald-400">{referralCode}</code>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyCode}
            className="p-4 rounded-xl bg-emerald-500/20 text-emerald-400"
          >
            {copied ? <Check size={24} /> : <Copy size={24} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Share Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={shareOnWhatsApp}
          className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-500/20 text-green-400"
        >
          <Share2 size={20} />
          <span className="font-medium">WhatsApp</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={copyLink}
          className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500/20 text-blue-400"
        >
          <Copy size={20} />
          <span className="font-medium">Copy Link</span>
        </motion.button>
      </div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-4 mb-6"
      >
        <h3 className="font-semibold text-white mb-4">How it Works</h3>
        <div className="space-y-3">
          {[
            { step: 1, text: 'Share your referral code with friends' },
            { step: 2, text: 'They sign up using your code' },
            { step: 3, text: `You get ${settings.coinsPerReferral} coins instantly!` },
            { step: 4, text: `+${settings.premiumReferralBonus} more if they go Premium` },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                {item.step}
              </div>
              <p className="text-sm text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-amber-400" />
          <h3 className="font-semibold text-white">Top Referrers</h3>
        </div>

        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((leader, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                i === 0 ? 'bg-amber-500/20' : 'bg-slate-800/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                i === 0 ? 'bg-amber-500 text-slate-900' :
                i === 1 ? 'bg-slate-400 text-slate-900' :
                i === 2 ? 'bg-amber-700 text-white' :
                'bg-slate-700 text-slate-400'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">@{leader.username}</p>
              </div>
              <div className="flex items-center gap-1">
                {leader.is_premium && <Crown size={14} className="text-amber-400" />}
                <span className="text-emerald-400 font-semibold">
                  {Number(leader.referral_count) || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
