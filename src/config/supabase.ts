import { createClient } from '@supabase/supabase-js';

// Supabase Configuration - Replace with your credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tolwzbpewujzkhqhjkmj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbHd6YnBld3VqemtocWhqa21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODE5NTQsImV4cCI6MjA4ODU1Nzk1NH0.1SXNCgDEYdEfLDyrxr_eryzGle48WBFumqw_iylKfdw';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://tolwzbpewujzkhqhjkmj.supabase.co' && 
         supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbHd6YnBld3VqemtocWhqa21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODE5NTQsImV4cCI6MjA4ODU1Nzk1NH0.1SXNCgDEYdEfLDyrxr_eryzGle48WBFumqw_iylKfdw' &&
         supabaseUrl.includes('supabase.co');
};

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin email - This account gets admin privileges
export const ADMIN_EMAIL = 'ememzyvisuals@gmail.com';

// Premium Payment Details
export const PREMIUM_PAYMENT = {
  bank: 'Moniepoint',
  accountNumber: '9047115612',
  accountName: 'AGENT ADURAGBEMI ARIYO',
  amount: 500,
};

// Fintech Banks (Manual verification - no API needed)
export const FINTECH_BANKS = [
  { name: 'OPay', code: 'opay' },
  { name: 'PalmPay', code: 'palmpay' },
  { name: 'Moniepoint', code: 'moniepoint' },
  { name: 'Kuda Bank', code: 'kuda' },
  { name: 'SmartCash', code: 'smartcash' },
  { name: 'MTN MoMo', code: 'momo' },
  { name: 'Carbon', code: 'carbon' },
  { name: 'FairMoney', code: 'fairmoney' },
] as const;

// Network Providers
export const NETWORK_PROVIDERS = [
  { name: 'MTN', code: 'mtn', color: '#ffcc00', textColor: '#000000', logo: 'M' },
  { name: 'Airtel', code: 'airtel', color: '#ff0000', textColor: '#ffffff', logo: 'A' },
  { name: 'Glo', code: 'glo', color: '#00a651', textColor: '#ffffff', logo: 'G' },
  { name: '9mobile', code: '9mobile', color: '#006b3f', textColor: '#ffffff', logo: '9' },
] as const;

// Spin Wheel Segments
export const SPIN_SEGMENTS = [
  { value: 50, color: '#059669', label: '50' },
  { value: 75, color: '#0891b2', label: '75' },
  { value: 100, color: '#7c3aed', label: '100' },
  { value: 150, color: '#db2777', label: '150' },
  { value: 200, color: '#ea580c', label: '200' },
  { value: 500, color: '#fbbf24', label: '500' },
  { value: 50, color: '#14b8a6', label: '50' },
  { value: 75, color: '#8b5cf6', label: '75' },
] as const;

// Default App Settings
export const DEFAULT_SETTINGS = {
  minWithdrawal: 10000,
  minReferrals: 10,
  coinsPerReferral: 200,
  premiumReferralBonus: 200,
  premiumPrice: 500,
  signupBonus: 100,
  dailySpinsFree: 5,
  dailySpinsPremium: 15,
  withdrawalFee: 0,
  withdrawalOpen: true,
  premiumRequiredForWithdrawal: true,
  extraSpinAdsRequired: 20,
  extraSpinsReward: 5,
};

// Daily Check-In Rewards (Total: ~9,000 coins over 30 days)
export const DAILY_CHECKIN_REWARDS = [
  { day: 1, coins: 100, bonus: null },
  { day: 2, coins: 150, bonus: null },
  { day: 3, coins: 200, bonus: null },
  { day: 4, coins: 250, bonus: null },
  { day: 5, coins: 300, bonus: null },
  { day: 6, coins: 350, bonus: null },
  { day: 7, coins: 500, bonus: '1 Extra Spin' },
  { day: 8, coins: 150, bonus: null },
  { day: 9, coins: 200, bonus: null },
  { day: 10, coins: 250, bonus: null },
  { day: 11, coins: 300, bonus: null },
  { day: 12, coins: 350, bonus: null },
  { day: 13, coins: 400, bonus: null },
  { day: 14, coins: 600, bonus: '2 Extra Spins' },
  { day: 15, coins: 200, bonus: null },
  { day: 16, coins: 250, bonus: null },
  { day: 17, coins: 300, bonus: null },
  { day: 18, coins: 350, bonus: null },
  { day: 19, coins: 400, bonus: null },
  { day: 20, coins: 450, bonus: null },
  { day: 21, coins: 700, bonus: '3 Extra Spins' },
  { day: 22, coins: 250, bonus: null },
  { day: 23, coins: 300, bonus: null },
  { day: 24, coins: 350, bonus: null },
  { day: 25, coins: 400, bonus: null },
  { day: 26, coins: 450, bonus: null },
  { day: 27, coins: 500, bonus: null },
  { day: 28, coins: 800, bonus: '5 Extra Spins' },
  { day: 29, coins: 400, bonus: null },
  { day: 30, coins: 0, bonus: '1 Week Premium!' },
];

// Types
export interface UserData {
  id: string;
  email: string;
  username: string;
  coins: number;
  total_coins_earned: number;
  total_coins_withdrawn: number;
  spins_today: number;
  bonus_spins: number;
  last_spin_date: string | null;
  daily_spins_limit: number;
  streak_days: number;
  last_streak_claim: string | null;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  is_premium: boolean;
  premium_expires_at: string | null;
  premium_pending: boolean;
  receipt_url: string | null;
  device_fingerprint: string | null;
  ip_address: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  bank_verified: boolean;
  is_admin: boolean;
  is_blocked: boolean;
  restrictions: string[];
  check_in_day: number;
  last_check_in: string | null;
  check_in_streak: number;
  ads_watched: number;
  daily_ads_watched: number;
  extra_spin_ads_watched: number;
  last_extra_spin_reset: string | null;
  phone_number: string | null;
  network_provider: string | null;
  last_data_request: string | null;
  created_at: string;
  last_active: string;
}

export interface AppSettings {
  id: string;
  min_withdrawal: number;
  min_referrals: number;
  coins_per_referral: number;
  premium_referral_bonus: number;
  premium_price: number;
  signup_bonus: number;
  daily_spins_free: number;
  daily_spins_premium: number;
  withdrawal_fee: number;
  withdrawal_open: boolean;
  premium_required_for_withdrawal: boolean;
  telegram_link: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'spin' | 'referral' | 'bonus' | 'withdrawal' | 'premium' | 'checkin' | 'signup' | 'ads';
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  fee: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
  users?: UserData;
}

export interface PremiumRequest {
  id: string;
  user_id: string;
  receipt_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at: string | null;
  users?: UserData;
}

export interface GiftCode {
  id: string;
  code: string;
  type: 'coins' | 'spins' | 'premium';
  value: number;
  max_uses: number;
  used_count: number;
  used_by: string[];
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface DataRequest {
  id: string;
  user_id: string;
  user_email?: string;
  username?: string;
  phone_number: string;
  network_provider: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at: string | null;
  users?: UserData;
}
