import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { isSupabaseConfigured } from './config/supabase';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Logo } from './components/Logo';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { ReferralPage } from './pages/ReferralPage';
import { WalletPage } from './pages/WalletPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  const { user, isAuthenticated, isLoading, loadUser } = useGameStore();
  const [activeTab, setActiveTab] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  // Check ad consent
  useEffect(() => {
    const consent = localStorage.getItem('spin9ja_ad_consent');
    setHasConsented(consent === 'true');
  }, []);

  // Load user from session
  useEffect(() => {
    const session = localStorage.getItem('spin9ja_user');
    if (session) {
      try {
        const { id } = JSON.parse(session);
        loadUser(id);
      } catch {
        localStorage.removeItem('spin9ja_user');
      }
    }
  }, [loadUser]);

  // Show setup screen if Supabase not configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <Logo size="xl" />
          <h1 className="text-2xl font-bold text-white mt-6 mb-2">Setup Required</h1>
          <p className="text-slate-400 mb-6">
            Please configure your Supabase credentials to get started.
          </p>
          <div className="bg-slate-800/50 rounded-xl p-4 text-left">
            <p className="text-sm text-slate-300 mb-3">Add these to your environment:</p>
            <code className="text-xs text-emerald-400 block">VITE_SUPABASE_URL=your_url</code>
            <code className="text-xs text-emerald-400 block">VITE_SUPABASE_ANON_KEY=your_key</code>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            See SETUP.md for complete instructions
          </p>
        </motion.div>
      </div>
    );
  }

  // Show ad consent screen
  if (!hasConsented) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <Logo size="xl" />
          
          <h1 className="text-2xl font-bold text-white mt-6 mb-2">Welcome to Spin9ja! 🎰</h1>
          <p className="text-slate-400 mb-6">
            Spin & earn real Naira! To keep the platform free, we show ads.
          </p>

          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-white mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">✨ 100 coins signup bonus</li>
              <li className="flex items-center gap-2">🎰 5 free daily spins</li>
              <li className="flex items-center gap-2">💰 Win 50-500 coins per spin</li>
              <li className="flex items-center gap-2">👥 200 coins per referral</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.setItem('spin9ja_ad_consent', 'true');
              setHasConsented(true);
            }}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl"
          >
            Accept & Start Earning
          </motion.button>

          <p className="text-xs text-slate-500 mt-4">
            By continuing, you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Logo size="xl" />
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  // Auth screen
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Admin page
  if (showAdmin && user?.is_admin) {
    return <AdminPage onBack={() => setShowAdmin(false)} />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20">
      <Header />
      
      <main className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <HomePage />}
            {activeTab === 'tasks' && <TasksPage />}
            {activeTab === 'referral' && <ReferralPage />}
            {activeTab === 'wallet' && <WalletPage />}
            {activeTab === 'profile' && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={(tab) => {
        if (tab === 'profile' && user?.is_admin) {
          // Long press could open admin
        }
        setActiveTab(tab);
      }} />

      {/* Admin Access Button (for admin users) */}
      {user?.is_admin && !showAdmin && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-24 right-4 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-50"
        >
          <span className="text-white font-bold text-xs">ADM</span>
        </motion.button>
      )}
    </div>
  );
}

export default App;
