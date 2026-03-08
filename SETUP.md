# 🎰 SPIN9JA - COMPLETE SETUP GUIDE

## Everything You Need to Deploy Your App (100% FREE)

---

## 📋 WHAT YOU'LL SET UP

| Service | Purpose | Cost |
|---------|---------|------|
| Supabase | Database, Auth, Storage | **FREE** |
| Vercel | Hosting | **FREE** |
| Monetag | Ads | **FREE** (You Earn Money!) |

---

## PART 1: CREATE SUPABASE PROJECT (5 minutes)

### Step 1: Sign Up
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. Click "New Project"

### Step 2: Create Project
1. **Organization**: Select your org or create one
2. **Project Name**: `spin9ja`
3. **Database Password**: Create a strong password (SAVE THIS!)
4. **Region**: Choose closest to Nigeria (e.g., "West EU" or "Central EU")
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### Step 3: Get Your Keys
1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 4: IMPORTANT - Disable Email Confirmation
This prevents the "email rate exceeded" error!

1. In Supabase, go to **Authentication** (left menu)
2. Click **Providers** tab
3. Click on **Email**
4. **Turn OFF** "Confirm email" toggle
5. Click **Save**

---

## PART 2: CREATE DATABASE TABLES (5 minutes)

### Step 1: Open SQL Editor
1. In Supabase dashboard, click **SQL Editor** (left menu)
2. Click **New Query**

### Step 2: Copy and Run This SQL

⚠️ **COPY THE ENTIRE CODE BELOW - DON'T MISS ANY PART!**

```sql
-- ============================================
-- SPIN9JA COMPLETE DATABASE SETUP
-- Copy this ENTIRE code and click RUN
-- ============================================

-- Step 1: Drop existing tables (clean start)
DROP TABLE IF EXISTS data_requests CASCADE;
DROP TABLE IF EXISTS gift_codes CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS premium_requests CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Step 2: Create USERS table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    coins INTEGER DEFAULT 100,
    total_coins_earned INTEGER DEFAULT 100,
    total_coins_withdrawn INTEGER DEFAULT 0,
    spins_today INTEGER DEFAULT 0,
    last_spin_date TEXT,
    daily_spins_limit INTEGER DEFAULT 5,
    streak_days INTEGER DEFAULT 0,
    last_streak_claim TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    referral_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMPTZ,
    premium_pending BOOLEAN DEFAULT FALSE,
    receipt_url TEXT,
    device_fingerprint TEXT,
    ip_address TEXT,
    bank_name TEXT,
    bank_code TEXT,
    account_number TEXT,
    account_name TEXT,
    bank_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    restrictions TEXT[] DEFAULT '{}',
    check_in_day INTEGER DEFAULT 0,
    last_check_in TEXT,
    check_in_streak INTEGER DEFAULT 0,
    ads_watched INTEGER DEFAULT 0,
    daily_ads_watched INTEGER DEFAULT 0,
    last_data_request TIMESTAMPTZ,
    extra_spin_ads_watched INTEGER DEFAULT 0,
    last_extra_spin_reset TIMESTAMPTZ,
    bonus_spins INTEGER DEFAULT 0,
    phone_number TEXT,
    network_provider TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create SETTINGS table
CREATE TABLE settings (
    id TEXT PRIMARY KEY DEFAULT 'app',
    min_withdrawal INTEGER DEFAULT 10000,
    min_referrals INTEGER DEFAULT 10,
    coins_per_referral INTEGER DEFAULT 200,
    premium_referral_bonus INTEGER DEFAULT 200,
    premium_price INTEGER DEFAULT 500,
    signup_bonus INTEGER DEFAULT 100,
    daily_spins_free INTEGER DEFAULT 5,
    daily_spins_premium INTEGER DEFAULT 15,
    telegram_link TEXT DEFAULT '',
    withdrawal_open BOOLEAN DEFAULT TRUE,
    withdrawal_fee INTEGER DEFAULT 0,
    spin_segments INTEGER[] DEFAULT '{50,75,100,150,200,500}'
);

-- Step 4: Create TRANSACTIONS table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create WITHDRAWALS table
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    bank_name TEXT NOT NULL,
    bank_code TEXT,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Step 6: Create PREMIUM_REQUESTS table
CREATE TABLE premium_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Step 7: Create GIFT_CODES table
CREATE TABLE gift_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    value INTEGER NOT NULL,
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    used_by TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Create DEVICES table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 9: Create DATA_REQUESTS table
CREATE TABLE data_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_email TEXT,
    username TEXT,
    phone_number TEXT NOT NULL,
    network_provider TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Step 10: Insert default settings
INSERT INTO settings (id) VALUES ('app') ON CONFLICT (id) DO NOTHING;

-- Step 11: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Step 12: Create Policies (Allow all operations)
CREATE POLICY "users_policy" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "transactions_policy" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "withdrawals_policy" ON withdrawals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "premium_requests_policy" ON premium_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "gift_codes_policy" ON gift_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "devices_policy" ON devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "data_requests_policy" ON data_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "settings_policy" ON settings FOR ALL USING (true) WITH CHECK (true);

-- DONE! You should see "Success" message
```

