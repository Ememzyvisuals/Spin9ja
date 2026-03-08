import { Home, ListTodo, Users, Wallet, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '../utils/sounds';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'referral', label: 'Refer', icon: Users },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-800/50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sounds.click();
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full"
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-400' : ''}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
