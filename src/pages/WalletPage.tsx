import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Crown, AlertCircle, Check, Building, User, CreditCard, Send, ChevronDown, Zap, Clock, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { FINTECH_BANKS, PREMIUM_PAYMENT } from '../config/supabase';
import { sounds } from '../utils/sounds';

export function WalletPage() {
  const { user, settings, saveBankDetails, requestWithdrawal, requestPremium } = useGameStore();
  const [activeSection, setActiveSection] = useState<'withdraw' | 'premium'>('withdraw');
  const [bankName, setBankName] = useState(user?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(user?.account_number || '');
  const [accountName, setAccountName] = useState(user?.account_name || '');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const coins = Number(user?.coins) || 0;
  const referralCount = Number(user?.referral_count) || 0;
  const progress = Math.min((coins / settings.minWithdrawal) * 100, 100);

  // Basic requirements (excluding premium check)
  const meetsBasicRequirements = 
    settings.withdrawalOpen &&
    coins >= settings.minWithdrawal &&
    referralCount >= settings.minReferrals &&
    user?.bank_name &&
    user?.account_number &&
    user?.account_name;

  // Full withdrawal requirements including premium (used for reference)
  const _canWithdraw = meetsBasicRequirements && user?.is_premium;
  void _canWithdraw; // Suppress unused warning

  const handleSaveBank = async () => {
    if (!bankName || !accountNumber || !accountName) {
      setMessage({ type: 'error', text: 'Please fill all bank details' });
      return;
    }

    if (accountNumber.length !== 10) {
      setMessage({ type: 'error', text: 'Account number must be 10 digits' });
      return;
    }

    setIsLoading(true);
    const success = await saveBankDetails(bankName, accountNumber, accountName);
    setIsLoading(false);

    if (success) {
      setMessage({ type: 'success', text: 'Bank details saved!' });
      sounds.success();
    } else {
      setMessage({ type: 'error', text: 'Failed to save bank details' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  // Handle withdraw button click - shows modal if not premium
  const handleWithdrawClick = () => {
    const amount = parseInt(withdrawAmount);
    
    if (!amount || amount < settings.minWithdrawal) {
      setMessage({ type: 'error', text: `Minimum withdrawal is ₦${settings.minWithdrawal.toLocaleString()}` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (amount > coins) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!meetsBasicRequirements) {
      setMessage({ type: 'error', text: 'Please complete all requirements first' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // If user is premium, process directly
    if (user?.is_premium) {
      processWithdrawal(amount);
    } else {
      // Show modal for non-premium users
      setShowWithdrawModal(true);
    }
  };

  // Process withdrawal (called directly for premium, or from modal for non-premium)
  const processWithdrawal = async (amount: number, isFreeWithdrawal: boolean = false) => {
    setIsLoading(true);
    const success = await requestWithdrawal(amount, isFreeWithdrawal);
    setIsLoading(false);
    setShowWithdrawModal(false);

    if (success) {
      if (user?.is_premium) {
        setMessage({ type: 'success', text: '✓ Withdrawal request submitted! Priority processing enabled.' });
      } else {
        setMessage({ type: 'success', text: '✓ Withdrawal request submitted! Delivery may take several months.' });
      }
      setWithdrawAmount('');
      sounds.success();
    } else {
      setMessage({ type: 'error', text: 'Failed to request withdrawal' });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const handlePremiumRequest = async () => {
    if (user?.premium_pending) {
      setMessage({ type: 'error', text: 'You already have a pending premium request.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (user?.is_premium) {
      setMessage({ type: 'error', text: 'You are already a premium member!' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const success = await requestPremium('pending_receipt');
      setIsLoading(false);

      if (success) {
        setMessage({ type: 'success', text: '✓ Premium request submitted! Admin will verify your payment.' });
        sounds.success();
      } else {
        setMessage({ type: 'error', text: 'Failed to submit request. Please try again.' });
      }
    } catch (error) {
      console.error('Premium request error:', error);
      setIsLoading(false);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  // Go to premium section from modal
  const goToPremium = () => {
    setShowWithdrawModal(false);
    setActiveSection('premium');
  };

  return (
    <div className="pb-24 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Wallet</h1>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm">Available Balance</p>
            <p className="text-3xl font-bold text-white">₦{coins.toLocaleString()}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Wallet size={28} className="text-white" />
          </div>
        </div>

        {/* Progress to withdrawal */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Withdrawal Goal</span>
            <span className="text-white font-medium">₦{settings.minWithdrawal.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{progress.toFixed(0)}% complete</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveSection('withdraw')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'withdraw' ? 'bg-emerald-500 text-white' : 'text-slate-400'
          }`}
        >
          Withdraw
        </button>
        <button
          onClick={() => setActiveSection('premium')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'premium' ? 'bg-amber-500 text-slate-900' : 'text-slate-400'
          }`}
        >
          Go Premium
        </button>
      </div>

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

      {activeSection === 'withdraw' ? (
        <div className="space-y-4">
          {/* Requirements */}
          <div className="card p-4">
            <h3 className="font-semibold text-white mb-3">Requirements</h3>
            <div className="space-y-2">
              {[
                { text: `Min ₦${settings.minWithdrawal.toLocaleString()} balance`, met: coins >= settings.minWithdrawal },
                { text: `${settings.minReferrals} referrals`, met: referralCount >= settings.minReferrals },
                { text: 'Bank details added', met: !!user?.bank_name },
              ].map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    req.met ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}>
                    {req.met ? <Check size={12} className="text-white" /> : null}
                  </div>
                  <span className={req.met ? 'text-slate-300' : 'text-slate-500'}>{req.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building size={20} className="text-blue-400" />
              <h3 className="font-semibold text-white">Bank Details</h3>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-400">
                ⚠️ Manual verification: Enter your bank name, account number, and account owner's full name. Admin will verify before processing.
              </p>
            </div>

            <div className="space-y-3">
              {/* Bank Selection */}
              <div className="relative">
                <div className="flex items-center gap-2 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <CreditCard size={18} />
                </div>
                <button
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className="w-full text-left pl-12 pr-10 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white"
                >
                  {bankName || 'Select Bank'}
                </button>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                
                {showBankDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto"
                  >
                    {FINTECH_BANKS.map((bank) => (
                      <button
                        key={bank.code}
                        onClick={() => { setBankName(bank.name); setShowBankDropdown(false); }}
                        className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors"
                      >
                        {bank.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Account Number */}
              <div className="relative">
                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Account Number (10 digits)"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-12"
                />
              </div>

              {/* Account Name */}
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Account Name (UPPERCASE)"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  className="w-full pl-12"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveBank}
                disabled={isLoading}
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Bank Details'}
              </motion.button>
            </div>
          </div>

          {/* Withdrawal Amount */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Send size={20} className="text-emerald-400" />
              <h3 className="font-semibold text-white">Request Withdrawal</h3>
            </div>

            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₦</span>
              <input
                type="number"
                placeholder={settings.minWithdrawal.toString()}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full pl-10 text-xl font-bold"
              />
            </div>

            {settings.withdrawalFee > 0 && (
              <p className="text-sm text-slate-400 mb-4">
                Fee: ₦{settings.withdrawalFee} • You'll receive: ₦{Math.max(0, (parseInt(withdrawAmount) || 0) - settings.withdrawalFee).toLocaleString()}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdrawClick}
              disabled={isLoading || !meetsBasicRequirements}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:from-slate-600 disabled:to-slate-700"
            >
              {isLoading ? 'Processing...' : meetsBasicRequirements ? 'Withdraw' : 'Complete Requirements First'}
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {user?.is_premium ? (
            <div className="card-elevated p-6 text-center border-amber-500/30">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                <Crown size={32} className="text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">You're Premium!</h3>
              <p className="text-slate-400 mb-4">Enjoy all premium benefits including fast withdrawals</p>
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2">
                  <Zap size={18} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Fast Withdrawal Enabled</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="card-elevated p-6 border-amber-500/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                    <Crown size={28} className="text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-400">Go Premium</h3>
                    <p className="text-3xl font-bold text-white">₦{settings.premiumPrice}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {[
                    `${settings.dailySpinsPremium} daily spins (vs ${settings.dailySpinsFree})`,
                    'Fast withdrawal delivery',
                    'Priority processing',
                    'Exclusive gift codes',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check size={16} className="text-amber-400" />
                      <span className="text-slate-300 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800 rounded-xl p-4 mb-4">
                  <p className="text-sm text-slate-400 mb-2">Transfer ₦{settings.premiumPrice} to:</p>
                  <div className="space-y-1">
                    <p className="text-white font-semibold">{PREMIUM_PAYMENT.bank}</p>
                    <p className="text-xl font-bold text-emerald-400">{PREMIUM_PAYMENT.accountNumber}</p>
                    <p className="text-slate-300">{PREMIUM_PAYMENT.accountName}</p>
                  </div>
                </div>

                {user?.premium_pending ? (
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 text-center">
                    <AlertCircle size={24} className="mx-auto text-amber-400 mb-2" />
                    <p className="text-amber-400 font-medium">Request Pending</p>
                    <p className="text-xs text-slate-400">Admin will verify your payment</p>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePremiumRequest}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold rounded-xl disabled:opacity-50"
                  >
                    {isLoading ? 'Submitting...' : 'I Have Paid - Request Premium'}
                  </motion.button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Withdrawal Options Modal (for non-premium users) */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.9)' }}
            className="flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Withdrawal Options</h2>
                <button onClick={() => setShowWithdrawModal(false)}>
                  <X size={24} className="text-slate-900" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Option 1: Premium */}
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                      <Zap size={20} className="text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-400">Option 1: Upgrade to Premium</h3>
                      <p className="text-xs text-slate-400">₦{settings.premiumPrice} one-time</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">
                    Upgrade to Premium to receive <span className="text-amber-400 font-semibold">fast withdrawal delivery</span> and <span className="text-amber-400 font-semibold">priority processing</span>.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToPremium}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold rounded-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Crown size={18} />
                      <span>Upgrade to Premium</span>
                    </div>
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-700"></div>
                  <span className="text-slate-500 text-sm">OR</span>
                  <div className="flex-1 h-px bg-slate-700"></div>
                </div>

                {/* Option 2: Free Withdrawal */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                      <Clock size={20} className="text-slate-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Option 2: Free Withdrawal</h3>
                      <p className="text-xs text-slate-400">Slower delivery</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    You can still withdraw without Premium, but delivery may take <span className="text-orange-400 font-semibold">several months</span> depending on continued activity on the platform.
                  </p>
                  
                  {/* Encouragement message */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-400">
                      💡 <strong>Tip:</strong> To speed up free withdrawals, keep referring new users and staying active on the platform!
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => processWithdrawal(parseInt(withdrawAmount), true)}
                    disabled={isLoading}
                    className="w-full py-3 bg-slate-600 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Continue with Free Withdrawal'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}