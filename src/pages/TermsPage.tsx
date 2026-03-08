import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, Users, CreditCard, Smartphone, Bell, Ban } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
  type: 'terms' | 'privacy';
}

export function TermsPage({ onBack, type }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
        <div className="px-4 py-4 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-slate-400" />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-white">
              {type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
            </h1>
            <p className="text-xs text-slate-400">Last updated: January 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24 max-w-2xl mx-auto">
        {type === 'terms' ? <TermsContent /> : <PrivacyContent />}
      </div>
    </div>
  );
}

function TermsContent() {
  const sections = [
    {
      icon: FileText,
      title: '1. Acceptance of Terms',
      content: `By accessing or using Spin9ja, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.

Spin9ja is a rewards platform that allows users to earn coins through spins, referrals, and daily check-ins. These coins can be withdrawn as Nigerian Naira (₦) subject to our withdrawal requirements.`
    },
    {
      icon: Users,
      title: '2. Eligibility & Account',
      content: `• You must be at least 18 years old to use Spin9ja
• Only ONE account per person is allowed
• Only ONE account per device is allowed
• Creating multiple accounts will result in permanent ban
• You are responsible for maintaining the security of your account
• Self-referrals are strictly prohibited and will result in account termination`
    },
    {
      icon: Shield,
      title: '3. Earning Coins',
      content: `• Signup Bonus: 100 coins upon registration
• Spin Wheel: 50-500 coins per spin (5 free spins daily, 15 for premium)
• Daily Check-in: Earn coins for 30 consecutive days (up to 9,000 coins total)
• Referrals: 200 coins per successful referral
• Premium Referral Bonus: Extra 200 coins if referral upgrades to premium

All coin earnings are subject to our anti-fraud systems. We reserve the right to void coins earned through fraudulent means.`
    },
    {
      icon: CreditCard,
      title: '4. Withdrawals',
      content: `• Minimum withdrawal: ₦10,000
• Minimum referrals required: 10 verified referrals
• Premium membership: REQUIRED for withdrawals
• Supported banks: OPay, PalmPay, Moniepoint, Kuda, SmartCash, MoMo, Carbon, FairMoney
• Withdrawal fee: ₦0 (subject to change)
• Processing time: 1-7 business days
• Admin approval required for all withdrawals

We reserve the right to delay, refuse, or reverse withdrawals if we suspect fraud or violation of these terms.`
    },
    {
      icon: Smartphone,
      title: '5. Premium Subscription',
      content: `Premium subscription costs ₦500 (one-time payment).

Payment details:
• Bank: Moniepoint
• Account Number: 9047115612
• Account Name: AGENT ADURAGBEMI ARIYO

Benefits:
• 15 daily spins (instead of 5)
• Better winning odds
• Priority withdrawal processing
• Required for withdrawals

Premium payments are NON-REFUNDABLE. Admin will verify payment within 24 hours.`
    },
    {
      icon: AlertTriangle,
      title: '6. Prohibited Activities',
      content: `The following activities are strictly prohibited:

• Creating multiple accounts
• Using VPNs or proxies to mask your location
• Self-referrals or fake referrals
• Automated scripts, bots, or manipulation tools
• Sharing your account with others
• Attempting to hack or exploit our systems
• Any form of fraud or deception

Violation of these rules will result in immediate account termination and forfeiture of all coins.`
    },
    {
      icon: Ban,
      title: '7. Account Termination',
      content: `We reserve the right to suspend or terminate your account at any time, for any reason, including but not limited to:

• Violation of these terms
• Fraudulent activity
• Multiple accounts
• Suspicious behavior
• Inactivity for more than 6 months

Upon termination, all coins in your account will be forfeited.`
    },
    {
      icon: Scale,
      title: '8. Disclaimer of Liability',
      content: `IMPORTANT: Please read carefully.

• Spin9ja does NOT guarantee any earnings
• Withdrawal processing times are estimates only
• We are NOT responsible for any delays, disappointments, or losses
• We are NOT responsible for failed payments due to incorrect bank details
• Coin values and earning rates may change without notice
• We reserve the right to modify these terms at any time

By using Spin9ja, you acknowledge that this is a rewards platform and there are no guarantees of earnings. You participate at your own risk.`
    },
    {
      icon: Bell,
      title: '9. Modifications',
      content: `We reserve the right to modify these Terms and Conditions at any time without prior notice. Continued use of Spin9ja after any modifications constitutes acceptance of the new terms.

It is your responsibility to review these terms periodically.`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl p-4">
        <h2 className="text-lg font-bold text-white mb-2">Welcome to Spin9ja</h2>
        <p className="text-sm text-slate-300">
          These terms govern your use of the Spin9ja platform. Please read them carefully before using our services.
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-slate-800/50 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <section.icon size={20} className="text-emerald-400" />
            </div>
            <h3 className="font-bold text-white">{section.title}</h3>
          </div>
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {section.content}
          </p>
        </motion.div>
      ))}

      {/* Contact */}
      <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
        <h3 className="font-bold text-white mb-2">Questions?</h3>
        <p className="text-sm text-slate-400">
          Contact us at: support@spin9ja.com
        </p>
      </div>

      {/* Agreement */}
      <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4">
        <p className="text-sm text-amber-200 text-center">
          By using Spin9ja, you confirm that you have read, understood, and agree to these Terms and Conditions.
        </p>
      </div>
    </div>
  );
}

