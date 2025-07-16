import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MenuItem from '../components/MenuItem';
import { useEffect, useState } from 'react';

export default function MenuPage() {
  const { user, setUser, selectedNetwork, NETWORKS, setSelectedNetwork } = useAuth();
  const navigate = useNavigate();
  const avatar = user?.telegram?.photo_url;
  const username = user?.telegram?.username;
  const address = user?.address;
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [season, setSeason] = useState('all');

  useEffect(() => {
    async function fetchXP() {
      const res = await fetch(`/leaderboard?chain=${selectedNetwork.name}&limit=100&address=${address}${season !== 'all' ? `&season=${season}` : ''}`);
      const data = await res.json();
      const me = data.leaderboard.find((u: any) => u.address.toLowerCase() === address?.toLowerCase());
      if (me) {
        setXP(me.xp);
        setLevel(me.level);
      }
    }
    if (address) fetchXP();
  }, [address, selectedNetwork, season]);

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    toast.success('Logged out!');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#10141f] max-w-md mx-auto px-4 py-6 flex flex-col text-white font-sans">
      <div className="flex flex-col items-center mb-6">
        {avatar && <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full border border-zinc-700 mb-2" />}
        <div className="font-bold text-lg">@{username}</div>
        <div className="font-mono text-xs text-gray-400">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-blue-700 text-xs font-bold"><Star size={16} />Level {level}</span>
          <span className="text-xs text-gray-400">XP: {xp}</span>
        </div>
        <div className="w-full max-w-xs mt-2">
          <div className="h-2 bg-zinc-800 rounded-full">
            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min((xp % 20) * 5, 100)}%` }} />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="text-xs text-gray-400">Network:</span>
          <select className="bg-zinc-900 text-white rounded px-2 py-1" value={selectedNetwork.chainId} onChange={e => setSelectedNetwork(NETWORKS.find((n: any) => n.chainId === +e.target.value))}>
            {NETWORKS.map((n: any) => <option key={n.chainId} value={n.chainId}>{n.name}</option>)}
          </select>
          <span className="text-xs text-gray-400">Season:</span>
          <select className="bg-zinc-900 text-white rounded px-2 py-1" value={season} onChange={e => setSeason(e.target.value)}>
            <option value="all">All</option>
            <option value="weekly">Weekly</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <MenuItem icon={<Key size={20} />} label="Create New Wallet" onClick={() => navigate('/auth')} />
        <MenuItem icon={<Globe size={20} />} label="Switch Network" onClick={() => toast.info('Switch network from WalletPage!')} />
        <MenuItem icon={<SignOut size={20} />} label="Logout" onClick={handleLogout} danger />
      </div>
    </div>
  );
} 