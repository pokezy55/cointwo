import { FaUserFriends, FaWallet, FaTasks, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { api } from '../utils/api';
import { FaCheckCircle, FaGift } from 'react-icons/fa';
import { toast } from 'react-toastify';

const referrals = [
  { name: 'Alice', reward: 2 },
  { name: 'Bob', reward: 1 },
];

export default function ReferralPage() {
  const { address } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const prevReferrals = useRef<any[]>([]);
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    api.get(`/referral/progress?user=${address}`)
      .then(res => {
        setData(res.data);
        // Notifikasi perubahan status referral
        const prev = prevReferrals.current;
        if (prev.length > 0 && res.data?.referrals) {
          res.data.referrals.forEach((r: any, i: number) => {
            const prevR = prev.find((p: any) => p.address === r.address);
            if (prevR) {
              // Reward eligible baru
              if (!prevR.rewardEligible && r.rewardEligible) {
                toast.success(`Your friend ${r.name || r.address.slice(0, 8)} just completed both tasks! $1 reward is now eligible.`);
              }
              // Reward sent baru
              if (!prevR.rewardSent && r.rewardSent) {
                toast.info(`Your $1 referral reward for ${r.name || r.address.slice(0, 8)} has been sent!`);
              }
            }
          });
        }
        prevReferrals.current = res.data?.referrals || [];
      })
      .catch(err => setError(err.error || 'Failed to fetch referral progress'))
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181f2a] text-white">
        <div className="text-lg font-bold mb-4">Please login or import wallet to continue</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181f2a] flex flex-col text-white">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="font-bold text-lg">Referral</div>
        <FaBars className="text-2xl" />
      </div>
      <div className="px-4 text-xs text-gray-400 mb-2">Invite friends and earn rewards!</div>
      <div className="bg-[#232b3b] rounded-xl mx-4 p-4 mb-4 flex flex-col items-center">
        <div className="text-xs text-gray-400 mb-1">Your Referral Code</div>
        <div className="font-mono text-lg font-bold bg-[#181f2a] px-4 py-2 rounded-lg mb-2">{data?.referralCode || '-'}</div>
        <div className="flex gap-2">
          <button
            className="text-xs text-blue-400 underline"
            onClick={() => {
              navigator.clipboard.writeText(data?.referralCode || '');
              toast.success('Referral code copied!');
            }}
          >Copy Code</button>
          <button
            className="text-xs text-blue-400 underline"
            onClick={async () => {
              const isTelegram = window.location.search.includes('utm=telegram');
              const username = data?.referralCode || '';
              let shareUrl = '';
              let cta = '';
              if (isTelegram && username) {
                shareUrl = `https://t.me/cointwobot?start=ref${username}`;
                cta = `Join and earn $3 + $1 per invite! 🔗 ${shareUrl}`;
              } else if (address) {
                shareUrl = `https://yourdapp.com/?ref=${address}`;
                cta = `Join and earn $3 + $1 per invite! 🔗 ${shareUrl}`;
              }
              if (navigator.share) {
                try {
                  await navigator.share({ title: 'CoinTwo Invite', text: cta, url: shareUrl });
                } catch {}
              } else {
                await navigator.clipboard.writeText(cta);
                toast.success('Referral link copied!');
              }
            }}
          >Share</button>
        </div>
      </div>
      <div className="px-4 text-sm font-bold mb-2">Referral Stats</div>
      <div className="flex justify-between px-4 mb-4">
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold">{data?.totalReferral ?? '-'}</div>
          <div className="text-xs text-gray-400">Friends</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold">{data?.totalCompleted ?? '-'}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
      </div>
      <div className="px-4 text-sm font-bold mb-2">Referral Progress</div>
      {loading && <div className="text-center text-gray-400">Loading...</div>}
      {error && <div className="text-center text-red-400">{error}</div>}
      <div className="space-y-2 px-4 pb-24">
        {data?.referrals?.length === 0 && <div className="text-center text-gray-400">No referrals yet.</div>}
        {data?.referrals?.map((r: any, i: number) => (
          <div key={i} className="flex items-center bg-[#232b3b] rounded-xl p-4">
            <div className="flex-1">
              <div className="font-bold text-base">{r.name || 'No Name'} <span className="text-xs text-gray-400">({r.address.slice(0, 8)}...{r.address.slice(-4)})</span></div>
              <div className="text-xs text-gray-400">Status: {r.status === 'completed' ? <span className="text-green-400 font-bold">Completed</span> : r.status === 'in_progress' ? <span className="text-yellow-400 font-bold">In Progress</span> : <span className="text-gray-400">Not Started</span>}</div>
            </div>
            {r.rewardEligible && !r.rewardSent && <span className="text-blue-400 text-xs font-bold flex items-center"><FaGift className="mr-1" />$1 Eligible</span>}
            {r.rewardSent && <span className="text-green-400 text-xs font-bold flex items-center"><FaCheckCircle className="mr-1" />$1 Sent</span>}
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-[#232b3b] flex justify-around items-center py-2 border-t border-[#232b3b] z-10">
        <button className="flex flex-col items-center text-gray-400">
          <FaWallet className="text-xl" />
          <span className="text-xs">Wallet</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <FaTasks className="text-xl" />
          <span className="text-xs">Task</span>
        </button>
        <button className="flex flex-col items-center text-blue-400">
          <FaUserFriends className="text-xl" />
          <span className="text-xs">Referral</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <FaBars className="text-xl" />
          <span className="text-xs">Menu</span>
        </button>
      </div>
      <div className="text-center text-xs text-gray-500 mt-2 mb-1">@cointwobot</div>
    </div>
  );
} 