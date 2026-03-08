import { create } from 'zustand';
import { supabase, isSupabaseConfigured, ADMIN_EMAIL, SPIN_SEGMENTS, DEFAULT_SETTINGS, DAILY_CHECKIN_REWARDS } from '../config/supabase';
import type { UserData, AppSettings, Transaction, WithdrawalRequest, PremiumRequest, GiftCode, DataRequest } from '../config/supabase';
import { generateFingerprint, calculateFraudScore, getClientIP, storeFingerprint, getStoredFingerprint } from '../utils/antiCheat';
import { sounds } from '../utils/sounds';

// Normalized settings for internal use
interface NormalizedSettings {
  minWithdrawal: number;
  minReferrals: number;
  coinsPerReferral: number;
  premiumReferralBonus: number;
  premiumPrice: number;
  signupBonus: number;
  dailySpinsFree: number;
  dailySpinsPremium: number;
  withdrawalFee: number;
  withdrawalOpen: boolean;
  premiumRequiredForWithdrawal: boolean;
  telegramLink: string;
}

interface GameState {
  // Auth
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Settings
  settings: NormalizedSettings;
  
  // Data
  transactions: Transaction[];
  leaderboard: UserData[];
  
  // Admin data
  allUsers: UserData[];
  withdrawalRequests: WithdrawalRequest[];
  premiumRequests: PremiumRequest[];
  giftCodes: GiftCode[];
  dataRequests: DataRequest[];
  adminStats: {
    totalUsers: number;
    totalCoins: number;
    totalAdsWatched: number;
    totalWithdrawn: number;
  };
  
