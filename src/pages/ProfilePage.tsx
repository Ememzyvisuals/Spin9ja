import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Crown, Settings, LogOut, Wifi, Phone, Volume2, VolumeX, FileText, Shield, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { NETWORK_PROVIDERS } from '../config/supabase';
import { sounds } from '../utils/sounds';
import { TermsPage } from './TermsPage';

export function ProfilePage() {
  const [showTerms, setShowTerms] = useState<'terms' | 'privacy' | null>(null);
  const { user, signOut, requestData } = useGameStore();
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const [showDataModal, setShowDataModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [networkProvider, setNetworkProvider] = useState(user?.network_provider || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleSound = () => {
    const newState = sounds.toggle();
    setSoundEnabled(newState);
  };

  const handleDataRequest = async () => {
    if (!phoneNumber || phoneNumber.length !== 11) {
      setMessage({ type: 'error', text: 'Enter a valid 11-digit phone number' });
      return;
    }

    if (!networkProvider) {
      setMessage({ type: 'error', text: 'Select a network provider' });
      return;
    }

    setIsLoading(true);
    const success = await requestData(phoneNumber, networkProvider);
    setIsLoading(false);

    if (success) {
      setMessage({ type: 'success', text: 'Data request submitted!' });
      sounds.success();
      setShowDataModal(false);
    } else {
      setMessage({ type: 'error', text: 'Failed to submit request' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const canRequestData = () => {
    if (!user?.last_data_request) return true;
    const lastRequest = new Date(user.last_data_request).getTime();
    const daysSince = (Date.now() - lastRequest) / (1000 * 60 * 60 * 24);
    return daysSince >= 7;
  };

  const daysUntilDataRequest = () => {
    if (!user?.last_data_request) return 0;
    const lastRequest = new Date(user.last_data_request).getTime();
    const daysSince = (Date.now() - lastRequest) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(7 - daysSince));
  };

  const handleSignOut = () => {
    sounds.click();
    signOut();
  };

  return (
    <div className="pb-24 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated p-6 mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">@{user?.username}</h2>
              {user?.is_premium && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown size={10} /> PRO
                </span>
              )}
              {user?.is_admin && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">₦{(Number(user?.coins) || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500">Balance</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-400">{Number(user?.referral_count) || 0}</p>
            <p className="text-xs text-slate-500">Referrals</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{Number(user?.check_in_day) || 0}</p>
            <p className="text-xs text-slate-500">Check-ins</p>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-4 rounded-xl ${
              message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Request */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Wifi size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Request 100MB Data</h3>
              <p className="text-xs text-slate-400">Free data weekly</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDataModal(true)}
            disabled={!canRequestData()}
            className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              canRequestData()
                ? 'bg-purple-500 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {canRequestData() ? 'Request' : `${daysUntilDataRequest()}d left`}
          </motion.button>
        </div>
      </motion.div>

      {/* Settings */}
      <div className="space-y-2">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleSound}
          className="w-full card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={20} className="text-emerald-400" /> : <VolumeX size={20} className="text-slate-400" />}
            <span className="text-white">Sound Effects</span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: soundEnabled ? 26 : 2, y: 2 }}
            />
          </div>
        </motion.button>

        <motion.button
          onClick={() => setShowTerms('terms')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full card p-4 flex items-center gap-3"
        >
          <FileText size={20} className="text-blue-400" />
          <span className="text-white">Terms & Conditions</span>
        </motion.button>

        <motion.button
          onClick={() => setShowTerms('privacy')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full card p-4 flex items-center gap-3"
        >
          <Shield size={20} className="text-green-400" />
          <span className="text-white">Privacy Policy</span>
        </motion.button>

        {user?.is_admin && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full card p-4 flex items-center gap-3 border border-red-500/30"
          >
            <Settings size={20} className="text-red-400" />
            <span className="text-red-400">Admin Dashboard</span>
          </motion.button>
        )}

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          onClick={handleSignOut}
          className="w-full card p-4 flex items-center gap-3"
        >
          <LogOut size={20} className="text-red-400" />
          <span className="text-red-400">Sign Out</span>
        </motion.button>
      </div>

      {/* Data Request Modal */}
      <AnimatePresence>
        {showDataModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDataModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Request 100MB Data</h3>
                <button onClick={() => setShowDataModal(false)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-4">
                Enter your phone number and select your network provider.
              </p>

              {/* Phone Number */}
              <div className="relative mb-4">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full pl-12"
                />
              </div>

              {/* Network Provider */}
              <p className="text-sm text-slate-400 mb-2">Select Network:</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {NETWORK_PROVIDERS.map((network) => (
                  <motion.button
                    key={network.code}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNetworkProvider(network.code)}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                      networkProvider === network.code
                        ? 'ring-2 ring-white'
                        : ''
                    }`}
                    style={{ backgroundColor: network.color, color: network.textColor }}
                  >
                    <span className="text-lg font-bold">{network.logo}</span>
                    <span>{network.name}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDataRequest}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Request Data'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms/Privacy Modal */}
      <AnimatePresence>
        {showTerms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <TermsPage type={showTerms} onBack={() => setShowTerms(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
