import { Bell, Settings, Crown } from 'lucide-react';
import { Logo } from './Logo';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export function Header() {
  const { user, settings } = useGameStore();

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-800/50 safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Logo size="sm" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Coin balance */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-full px-3 py-1.5"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-900">₦</span>
            </div>
            <span className="text-sm font-bold text-amber-400">
              {(Number(user?.coins) || 0).toLocaleString()}
            </span>
          </motion.div>

          {/* Premium badge */}
          {user?.is_premium && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
              <Crown size={12} />
              <span>PRO</span>
            </div>
          )}

          {/* Telegram link */}
          {settings?.telegramLink && (
            <a
              href={settings.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
            </a>
          )}

          {/* Settings (if admin) */}
          {user?.is_admin && (
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