  // Actions
  signUp: (email: string, password: string, username: string, referralCode?: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loadUser: (userId: string) => Promise<void>;
  
  // Game actions
  spin: () => Promise<number>;
  claimDailyCheckIn: () => Promise<{ coins: number; bonus: string | null } | null>;
  redeemGiftCode: (code: string) => Promise<{ type: string; value: number } | null>;
  watchAdForExtraSpin: () => Promise<boolean>;
  
  // Wallet actions
  saveBankDetails: (bankName: string, accountNumber: string, accountName: string) => Promise<boolean>;
  requestWithdrawal: (amount: number) => Promise<boolean>;
  requestPremium: (receiptUrl: string) => Promise<boolean>;
  requestData: (phoneNumber: string, networkProvider: string) => Promise<boolean>;
  
  // Admin actions
  loadAdminData: () => Promise<void>;
  approveWithdrawal: (id: string) => Promise<boolean>;
  rejectWithdrawal: (id: string, note: string) => Promise<boolean>;
  approvePremium: (id: string) => Promise<boolean>;
  rejectPremium: (id: string) => Promise<boolean>;
  approveDataRequest: (id: string) => Promise<boolean>;
  rejectDataRequest: (id: string) => Promise<boolean>;
  createGiftCode: (code: string, type: string, value: number, maxUses: number) => Promise<boolean>;
  updateSettings: (newSettings: Partial<NormalizedSettings>) => Promise<boolean>;
  restrictUser: (userId: string, restriction: string) => Promise<boolean>;
  blockUser: (userId: string) => Promise<boolean>;
  
  // Helpers
  setError: (error: string | null) => void;
  clearError: () => void;
  incrementAdsWatched: () => Promise<void>;
}

// Generate referral code
const generateReferralCode = (username: string): string => {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${username.substring(0, 3).toUpperCase()}${random}`;
};

// Get today's date string
const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Check if it's a new day
const isNewDay = (lastDate: string | null): boolean => {
  if (!lastDate) return true;
  return lastDate !== getToday();
};

// Normalize database settings to internal format
const normalizeSettings = (dbSettings: AppSettings | null): NormalizedSettings => {
  if (!dbSettings) return DEFAULT_SETTINGS as unknown as NormalizedSettings;
  
  return {
    minWithdrawal: Number(dbSettings.min_withdrawal) || DEFAULT_SETTINGS.minWithdrawal,
    minReferrals: Number(dbSettings.min_referrals) || DEFAULT_SETTINGS.minReferrals,
    coinsPerReferral: Number(dbSettings.coins_per_referral) || DEFAULT_SETTINGS.coinsPerReferral,
    premiumReferralBonus: Number(dbSettings.premium_referral_bonus) || DEFAULT_SETTINGS.premiumReferralBonus,
    premiumPrice: Number(dbSettings.premium_price) || DEFAULT_SETTINGS.premiumPrice,
    signupBonus: Number(dbSettings.signup_bonus) || DEFAULT_SETTINGS.signupBonus,
    dailySpinsFree: Number(dbSettings.daily_spins_free) || DEFAULT_SETTINGS.dailySpinsFree,
    dailySpinsPremium: Number(dbSettings.daily_spins_premium) || DEFAULT_SETTINGS.dailySpinsPremium,
    withdrawalFee: Number(dbSettings.withdrawal_fee) || 0,
    withdrawalOpen: dbSettings.withdrawal_open !== false,
    premiumRequiredForWithdrawal: dbSettings.premium_required_for_withdrawal !== false,
    telegramLink: dbSettings.telegram_link || '',
  };
};

// Normalize user data (ensure all numeric fields have proper values)
const normalizeUser = (userData: any): UserData => {
  return {
    ...userData,
    coins: Number(userData.coins) || 0,
    total_coins_earned: Number(userData.total_coins_earned) || 0,
    total_coins_withdrawn: Number(userData.total_coins_withdrawn) || 0,
    spins_today: Number(userData.spins_today) || 0,
    bonus_spins: Number(userData.bonus_spins) || 0,
    daily_spins_limit: Number(userData.daily_spins_limit) || 5,
    streak_days: Number(userData.streak_days) || 0,
    referral_count: Number(userData.referral_count) || 0,
    check_in_day: Number(userData.check_in_day) || 0,
    check_in_streak: Number(userData.check_in_streak) || 0,
    ads_watched: Number(userData.ads_watched) || 0,
    daily_ads_watched: Number(userData.daily_ads_watched) || 0,
    extra_spin_ads_watched: Number(userData.extra_spin_ads_watched) || 0,
    is_premium: userData.is_premium === true,
    is_admin: userData.is_admin === true || userData.email === ADMIN_EMAIL,
    is_blocked: userData.is_blocked === true,
    bank_verified: userData.bank_verified === true,
    premium_pending: userData.premium_pending === true,
    restrictions: Array.isArray(userData.restrictions) ? userData.restrictions : [],
  };
};

// Get rigged spin result based on balance
const getRiggedSpinResult = (currentBalance: number): number => {
  const segments = SPIN_SEGMENTS.map(s => s.value);
  const minValue = Math.min(...segments); // 50
  // Max value is 500 - used for probability calculations
  
  // Define probability weights based on balance
  let weights: number[];
  
  if (currentBalance < 1000) {
    // Generous for new users (hook them)
    weights = [15, 20, 25, 20, 15, 5, 15, 20]; // More mid-range wins
  } else if (currentBalance < 2500) {
    // Normal odds
    weights = [20, 25, 20, 15, 10, 5, 20, 25];
  } else if (currentBalance < 4000) {
    // Slightly harder
    weights = [25, 25, 20, 12, 8, 3, 25, 25];
  } else if (currentBalance < 5000) {
    // Harder
    weights = [30, 25, 18, 10, 5, 2, 30, 25];
  } else if (currentBalance < 6000) {
    // Much harder
    weights = [35, 25, 15, 8, 4, 1, 35, 25];
  } else if (currentBalance < 7000) {
    // Very hard
    weights = [40, 25, 12, 6, 3, 0.5, 40, 25];
  } else if (currentBalance < 8000) {
    // Extremely hard
    weights = [45, 25, 10, 5, 2, 0.2, 45, 25];
  } else if (currentBalance < 8500) {
    // Near impossible
    weights = [50, 22, 8, 4, 1.5, 0.1, 50, 22];
  } else if (currentBalance < 9000) {
    // Almost there - make it brutal
    weights = [55, 20, 6, 3, 1, 0.05, 55, 20];
  } else if (currentBalance < 9500) {
    // SO close - almost no chance
    weights = [60, 18, 5, 2, 0.5, 0.02, 60, 18];
  } else {
    // At withdrawal threshold - minimal wins
    weights = [65, 15, 4, 1.5, 0.3, 0.01, 65, 15];
  }
  
  // Normalize weights
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Random selection based on weights
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < normalizedWeights.length; i++) {
    cumulative += normalizedWeights[i];
    if (random <= cumulative) {
      return segments[i];
    }
  }
  
  return minValue; // Fallback to minimum
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  settings: DEFAULT_SETTINGS as unknown as NormalizedSettings,
  transactions: [],
  leaderboard: [],
  allUsers: [],
  withdrawalRequests: [],
  premiumRequests: [],
  giftCodes: [],
  dataRequests: [],
  adminStats: {
    totalUsers: 0,
    totalCoins: 0,
    totalAdsWatched: 0,
    totalWithdrawn: 0,
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Sign up
  signUp: async (email, password, username, referralCode) => {
    if (!supabase || !isSupabaseConfigured()) {
      set({ error: 'Database not configured. Please add Supabase credentials.' });
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      // Generate device fingerprint
      const { fingerprint } = await generateFingerprint();
      const ip = await getClientIP();

      // Check if device already registered
      const { data: existingDevice } = await supabase
        .from('devices')
        .select('*')
        .eq('fingerprint', fingerprint)
        .single();

      if (existingDevice) {
        set({ error: 'This device is already registered with another account.', isLoading: false });
        return false;
      }

      // Check username availability
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      if (existingUser) {
        set({ error: 'Username already taken. Please choose another.', isLoading: false });
        return false;
      }

      // Check email availability
      const { data: existingEmail } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (existingEmail) {
        set({ error: 'Email already registered. Please sign in instead.', isLoading: false });
        return false;
      }

      // Validate referral code if provided
      let referrer: UserData | null = null;
      if (referralCode) {
        const { data: referrerData } = await supabase
          .from('users')
          .select('*')
          .eq('referral_code', referralCode.toUpperCase())
          .single();

        if (!referrerData) {
          set({ error: 'Invalid referral code.', isLoading: false });
          return false;
        }

        // Check self-referral
        const storedFp = getStoredFingerprint();
        if (referrerData.device_fingerprint === fingerprint || referrerData.device_fingerprint === storedFp) {
          set({ error: 'You cannot refer yourself.', isLoading: false });
          return false;
        }

        referrer = referrerData;
      }

      // Calculate fraud score
      const fraudScore = await calculateFraudScore(false, 0, false);
      if (fraudScore >= 70) {
        set({ error: 'Registration blocked due to suspicious activity.', isLoading: false });
        return false;
      }

      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'app')
        .single();

      const normalizedSettings = normalizeSettings(settingsData);
      const signupBonus = normalizedSettings.signupBonus;
      const dailySpinsFree = normalizedSettings.dailySpinsFree;

      // Generate user ID and referral code
      const userId = crypto.randomUUID();
      const userReferralCode = generateReferralCode(username);
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      // Create user
      const newUser: UserData = {
        id: userId,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        coins: isAdmin ? 10000 : signupBonus,
        total_coins_earned: isAdmin ? 10000 : signupBonus,
        total_coins_withdrawn: 0,
        spins_today: 0,
        bonus_spins: 0,
        last_spin_date: null,
        daily_spins_limit: dailySpinsFree,
        streak_days: 0,
        last_streak_claim: null,
        referral_code: userReferralCode,
        referred_by: referrer?.referral_code || null,
        referral_count: 0,
        is_premium: false,
        premium_expires_at: null,
        premium_pending: false,
        receipt_url: null,
        device_fingerprint: fingerprint,
        ip_address: ip,
        bank_name: null,
        account_number: null,
        account_name: null,
        bank_verified: false,
        is_admin: isAdmin,
        is_blocked: false,
        restrictions: [],
        check_in_day: 0,
        last_check_in: null,
        check_in_streak: 0,
        ads_watched: 0,
        daily_ads_watched: 0,
        extra_spin_ads_watched: 0,
        last_extra_spin_reset: null,
        phone_number: null,
        network_provider: null,
        last_data_request: null,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      };

      // Store password hash (simple hash for demo - use bcrypt in production)
      const passwordHash = btoa(password);

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          ...newUser,
          password_hash: passwordHash,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        set({ error: 'Failed to create account. Please try again.', isLoading: false });
        return false;
      }

      // Register device
      await supabase.from('devices').insert({
        fingerprint,
        user_id: userId,
        ip_address: ip,
      });

      // Store fingerprint locally
      storeFingerprint(fingerprint);

      // Create signup bonus transaction
      if (!isAdmin && signupBonus > 0) {
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'signup',
          amount: signupBonus,
          description: 'Welcome bonus',
          status: 'completed',
        });
      }

      // Process referral bonus
      if (referrer) {
        const referralBonus = normalizedSettings.coinsPerReferral;
        
        await supabase
          .from('users')
          .update({
            coins: referrer.coins + referralBonus,
            total_coins_earned: referrer.total_coins_earned + referralBonus,
            referral_count: referrer.referral_count + 1,
          })
          .eq('id', referrer.id);

        await supabase.from('transactions').insert({
          user_id: referrer.id,
          type: 'referral',
          amount: referralBonus,
          description: `Referral bonus from ${username}`,
          status: 'completed',
        });
      }

      // Store session
      localStorage.setItem('spin9ja_user', JSON.stringify({ id: userId, email: email.toLowerCase() }));

      set({
        user: normalizeUser(newUser),
        isAuthenticated: true,
        isLoading: false,
        settings: normalizedSettings,
      });

      sounds.success();
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      set({ error: 'An unexpected error occurred.', isLoading: false });
      return false;
    }
  },

  // Sign in
  signIn: async (email, password) => {
    if (!supabase || !isSupabaseConfigured()) {
      set({ error: 'Database not configured. Please add Supabase credentials.' });
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !userData) {
        set({ error: 'Invalid email or password.', isLoading: false });
        return false;
      }

      // Verify password
      if (userData.password_hash !== btoa(password)) {
        set({ error: 'Invalid email or password.', isLoading: false });
        return false;
      }

      // Check if blocked
      if (userData.is_blocked) {
        set({ error: 'Your account has been blocked. Contact support.', isLoading: false });
        return false;
      }

      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'app')
        .single();

      const normalizedSettings = normalizeSettings(settingsData);

      // Update last active and reset daily counters if new day
      const updates: Partial<UserData> = {
        last_active: new Date().toISOString(),
      };

      if (isNewDay(userData.last_spin_date)) {
        updates.spins_today = 0;
        updates.daily_ads_watched = 0;
        updates.last_spin_date = getToday();
      }

      // Reset extra spin ads if 24 hours passed
      if (userData.last_extra_spin_reset) {
        const lastReset = new Date(userData.last_extra_spin_reset).getTime();
        if (Date.now() - lastReset > 24 * 60 * 60 * 1000) {
          updates.extra_spin_ads_watched = 0;
          updates.last_extra_spin_reset = new Date().toISOString();
        }
      }

      await supabase
        .from('users')
        .update(updates)
        .eq('id', userData.id);

      // Store session
      localStorage.setItem('spin9ja_user', JSON.stringify({ id: userData.id, email: userData.email }));

      const normalizedUser = normalizeUser({ ...userData, ...updates });

      set({
        user: normalizedUser,
        isAuthenticated: true,
        isLoading: false,
        settings: normalizedSettings,
      });

      sounds.success();
      return true;
    } catch (error) {
      console.error('Signin error:', error);
      set({ error: 'An unexpected error occurred.', isLoading: false });
      return false;
    }
  },

  // Sign out
  signOut: async () => {
    localStorage.removeItem('spin9ja_user');
    set({
      user: null,
      isAuthenticated: false,
      transactions: [],
      leaderboard: [],
    });
  },

  // Load user data
  loadUser: async (userId) => {
    if (!supabase || !isSupabaseConfigured()) return;

    set({ isLoading: true });

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userData) {
        localStorage.removeItem('spin9ja_user');
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'app')
        .single();

      const normalizedSettings = normalizeSettings(settingsData);

      // Reset daily counters if new day
      const updates: Partial<UserData> = {
        last_active: new Date().toISOString(),
      };

      if (isNewDay(userData.last_spin_date)) {
        updates.spins_today = 0;
        updates.daily_ads_watched = 0;
        updates.last_spin_date = getToday();
      }

      // Reset extra spin ads if 24 hours passed
      if (userData.last_extra_spin_reset) {
        const lastReset = new Date(userData.last_extra_spin_reset).getTime();
        if (Date.now() - lastReset > 24 * 60 * 60 * 1000) {
          updates.extra_spin_ads_watched = 0;
          updates.last_extra_spin_reset = new Date().toISOString();
        }
      }

      if (Object.keys(updates).length > 1) {
        await supabase.from('users').update(updates).eq('id', userId);
      }

      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Load leaderboard
      const { data: leaderboardData } = await supabase
        .from('users')
        .select('username, referral_count, total_coins_earned, is_premium')
        .order('referral_count', { ascending: false })
        .limit(10);

      const normalizedUser = normalizeUser({ ...userData, ...updates });

      set({
        user: normalizedUser,
        isAuthenticated: true,
        isLoading: false,
        settings: normalizedSettings,
        transactions: transactionsData || [],
        leaderboard: (leaderboardData || []).map(u => normalizeUser(u)),
      });
    } catch (error) {
      console.error('Load user error:', error);
      set({ isLoading: false });
    }
  },

  // Spin the wheel
  spin: async () => {
    const { user, settings } = get();
    if (!user || !supabase) return 0;

    // Check restrictions
    if (user.restrictions.includes('spinDisabled')) {
      set({ error: 'Spinning is disabled for your account.' });
      return 0;
    }

    // Calculate available spins
    const maxSpins = user.is_premium ? settings.dailySpinsPremium : settings.dailySpinsFree;
    const spinsUsed = Number(user.spins_today) || 0;
    const bonusSpins = Number(user.bonus_spins) || 0;
    const totalAvailable = maxSpins - spinsUsed + bonusSpins;

    if (totalAvailable <= 0) {
      set({ error: 'No spins remaining. Watch ads for extra spins or come back tomorrow!' });
      return 0;
    }

    try {
      // Get rigged result
      const result = getRiggedSpinResult(Number(user.coins) || 0);

      // Update user
      const updates: Partial<UserData> = {
        coins: (Number(user.coins) || 0) + result,
        total_coins_earned: (Number(user.total_coins_earned) || 0) + result,
        last_spin_date: getToday(),
      };

      // Use bonus spin first, then regular spins
      if (bonusSpins > 0) {
        updates.bonus_spins = bonusSpins - 1;
      } else {
        updates.spins_today = spinsUsed + 1;
      }

      await supabase.from('users').update(updates).eq('id', user.id);

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'spin',
        amount: result,
        description: `Won ${result} coins from spin`,
        status: 'completed',
      });

      // Update local state
      set({
        user: normalizeUser({ ...user, ...updates }),
      });

      // Play sound
      if (result >= 200) {
        sounds.jackpot();
      } else {
        sounds.win();
      }

      return result;
    } catch (error) {
      console.error('Spin error:', error);
      set({ error: 'Failed to spin. Please try again.' });
      return 0;
    }
  },

  // Claim daily check-in
  claimDailyCheckIn: async () => {
    const { user } = get();
    if (!user || !supabase) return null;

    // Check restrictions
    if (user.restrictions.includes('checkInDisabled')) {
      set({ error: 'Check-in is disabled for your account.' });
      return null;
    }

    // Check if already claimed today
    if (user.last_check_in === getToday()) {
      set({ error: 'You have already claimed today\'s bonus!' });
      return null;
    }

    try {
      // Calculate check-in day
      let newDay = (Number(user.check_in_day) || 0) + 1;
      if (newDay > 30) newDay = 1; // Reset after 30 days

      const reward = DAILY_CHECKIN_REWARDS[newDay - 1];
      const coins = reward.coins;
      const bonus = reward.bonus;

      const updates: Partial<UserData> = {
        check_in_day: newDay,
        last_check_in: getToday(),
        check_in_streak: (Number(user.check_in_streak) || 0) + 1,
      };

      // Add coins
      if (coins > 0) {
        updates.coins = (Number(user.coins) || 0) + coins;
        updates.total_coins_earned = (Number(user.total_coins_earned) || 0) + coins;
      }

      // Handle bonus
      if (bonus) {
        if (bonus.includes('Spin')) {
          const spinCount = parseInt(bonus) || 1;
          updates.bonus_spins = (Number(user.bonus_spins) || 0) + spinCount;
        } else if (bonus.includes('Premium')) {
          // Grant 1 week premium
          const premiumExpiry = new Date();
          premiumExpiry.setDate(premiumExpiry.getDate() + 7);
          updates.is_premium = true;
          updates.premium_expires_at = premiumExpiry.toISOString();
        }
      }

      await supabase.from('users').update(updates).eq('id', user.id);

      // Record transaction
      if (coins > 0) {
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'checkin',
          amount: coins,
          description: `Day ${newDay} check-in reward${bonus ? ` + ${bonus}` : ''}`,
          status: 'completed',
        });
      }

      set({ user: normalizeUser({ ...user, ...updates }) });

      sounds.checkIn();
      return { coins, bonus };
    } catch (error) {
      console.error('Check-in error:', error);
      set({ error: 'Failed to claim check-in bonus.' });
      return null;
    }
  },

  // Watch ad for extra spin
  watchAdForExtraSpin: async () => {
    const { user } = get();
    if (!user || !supabase) return false;

    try {
      const adsWatched = (Number(user.extra_spin_ads_watched) || 0) + 1;
      const spinsEarned = Math.floor(adsWatched / 4); // 1 spin per 4 ads
      const previousSpinsEarned = Math.floor((Number(user.extra_spin_ads_watched) || 0) / 4);
      const newSpinEarned = spinsEarned > previousSpinsEarned;

      const updates: Partial<UserData> = {
        extra_spin_ads_watched: adsWatched,
        ads_watched: (Number(user.ads_watched) || 0) + 1,
        daily_ads_watched: (Number(user.daily_ads_watched) || 0) + 1,
      };

      if (!user.last_extra_spin_reset) {
        updates.last_extra_spin_reset = new Date().toISOString();
      }

      if (newSpinEarned && adsWatched <= 20) {
        updates.bonus_spins = (Number(user.bonus_spins) || 0) + 1;
      }

      await supabase.from('users').update(updates).eq('id', user.id);
      set({ user: normalizeUser({ ...user, ...updates }) });

      if (newSpinEarned) {
        sounds.coin();
      } else {
        sounds.adComplete();
      }

      return newSpinEarned;
    } catch (error) {
      console.error('Ad watch error:', error);
      return false;
    }
  },

  // Increment ads watched
  incrementAdsWatched: async () => {
    const { user } = get();
    if (!user || !supabase) return;

    const updates = {
      ads_watched: (Number(user.ads_watched) || 0) + 1,
      daily_ads_watched: (Number(user.daily_ads_watched) || 0) + 1,
    };

    await supabase.from('users').update(updates).eq('id', user.id);
    set({ user: normalizeUser({ ...user, ...updates }) });
  },

  // Save bank details
  saveBankDetails: async (bankName, accountNumber, accountName) => {
    const { user } = get();
    if (!user || !supabase) return false;

    try {
      const updates = {
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName.toUpperCase(),
        bank_verified: true,
      };

      await supabase.from('users').update(updates).eq('id', user.id);
      set({ user: normalizeUser({ ...user, ...updates }) });

      sounds.success();
      return true;
    } catch (error) {
      console.error('Save bank error:', error);
      set({ error: 'Failed to save bank details.' });
      return false;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (amount) => {
    const { user, settings } = get();
    if (!user || !supabase) return false;

    // Validations
    if (user.restrictions.includes('withdrawalDisabled')) {
      set({ error: 'Withdrawals are disabled for your account.' });
      return false;
    }

    if (!settings.withdrawalOpen) {
      set({ error: 'Withdrawals are currently closed.' });
      return false;
    }

    if (settings.premiumRequiredForWithdrawal && !user.is_premium) {
      set({ error: 'Premium membership is required to withdraw.' });
      return false;
    }

    if ((Number(user.coins) || 0) < amount) {
      set({ error: 'Insufficient balance.' });
      return false;
    }

    if (amount < settings.minWithdrawal) {
      set({ error: `Minimum withdrawal is ₦${settings.minWithdrawal.toLocaleString()}` });
      return false;
    }

    if ((Number(user.referral_count) || 0) < settings.minReferrals && !user.is_admin) {
      set({ error: `You need ${settings.minReferrals} referrals to withdraw.` });
      return false;
    }

    if (!user.bank_name || !user.account_number || !user.account_name) {
      set({ error: 'Please add your bank details first.' });
      return false;
    }

    try {
      const fee = settings.withdrawalFee;
      const netAmount = amount - fee;

      // Create withdrawal request
      await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount: netAmount,
        bank_name: user.bank_name,
        account_number: user.account_number,
        account_name: user.account_name,
        fee,
        status: 'pending',
      });

      // Deduct coins
      const updates = {
        coins: (Number(user.coins) || 0) - amount,
      };

      await supabase.from('users').update(updates).eq('id', user.id);
      set({ user: normalizeUser({ ...user, ...updates }) });

      sounds.success();
      return true;
    } catch (error) {
      console.error('Withdrawal error:', error);
      set({ error: 'Failed to request withdrawal.' });
      return false;
    }
  },

  // Request premium
  requestPremium: async (receiptUrl) => {
    const { user } = get();
    if (!user || !supabase) return false;

    try {
      await supabase.from('premium_requests').insert({
        user_id: user.id,
        receipt_url: receiptUrl,
        status: 'pending',
      });

      const updates = { premium_pending: true, receipt_url: receiptUrl };
      await supabase.from('users').update(updates).eq('id', user.id);
      set({ user: normalizeUser({ ...user, ...updates }) });

      sounds.success();
      return true;
    } catch (error) {
      console.error('Premium request error:', error);
      set({ error: 'Failed to submit premium request.' });
      return false;
    }
  },

  // Request data/airtime
  requestData: async (phoneNumber, networkProvider) => {
    const { user } = get();
    if (!user || !supabase) return false;

    // Check cooldown (7 days)
    if (user.last_data_request) {
      const lastRequest = new Date(user.last_data_request).getTime();
      const daysSince = (Date.now() - lastRequest) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        const daysLeft = Math.ceil(7 - daysSince);
        set({ error: `You can request data again in ${daysLeft} day(s).` });
        return false;
      }
    }

    try {
      await supabase.from('data_requests').insert({
        user_id: user.id,
        user_email: user.email,
        username: user.username,
        phone_number: phoneNumber,
        network_provider: networkProvider,
        status: 'pending',
      });

      const updates = {
        last_data_request: new Date().toISOString(),
        phone_number: phoneNumber,
        network_provider: networkProvider,
      };

      await supabase.from('users').update(updates).eq('id', user.id);
      set({ user: normalizeUser({ ...user, ...updates }) });

      sounds.success();
      return true;
    } catch (error) {
      console.error('Data request error:', error);
      set({ error: 'Failed to submit data request.' });
      return false;
    }
  },

  // Redeem gift code
  redeemGiftCode: async (code) => {
    const { user } = get();
    if (!user || !supabase) return null;

    try {
      const { data: giftCode, error } = await supabase
        .from('gift_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !giftCode) {
        set({ error: 'Invalid or expired gift code.' });
        return null;
      }

      // Check if already used by this user
      if (giftCode.used_by?.includes(user.id)) {
        set({ error: 'You have already used this code.' });
        return null;
      }

      // Check max uses
      if (giftCode.used_count >= giftCode.max_uses) {
        set({ error: 'This code has reached its maximum uses.' });
        return null;
      }

      // Check expiry
      if (giftCode.expires_at && new Date(giftCode.expires_at) < new Date()) {
        set({ error: 'This code has expired.' });
        return null;
      }

      // Apply reward
      const updates: Partial<UserData> = {};
      
      if (giftCode.type === 'coins') {
        updates.coins = (Number(user.coins) || 0) + giftCode.value;
        updates.total_coins_earned = (Number(user.total_coins_earned) || 0) + giftCode.value;
      } else if (giftCode.type === 'spins') {
        updates.bonus_spins = (Number(user.bonus_spins) || 0) + giftCode.value;
      } else if (giftCode.type === 'premium') {
        const premiumExpiry = new Date();
        premiumExpiry.setDate(premiumExpiry.getDate() + giftCode.value);
        updates.is_premium = true;
        updates.premium_expires_at = premiumExpiry.toISOString();
      }

      await supabase.from('users').update(updates).eq('id', user.id);

      // Update gift code usage
      await supabase
        .from('gift_codes')
        .update({
          used_count: giftCode.used_count + 1,
          used_by: [...(giftCode.used_by || []), user.id],
        })
        .eq('id', giftCode.id);

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'bonus',
        amount: giftCode.value,
        description: `Redeemed gift code: ${giftCode.code}`,
        status: 'completed',
      });

      set({ user: normalizeUser({ ...user, ...updates }) });

      sounds.success();
      return { type: giftCode.type, value: giftCode.value };
    } catch (error) {
      console.error('Redeem code error:', error);
      set({ error: 'Failed to redeem code.' });
      return null;
    }
  },

  // Admin: Load all data
  loadAdminData: async () => {
    const state = get();
    const user = state.user;
    if (!user?.is_admin || !supabase) return;

    try {
      const [
        { data: users },
        { data: withdrawals },
        { data: premiums },
        { data: codes },
        { data: dataReqs },
      ] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*, users(*)').order('created_at', { ascending: false }),
        supabase.from('premium_requests').select('*, users(*)').order('created_at', { ascending: false }),
        supabase.from('gift_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('data_requests').select('*, users(*)').order('created_at', { ascending: false }),
      ]);

      const allUsers = (users || []).map(u => normalizeUser(u));

      // Calculate stats
      const totalCoins = allUsers.reduce((sum, u) => sum + Number(u.coins), 0);
      const totalAdsWatched = allUsers.reduce((sum, u) => sum + Number(u.ads_watched), 0);
      const totalWithdrawn = allUsers.reduce((sum, u) => sum + Number(u.total_coins_withdrawn), 0);

      set({
        allUsers,
        withdrawalRequests: withdrawals || [],
        premiumRequests: premiums || [],
        giftCodes: codes || [],
        dataRequests: dataReqs || [],
        adminStats: {
          totalUsers: allUsers.length,
          totalCoins,
          totalAdsWatched,
          totalWithdrawn,
        },
      });
    } catch (error) {
      console.error('Load admin data error:', error);
    }
  },

  // Admin: Approve withdrawal
  approveWithdrawal: async (id) => {
    const { user } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      const { data: withdrawal } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', id)
        .single();

      if (!withdrawal) return false;

      await supabase
        .from('withdrawals')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', id);

      await supabase
        .from('users')
        .update({
          total_coins_withdrawn: supabase.rpc('increment', { x: withdrawal.amount }),
        })
        .eq('id', withdrawal.user_id);

      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      return false;
    }
  },

  // Admin: Reject withdrawal
  rejectWithdrawal: async (id, note) => {
    const { user } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      const { data: withdrawal } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', id)
        .single();

      if (!withdrawal) return false;

      await supabase
        .from('withdrawals')
        .update({ status: 'rejected', admin_note: note, processed_at: new Date().toISOString() })
        .eq('id', id);

      // Refund coins
      await supabase.rpc('increment_coins', { user_id: withdrawal.user_id, amount: withdrawal.amount });

      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Reject withdrawal error:', error);
      return false;
    }
  },

  // Admin: Approve premium
  approvePremium: async (id) => {
    const { user, settings } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      const { data: request } = await supabase
        .from('premium_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (!request) return false;

      const premiumExpiry = new Date();
      premiumExpiry.setFullYear(premiumExpiry.getFullYear() + 1);

      await supabase
        .from('premium_requests')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', id);

      await supabase
        .from('users')
        .update({
          is_premium: true,
          premium_pending: false,
          premium_expires_at: premiumExpiry.toISOString(),
          daily_spins_limit: settings.dailySpinsPremium,
        })
        .eq('id', request.user_id);

      // Get referrer and give bonus
      const { data: premiumUser } = await supabase
        .from('users')
        .select('referred_by')
        .eq('id', request.user_id)
        .single();

      if (premiumUser?.referred_by) {
        const { data: referrer } = await supabase
          .from('users')
          .select('*')
          .eq('referral_code', premiumUser.referred_by)
          .single();

        if (referrer) {
          await supabase
            .from('users')
            .update({
              coins: referrer.coins + settings.premiumReferralBonus,
              total_coins_earned: referrer.total_coins_earned + settings.premiumReferralBonus,
            })
            .eq('id', referrer.id);

          await supabase.from('transactions').insert({
            user_id: referrer.id,
            type: 'referral',
            amount: settings.premiumReferralBonus,
            description: 'Premium referral bonus',
            status: 'completed',
          });
        }
      }

      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Approve premium error:', error);
      return false;
    }
  },

  // Admin: Reject premium
  rejectPremium: async (id) => {
    const { user } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      await supabase
        .from('premium_requests')
        .update({ status: 'rejected', processed_at: new Date().toISOString() })
        .eq('id', id);

      const { data: request } = await supabase
        .from('premium_requests')
        .select('user_id')
        .eq('id', id)
        .single();

      if (request) {
        await supabase
          .from('users')
          .update({ premium_pending: false })
          .eq('id', request.user_id);
      }

      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Reject premium error:', error);
      return false;
    }
  },

  // Admin: Approve data request
  approveDataRequest: async (id) => {
    const { user } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      await supabase
        .from('data_requests')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', id);

      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Approve data error:', error);
      return false;
    }
  },

  // Admin: Reject data request
  rejectDataRequest: async (id) => {
    const { user } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      await supabase
        .from('data_requests')
        .update({ status: 'rejected', processed_at: new Date().toISOString() })
        .eq('id', id);

      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Reject data error:', error);
      return false;
    }
  },

  // Admin: Create gift code
  createGiftCode: async (code, type, value, maxUses) => {
    const { user } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      await supabase.from('gift_codes').insert({
        code: code.toUpperCase(),
        type,
        value,
        max_uses: maxUses,
        used_count: 0,
        used_by: [],
        is_active: true,
      });

      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Create gift code error:', error);
      return false;
    }
  },

  // Admin: Update settings
  updateSettings: async (newSettings) => {
    const { user, settings } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      const dbSettings: Partial<AppSettings> = {};
      
      if (newSettings.minWithdrawal !== undefined) dbSettings.min_withdrawal = newSettings.minWithdrawal;
      if (newSettings.minReferrals !== undefined) dbSettings.min_referrals = newSettings.minReferrals;
      if (newSettings.coinsPerReferral !== undefined) dbSettings.coins_per_referral = newSettings.coinsPerReferral;
      if (newSettings.withdrawalFee !== undefined) dbSettings.withdrawal_fee = newSettings.withdrawalFee;
      if (newSettings.withdrawalOpen !== undefined) dbSettings.withdrawal_open = newSettings.withdrawalOpen;
      if (newSettings.telegramLink !== undefined) dbSettings.telegram_link = newSettings.telegramLink;

      await supabase.from('settings').update(dbSettings).eq('id', 'app');

      set({ settings: { ...settings, ...newSettings } });
      return true;
    } catch (error) {
      console.error('Update settings error:', error);
      return false;
    }
  },

  // Admin: Restrict user
  restrictUser: async (userId, restriction) => {
    const { user } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      const { data: targetUser } = await supabase
        .from('users')
        .select('restrictions')
        .eq('id', userId)
        .single();

      if (!targetUser) return false;

      const restrictions = targetUser.restrictions || [];
      const index = restrictions.indexOf(restriction);

      if (index > -1) {
        restrictions.splice(index, 1);
      } else {
        restrictions.push(restriction);
      }

      await supabase.from('users').update({ restrictions }).eq('id', userId);
      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Restrict user error:', error);
      return false;
    }
  },

  // Admin: Block user
  blockUser: async (userId) => {
    const { user } = get();
    if (!user?.is_admin || !supabase) return false;

    try {
      const { data: targetUser } = await supabase
        .from('users')
        .select('is_blocked')
        .eq('id', userId)
        .single();

      if (!targetUser) return false;

      await supabase
        .from('users')
        .update({ is_blocked: !targetUser.is_blocked })
        .eq('id', userId);

      await get().loadAdminData();
      return true;
    } catch (error) {
      console.error('Block user error:', error);
      return false;
    }
  },
}));