function PrivacyContent() {
  const sections = [
    {
      icon: FileText,
      title: '1. Information We Collect',
      content: `We collect the following information:

• Account Information: Email address, username, password (encrypted)
• Device Information: Device fingerprint, IP address, browser type
• Usage Data: Spins, coins earned, referrals, check-ins, ads watched
• Bank Information: Bank name, account number, account holder name
• Communication: Support messages, feedback

We use this information to provide our services, prevent fraud, and improve user experience.`
    },
    {
      icon: Shield,
      title: '2. How We Use Your Data',
      content: `Your data is used for:

• Providing and maintaining our service
• Processing withdrawals and premium upgrades
• Preventing fraud and abuse
• Sending notifications about your account
• Improving our platform
• Analytics and service optimization

We do NOT sell your personal information to third parties.`
    },
    {
      icon: Users,
      title: '3. Data Sharing',
      content: `We may share your data with:

• Payment processors (for withdrawals)
• Cloud service providers (hosting)
• Analytics services (anonymized data only)
• Law enforcement (if legally required)

We implement appropriate security measures to protect your data during transmission and storage.`
    },
    {
      icon: CreditCard,
      title: '4. Payment Information',
      content: `For withdrawals, we collect:
• Bank name
• Account number
• Account holder name

This information is stored securely and used only for processing your withdrawal requests. We do not store card numbers or PINs.`
    },
    {
      icon: Smartphone,
      title: '5. Device & Anti-Fraud Data',
      content: `To prevent fraud and multiple accounts, we collect:

• Device fingerprint (hardware/software characteristics)
• IP address
• Browser information

This helps us detect and prevent fraudulent activities like multiple accounts, self-referrals, and automated abuse.`
    },
    {
      icon: Bell,
      title: '6. Notifications & Ads',
      content: `We may send you:

• Push notifications about spins, coins, and rewards
• Promotional messages about new features
• Important account updates

We display ads to support our free service. By using Spin9ja, you consent to viewing advertisements.`
    },
    {
      icon: Shield,
      title: '7. Data Security',
      content: `We implement security measures including:

• Password encryption
• Secure HTTPS connections
• Regular security audits
• Access controls

However, no method of transmission over the internet is 100% secure. You are responsible for keeping your password confidential.`
    },
    {
      icon: Scale,
      title: '8. Your Rights',
      content: `You have the right to:

• Access your personal data
• Request correction of inaccurate data
• Request deletion of your account
• Withdraw consent for data processing

To exercise these rights, contact us at support@spin9ja.com. Note that deleting your account will result in loss of all coins.`
    },
    {
      icon: AlertTriangle,
      title: '9. Data Retention',
      content: `We retain your data for:

• Active accounts: As long as you use our service
• Inactive accounts: Up to 12 months
• Transaction records: Up to 5 years (for legal compliance)

After account deletion, some anonymized data may be retained for analytics purposes.`
    },
    {
      icon: FileText,
      title: '10. Changes to Privacy Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or email.

Continued use of Spin9ja after changes constitutes acceptance of the updated policy.`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-4">
        <h2 className="text-lg font-bold text-white mb-2">Your Privacy Matters</h2>
        <p className="text-sm text-slate-300">
          This policy explains how we collect, use, and protect your personal information on Spin9ja.
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-slate-800/50 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <section.icon size={20} className="text-blue-400" />
            </div>
            <h3 className="font-bold text-white">{section.title}</h3>
          </div>
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {section.content}
          </p>
        </motion.div>
      ))}

      {/* Contact */}
      <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
        <h3 className="font-bold text-white mb-2">Privacy Concerns?</h3>
        <p className="text-sm text-slate-400">
          Contact our Data Protection Officer at: privacy@spin9ja.com
        </p>
      </div>

      {/* Agreement */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4">
        <p className="text-sm text-blue-200 text-center">
          By using Spin9ja, you acknowledge that you have read and understood this Privacy Policy.
        </p>
      </div>
    </div>
  );
}
