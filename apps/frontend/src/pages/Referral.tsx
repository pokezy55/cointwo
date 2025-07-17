import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReferralItem from '../components/ReferralItem';
import { ShareNetwork, Copy } from 'phosphor-react';
import NetworkBadge from '../components/NetworkBadge';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferralPage() {
  const { user, selectedNetwork } = useAuth();
  const username = user?.telegram?.username || 'yourref';
  const [referrals, setReferrals] = useState<any[]>([]);
  useEffect(() => {
    async function fetchReferrals() {
      try {
        const res = await fetch(`/referral/progress?user=${user?.address}&chain=${selectedNetwork.name}`);
        const data = await res.json();
        setReferrals(data.referrals || []);
      } catch {
        setReferrals([]);
      }
    }
    fetchReferrals();
  }, [user, selectedNetwork]);
  const handleCopy = () => {
    navigator.clipboard.writeText(username);
    toast.success('Referral code copied!');
  };
  const handleShare = async () => {
    const link = `https://t.me/cointwobot?start=ref${username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join CoinTwo Wallet', text: 'Get rewards by joining!', url: link });
        toast.success('Shared!');
      } catch {}
    } else if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.openTelegramLink?.(link);
    } else {
      navigator.clipboard.writeText(link);
      toast.success('Referral link copied!');
    }
  };
  return (
    <div className="min-h-screen bg-[#101828] max-w-md mx-auto px-2 py-4 flex flex-col text-white font-sans rounded-2xl shadow-xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Invite Friends</h1>
            <div className="text-gray-400 text-sm">Get rewards by inviting friends</div>
          </div>
          <NetworkBadge name={selectedNetwork.name} logo={selectedNetwork.logo} />
        </div>
      </motion.div>
      {/* Referral Code Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-4 w-full bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-lg flex flex-col gap-2 items-center border border-white/10">
        <div className="text-xs text-gray-400 mb-1">Your Referral Code</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#181f2a] px-4 py-2 rounded font-mono text-base tracking-wide select-all border border-white/10">{username}</span>
          <button className="p-2 rounded-xl bg-white/10 hover:bg-blue-500/20 transition text-blue-400" onClick={handleCopy} aria-label="Copy code"><Copy size={18} /></button>
          <button className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white" onClick={handleShare} aria-label="Share code"><ShareNetwork size={18} /></button>
        </div>
        <div className="text-xs text-gray-500 text-center">Share your code or link to invite friends and earn rewards.</div>
      </motion.div>
      {/* Referral List */}
      <div className="flex-1 flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {referrals.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-500 py-8">No referrals yet.<br/>Share your code to start earning!</motion.div>
          ) : (
            referrals.map(ref => (
              <motion.div key={ref.address+selectedNetwork.chainId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
                <ReferralItem referral={ref} chain={selectedNetwork.name} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 