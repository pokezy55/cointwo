import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Star, Key, Globe, SignOut, UploadSimple } from 'phosphor-react';
import MenuItem from '../components/MenuItem';
import { useEffect, useState } from 'react';
import NetworkBadge from '../components/NetworkBadge';

export default function MenuPage() {
  const { user, setUser, selectedNetwork } = useAuth();
  const navigate = useNavigate();
  const avatar = user?.telegram?.photo_url;
  const username = user?.telegram?.username;
  const address = user?.address;
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

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    toast.success('Logged out!');
    navigate('/auth');
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied!');
    }
  };

  return (
    <div className="min-h-screen bg-[#101828] max-w-md mx-auto px-2 py-4 flex flex-col text-white font-sans rounded-2xl shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col items-center mb-6">
        {avatar && <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-white/10 mb-2 shadow" />}
        <div className="font-bold text-lg">@{username}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-xs bg-[#1A2236] px-2 py-1 rounded-lg select-all tracking-tight cursor-pointer" onClick={handleCopyAddress} title="Copy address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-blue-700 text-xs font-bold"><Star size={16} />Level {level}</span>
          <span className="text-xs text-gray-400">XP: {xp}</span>
        </div>
        <div className="w-full max-w-xs mt-2">
          <div className="h-2 bg-zinc-800 rounded-full">
            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min((xp % 20) * 5, 100)}%` }} />
          </div>
        </div>
        <div className="mt-2"><NetworkBadge name={selectedNetwork.name} logo={selectedNetwork.logo} /></div>
      </div>
      {/* Menu List */}
      <div className="flex flex-col gap-3 bg-white/5 rounded-2xl p-4 shadow-md">
        <MenuItem icon={<Key size={22} />} label="Create New Wallet" onClick={() => navigate('/auth')} />
        <MenuItem icon={<UploadSimple size={22} />} label="Import Wallet" onClick={() => navigate('/auth')} />
        <div className="border-t border-white/10 my-2" />
        <MenuItem icon={<Globe size={22} />} label="Switch Network" onClick={() => toast.info('Switch network from WalletPage!')} />
        <div className="border-t border-white/10 my-2" />
        <MenuItem icon={<SignOut size={22} />} label="Logout" onClick={handleLogout} danger />
      </div>
    </div>
  );
} 