3. Click **Run** (or press Ctrl+Enter)
4. You should see **"Success. No rows returned"**

---

## PART 3: ENABLE STORAGE (3 minutes)

### Step 1: Create Storage Bucket
1. In Supabase, click **Storage** (left menu)
2. Click **New Bucket**
3. Name: `receipts`
4. Check "Public bucket"
5. Click **Create bucket**

---

## PART 4: ADD SUPABASE TO YOUR CODE (2 minutes)

### Option A: Using Environment Variables (Recommended)

1. Create a file called `.env` in your project root
2. Add these lines:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Replace with your actual values from Part 1, Step 3.

### Option B: Direct in Code

Open `src/config/supabase.ts` and look for:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

You can replace with direct values:

```typescript
const supabaseUrl = 'https://abcdefghij.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## PART 5: DEPLOY TO VERCEL (5 minutes)

### Step 1: Push Code to GitHub
1. Create a GitHub account if you don't have one: https://github.com
2. Create a new repository called `spin9ja`
3. Upload all project files to the repository

### Step 2: Deploy on Vercel
1. Go to https://vercel.com
2. Click "Sign Up" → Sign in with GitHub
3. Click "Add New" → "Project"
4. Find and select your `spin9ja` repository
5. **IMPORTANT**: Add Environment Variables:
   - Click "Environment Variables"
   - Add `VITE_SUPABASE_URL` = your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click "Deploy"
7. Wait 1-2 minutes
8. Done! Your site is live!

---

## PART 6: SETUP MONETAG ADS (10 minutes)

### Step 1: Sign Up
1. Go to https://www.monetag.com
2. Click "Sign Up"
3. Fill in your details
4. Verify your email

### Step 2: Add Your Website
1. In Monetag dashboard, click "Add Site"
2. Enter your Vercel URL (e.g., `spin9ja.vercel.app`)
3. Wait for approval (usually 1-24 hours)

### Step 3: Get Zone IDs
After approval, create ad zones and copy the Zone IDs.

### Step 4: Add Zone IDs to Code
Open `src/config/monetag.ts` and replace placeholder values with your Zone IDs.

---

## PART 7: TEST YOUR WEBSITE

### Test Checklist:
- [ ] Sign up with a new account
- [ ] Check if 100 coins signup bonus was added
- [ ] Try spinning the wheel
- [ ] Check daily check-in
- [ ] Test referral code generation
- [ ] Login as admin

---

## 🔐 ADMIN LOGIN

**Email:** ememzyvisuals@gmail.com  
**Password:** April232023

Sign up with this email to become admin automatically!

---

## 💰 PREMIUM PAYMENT DETAILS

**Bank:** Moniepoint  
**Account Number:** 9047115612  
**Account Name:** AGENT ADURAGBEMI ARIYO  
**Amount:** ₦500

---

## 🏦 ALLOWED WITHDRAWAL BANKS

- OPay
- PalmPay  
- Moniepoint
- Kuda Bank
- SmartCash
- MTN MoMo
- Carbon
- FairMoney

---

## 📶 WEEKLY 100MB DATA FEATURE

Users can request free 100MB data once per week.

1. User goes to Profile → Request 100MB Data
2. User enters phone number and selects network (MTN, Airtel, Glo, 9mobile)
3. Request appears in Admin Dashboard → Data tab
4. Admin manually sends data and clicks Approve

---

## ❓ TROUBLESHOOTING

### "Could not find column X"
- Run the COMPLETE SQL from Part 2 again
- Make sure you copied ALL of it

### "Email rate exceeded"
- Go to Supabase → Authentication → Providers → Email
- Turn OFF "Confirm email"
- Click Save

### "Database error"
- Check your Supabase URL and key
- Make sure they're correctly added to code or environment variables

### Blank page / Not loading
- Check browser console (F12) for errors
- Make sure Supabase is configured

### Admin login not working
- Sign up with email: ememzyvisuals@gmail.com
- The system automatically makes this email an admin

---

## 📊 COSTS SUMMARY

| Service | Limit | Cost |
|---------|-------|------|
| Supabase | 500MB database, 50K users | **FREE** |
| Vercel | Unlimited deploys | **FREE** |
| Monetag | Unlimited ads | **FREE** |

**Total Cost: ₦0** 🎉

---

## 🎉 YOU'RE DONE!

Your Spin9ja app is now live! 🚀🇳🇬
