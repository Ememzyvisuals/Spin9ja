import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Eye, Crown, Check, X, Phone, Wifi, Gift, Settings, ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { NETWORK_PROVIDERS } from '../config/supabase';

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const {
    adminStats,
    withdrawalRequests,
    premiumRequests,
    dataRequests,
    giftCodes,
    settings,
    loadAdminData,
    approveWithdrawal,
    rejectWithdrawal,
    approvePremium,
    rejectPremium,
    approveDataRequest,
    rejectDataRequest,
    createGiftCode,
    updateSettings,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('stats');
  const [newCode, setNewCode] = useState({ code: '', type: 'coins', value: 100, maxUses: 10 });
  const [localSettings, setLocalSettings] = useState({
    withdrawalOpen: settings.withdrawalOpen,
    withdrawalFee: settings.withdrawalFee,
    telegramLink: settings.telegramLink,
  });

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleCreateCode = async () => {
    if (!newCode.code) return;
    await createGiftCode(newCode.code, newCode.type, newCode.value, newCode.maxUses);
    setNewCode({ code: '', type: 'coins', value: 100, maxUses: 10 });
  };

  const handleSaveSettings = async () => {
    await updateSettings({
      withdrawalOpen: localSettings.withdrawalOpen,
      withdrawalFee: localSettings.withdrawalFee,
      telegramLink: localSettings.telegramLink,
    });
  };

  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending');
  const pendingPremium = premiumRequests.filter(p => p.status === 'pending');
  const pendingData = dataRequests.filter(d => d.status === 'pending');

  const tabs = [
    { id: 'stats', label: 'Stats', icon: Eye },
    { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})`, icon: Wallet },
    { id: 'premium', label: `Premium (${pendingPremium.length})`, icon: Crown },
    { id: 'data', label: `Data (${pendingData.length})`, icon: Wifi },
    { id: 'codes', label: 'Gift Codes', icon: Gift },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="pb-24 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-white" />
        </motion.button>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <tab.icon size={16} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Users', value: adminStats.totalUsers, color: 'text-blue-400' },
            { label: 'Total Coins', value: `₦${adminStats.totalCoins.toLocaleString()}`, color: 'text-emerald-400' },
            { label: 'Ads Watched', value: adminStats.totalAdsWatched.toLocaleString(), color: 'text-amber-400' },
            { label: 'Withdrawn', value: `₦${adminStats.totalWithdrawn.toLocaleString()}`, color: 'text-purple-400' },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-3">
          {pendingWithdrawals.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No pending withdrawals</p>
          ) : (
            pendingWithdrawals.map((w) => (
              <div key={w.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">@{w.users?.username}</p>
                    <p className="text-sm text-slate-400">{w.users?.email}</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">₦{w.amount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 mb-3">
                  <p className="text-sm text-slate-400">Bank: {w.bank_name}</p>
                  <p className="text-lg font-bold text-white">{w.account_number}</p>
                  <p className="text-sm text-slate-300">{w.account_name}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => approveWithdrawal(w.id)}
                    className="flex-1 py-2 bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Approve
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => rejectWithdrawal(w.id, 'Rejected by admin')}
                    className="flex-1 py-2 bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <X size={18} /> Reject
                  </motion.button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Premium Tab */}
      {activeTab === 'premium' && (
        <div className="space-y-3">
          {pendingPremium.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No pending premium requests</p>
          ) : (
            pendingPremium.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">@{p.users?.username}</p>
                    <p className="text-sm text-slate-400">{p.users?.email}</p>
                  </div>
                  <Crown size={24} className="text-amber-400" />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => approvePremium(p.id)}
                    className="flex-1 py-2 bg-amber-500 text-slate-900 font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Approve
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => rejectPremium(p.id)}
                    className="flex-1 py-2 bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <X size={18} /> Reject
                  </motion.button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-3">
          {pendingData.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No pending data requests</p>
          ) : (
            pendingData.map((d) => {
              const network = NETWORK_PROVIDERS.find(n => n.code === d.network_provider);
              return (
                <div key={d.id} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white">@{d.users?.username || d.username}</p>
                      <p className="text-sm text-slate-400">{d.users?.email || d.user_email}</p>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3 mb-3 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{ backgroundColor: network?.color, color: network?.textColor }}
                    >
                      {network?.logo}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white flex items-center gap-2">
                        <Phone size={16} /> {d.phone_number}
                      </p>
                      <p className="text-sm text-slate-400">{network?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => approveDataRequest(d.id)}
                      className="flex-1 py-2 bg-purple-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Sent
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => rejectDataRequest(d.id)}
                      className="flex-1 py-2 bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                      <X size={18} /> Reject
                    </motion.button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Gift Codes Tab */}
      {activeTab === 'codes' && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-white mb-4">Create Gift Code</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Code (e.g., FREE100)"
                value={newCode.code}
                onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                className="w-full"
              />
              <div className="grid grid-cols-3 gap-2">
                {['coins', 'spins', 'premium'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewCode({ ...newCode, type })}
                    className={`py-2 rounded-xl capitalize ${
                      newCode.type === type ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Value"
                  value={newCode.value}
                  onChange={(e) => setNewCode({ ...newCode, value: parseInt(e.target.value) || 0 })}
                  className="w-full"
                />
                <input
                  type="number"
                  placeholder="Max Uses"
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) || 1 })}
                  className="w-full"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateCode}
                className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl"
              >
                Create Code
              </motion.button>
            </div>
          </div>

          <div className="space-y-2">
            {giftCodes.map((code) => (
              <div key={code.id} className="card p-3 flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-emerald-400">{code.code}</p>
                  <p className="text-xs text-slate-400">
                    {code.type}: {code.value} • {code.used_count}/{code.max_uses} used
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  code.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {code.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Withdrawals Open</span>
            <button
              onClick={() => setLocalSettings({ ...localSettings, withdrawalOpen: !localSettings.withdrawalOpen })}
              className={`w-12 h-6 rounded-full transition-colors ${
                localSettings.withdrawalOpen ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: localSettings.withdrawalOpen ? 26 : 2, y: 2 }}
              />
            </button>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Withdrawal Fee (₦)</label>
            <input
              type="number"
              value={localSettings.withdrawalFee}
              onChange={(e) => setLocalSettings({ ...localSettings, withdrawalFee: parseInt(e.target.value) || 0 })}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Telegram Link</label>
            <input
              type="text"
              value={localSettings.telegramLink}
              onChange={(e) => setLocalSettings({ ...localSettings, telegramLink: e.target.value })}
              placeholder="https://t.me/..."
              className="w-full"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSettings}
            className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl"
          >
            Save Settings
          </motion.button>
        </div>
      )}
    </div>
  );
}
