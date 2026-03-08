import { motion } from 'framer-motion';

interface TermsPageProps {
  setActiveTab: (tab: string) => void;
}

export const TermsPage = ({ setActiveTab }: TermsPageProps) => {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('profile')}
          className="text-gray-400 hover:text-white transition"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-white">Terms & Conditions</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-6"
      >
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-400 text-sm">
            By using Spin9ja, you agree to these terms. If you do not agree, do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Eligibility</h2>
          <p className="text-gray-400 text-sm">
            You must be at least 18 years old to use Spin9ja. One account per person/device is allowed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Earnings & Coins</h2>
          <p className="text-gray-400 text-sm">
            Coins earned through spins, referrals, and tasks are virtual credits. 1 coin = ₦1 for withdrawal purposes only. Spin9ja reserves the right to adjust coin values, rewards, and earning rates at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Withdrawal Policy</h2>
          <p className="text-gray-400 text-sm">
            Minimum withdrawal is ₦10,000. You must have at least 10 verified referrals to withdraw. Withdrawal processing times vary and are not guaranteed. Spin9ja is NOT responsible for delays in payment processing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Referral System</h2>
          <p className="text-gray-400 text-sm">
            Self-referrals and fake referrals are strictly prohibited. Creating multiple accounts to earn referral bonuses will result in permanent ban and forfeiture of all earnings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">6. Premium Subscription</h2>
          <p className="text-gray-400 text-sm">
            Premium subscriptions are non-refundable. Premium benefits may change at any time. Premium does not guarantee higher earnings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-red-400 mb-2">7. DISCLAIMER</h2>
          <p className="text-gray-400 text-sm">
            Spin9ja is an entertainment platform. We make NO GUARANTEES about earnings. Past performance does not indicate future results. Spin9ja is NOT responsible for:
          </p>
          <ul className="text-gray-400 text-sm list-disc list-inside mt-2 space-y-1">
            <li>Any financial losses or disappointments</li>
            <li>Delays in withdrawals or payments</li>
            <li>Technical issues or downtime</li>
            <li>Changes to rewards or earning rates</li>
            <li>Account suspensions or terminations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">8. Account Termination</h2>
          <p className="text-gray-400 text-sm">
            Spin9ja reserves the right to suspend or terminate any account at any time for any reason without prior notice. Upon termination, all coins and pending withdrawals may be forfeited.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">9. Prohibited Activities</h2>
          <ul className="text-gray-400 text-sm list-disc list-inside space-y-1">
            <li>Creating multiple accounts</li>
            <li>Using bots or automated systems</li>
            <li>Self-referrals or fake referrals</li>
            <li>Attempting to hack or exploit the system</li>
            <li>Sharing accounts</li>
            <li>Any form of fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">10. Modifications</h2>
          <p className="text-gray-400 text-sm">
            Spin9ja may modify these terms, rewards, features, or any aspect of the platform at any time without notice. Continued use constitutes acceptance of changes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">11. Governing Law</h2>
          <p className="text-gray-400 text-sm">
            These terms are governed by the laws of the Federal Republic of Nigeria.
          </p>
        </section>

        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mt-6">
          <p className="text-red-400 text-sm font-medium">
            ⚠️ By using Spin9ja, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. USE AT YOUR OWN RISK.
          </p>
        </div>
      </motion.div>

      <p className="text-center text-gray-500 text-sm">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

export default TermsPage;
