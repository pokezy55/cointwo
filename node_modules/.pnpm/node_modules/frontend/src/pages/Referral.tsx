import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReferralItem from '../components/ReferralItem';
import { Star } from 'phosphor-react';

export default function ReferralPage() {
  const { user, selectedNetwork, NETWORKS, setSelectedNetwork } = useAuth();
  const username = user?.telegram?.username || 'yourref';
  const address = user?.address;
  const [referrals, setReferrals] = useState<any[]>([]);
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  useEffect(() => {
    async function fetchXP() {
      const res = await fetch(`/leaderboard?chain=${selectedNetwork.name}&limit=100&address=${address}`);
      const data = await res.json();
      const me = data.leaderboard.find((u: any) => u.address.toLowerCase() === address?.toLowerCase());
      if (me) {
        setXP(me.xp);
        setLevel(me.level);
      }
    }
    if (address) fetchXP();
  }, [address, selectedNetwork]);
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
  const handleShare = () => {
    const link = `https://t.me/cointwobot?start=ref${username}`;
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(link);
    } else {
      navigator.clipboard.writeText(link);
      toast.success('Referral link copied!');
    }
  };
  return (
    <div className="min-h-screen bg-[#10141f] max-w-md mx-auto px-4 py-6 flex flex-col text-white font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Invite Friends</h1>
        <div className="text-gray-400 text-sm mb-2">Earn $1 per friend who completes all tasks.</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-zinc-900 px-3 py-1 rounded font-mono text-sm">{username}</span>
          <button className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition" onClick={handleCopy}>Copy</button>
          <button className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white transition" onClick={handleShare}>Share</button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-blue-700 text-xs font-bold"><Star size={16} />Level {level}</span>
          <span className="text-xs text-gray-400">XP: {xp}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="text-xs text-gray-400">Network:</span>
          <select className="bg-zinc-900 text-white rounded px-2 py-1" value={selectedNetwork.chainId} onChange={e => setSelectedNetwork(NETWORKS.find((n: any) => n.chainId === +e.target.value))}>
            {NETWORKS.map((n: any) => <option key={n.chainId} value={n.chainId}>{n.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {referrals.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No referrals yet.</div>
        ) : (
          referrals.map(ref => <ReferralItem key={ref.address+selectedNetwork.chainId} referral={ref} chain={selectedNetwork.name} />)
        )}
      </div>
    </div>
  );
} 