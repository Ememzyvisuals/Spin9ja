import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Users, Gift, Zap, Coins } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useGameStore } from '../store/gameStore';
import { sounds } from '../utils/sounds';
import { TermsPage } from './TermsPage';

export function AuthPage() {
  const { signUp, signIn, isLoading, error, clearError } = useGameStore();
  const [showTerms, setShowTerms] = useState<'terms' | 'privacy' | null>(null);
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    referralCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    sounds.click();

    if (isSignUp) {
      await signUp(formData.email, formData.password, formData.username, formData.referralCode);
    } else {
      await signIn(formData.email, formData.password);
    }
  };

  const features = [
    { icon: Gift, text: '100 coins signup bonus', color: 'text-emerald-400' },
    { icon: Zap, text: '5 free daily spins', color: 'text-amber-400' },
    { icon: Coins, text: 'Win 50-500 coins per spin', color: 'text-purple-400' },
    { icon: Users, text: 'Refer & earn 200 coins', color: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <Logo size="xl" />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm"
        >
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-3">
              <feature.icon size={18} className={feature.color} />
              <span className="text-xs text-slate-300">{feature.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4"
        >
          {/* Tabs */}
          <div className="flex bg-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setIsSignUp(true); clearError(); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                isSignUp ? 'bg-emerald-500 text-white' : 'text-slate-400'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(false); clearError(); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                !isSignUp ? 'bg-emerald-500 text-white' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username (Sign Up only) */}
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-12 pr-4"
                    required={isSignUp}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-12 pr-4"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Referral Code (Sign Up only) */}
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="relative">
                  <Users size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Referral code (optional)"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                    className="w-full pl-12 pr-4"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </motion.button>

          {/* Terms */}
          {isSignUp && (
            <p className="text-xs text-slate-500 text-center">
              By signing up, you agree to our{' '}
              <button 
                type="button"
                onClick={() => setShowTerms('terms')}
                className="text-emerald-400 underline"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                type="button"
                onClick={() => setShowTerms('privacy')}
                className="text-emerald-400 underline"
              >
                Privacy Policy
              </button>
            </p>
          )}
        </motion.form>

        {/* Links */}
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={() => setShowTerms('terms')}
            className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            Terms & Conditions
          </button>
          <span className="text-slate-700">•</span>
          <button 
            onClick={() => setShowTerms('privacy')}
            className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-slate-600">© 2025 Spin9ja. All rights reserved.</p>
      </div>

      {/* Terms/Privacy Modal */}
      <AnimatePresence>
        {showTerms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-900"
          >
            <TermsPage type={showTerms} onBack={() => setShowTerms(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
