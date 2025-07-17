import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from '../components/TaskCard';
import { Star } from 'phosphor-react';
import NetworkBadge from '../components/NetworkBadge';

export default function TaskPage() {
  const { user, selectedNetwork, NETWORKS, setSelectedNetwork } = useAuth();
  const address = user?.address;
  const [tasks, setTasks] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [season, setSeason] = useState('all');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const res = await fetch(`/task/status?user=${address}&chain=${selectedNetwork.name}`);
        const data = await res.json();
        setTasks(data.tasks || []);
        setCampaigns(data.campaigns || []);
      } catch {
        setTasks([]);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }
    if (!showLeaderboard) fetchTasks();
  }, [address, selectedNetwork, showLeaderboard]);

  useEffect(() => {
    async function fetchLeaderboard() {
      const res = await fetch(`/leaderboard?chain=${selectedNetwork.name}&limit=20${season !== 'all' ? `&season=${season}` : ''}&address=${address}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    }
    if (showLeaderboard) fetchLeaderboard();
  }, [selectedNetwork, season, showLeaderboard, address]);

  return (
    <div className="min-h-screen bg-[#101828] max-w-md mx-auto px-2 py-4 flex flex-col text-white font-sans rounded-2xl shadow-xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Your Tasks</h1>
            <div className="text-gray-400 text-sm">Complete tasks, earn rewards, and climb the leaderboard!</div>
          </div>
          <NetworkBadge name={selectedNetwork.name} logo={selectedNetwork.logo} />
        </div>
        <div className="flex gap-2 mt-2">
          <button className={`flex-1 py-2 rounded-xl font-semibold transition-all ${!showCampaign && !showLeaderboard ? 'bg-blue-600 text-white shadow' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`} onClick={() => { setShowCampaign(false); setShowLeaderboard(false); }}>Tasks</button>
          <button className={`flex-1 py-2 rounded-xl font-semibold transition-all ${showCampaign ? 'bg-blue-600 text-white shadow' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`} onClick={() => { setShowCampaign(true); setShowLeaderboard(false); }}>Campaigns</button>
          <button className={`flex-1 py-2 rounded-xl font-semibold transition-all ${showLeaderboard ? 'bg-green-600 text-white shadow' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`} onClick={() => { setShowLeaderboard(true); setShowCampaign(false); }}>Leaderboard</button>
        </div>
        <div className="flex gap-2 mt-2 items-center">
          <span className="text-xs text-gray-400">Network:</span>
          <select className="bg-white/10 text-white rounded px-2 py-1 focus:outline-none" value={selectedNetwork.chainId} onChange={e => setSelectedNetwork(NETWORKS.find((n: any) => n.chainId === +e.target.value))}>
            {NETWORKS.map((n: any) => <option key={n.chainId} value={n.chainId}>{n.name}</option>)}
          </select>
          <span className="text-xs text-gray-400">Season:</span>
          <select className="bg-white/10 text-white rounded px-2 py-1 focus:outline-none" value={season} onChange={e => setSeason(e.target.value)}>
            <option value="all">All</option>
            <option value="weekly">Weekly</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>
      </motion.div>
      {/* Task List / Campaign / Leaderboard */}
      <div className="flex-1 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {loading && !showLeaderboard ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-500 py-8">Loading...</motion.div>
          ) : showLeaderboard ? (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2 font-bold text-blue-400 text-lg"><Star size={20} />Leaderboard</div>
              <div className="flex flex-col gap-1">
                {leaderboard.length === 0 && <div className="text-gray-500">No leaderboard data.</div>}
                {leaderboard.map((u) => (
                  <div key={u.address} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${u.isActive ? 'bg-blue-900 text-white font-bold' : 'bg-white/10 text-gray-200'}`}>
                    <span className="w-6 text-center">{u.rank}</span>
                    <span className="flex-1">{u.username}</span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-blue-700 text-xs font-bold"><Star size={14} />{u.level}</span>
                    <span className="text-xs">XP: {u.xp}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : showCampaign ? (
            campaigns.length === 0 ? (
              <motion.div key="no-campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-500 py-8">No campaigns found.</motion.div>
            ) : (
              campaigns.map(camp => <TaskCard key={camp.id} task={camp} showLeaderboard={false} />)
            )
          ) : (
            tasks.length === 0 ? (
              <motion.div key="no-tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-500 py-8">No tasks found. 🚀<br/>Start your first campaign to earn rewards!</motion.div>
            ) : (
              tasks.map(task => <TaskCard key={task.id} task={task} />)
            )
          )}
        </AnimatePresence>
      </div>
      {/* Dummy Leaderboard Button */}
      <motion.button whileTap={{ scale: 0.97 }} className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all" onClick={() => setShowLeaderboard(true)}>
        View Leaderboard
      </motion.button>
    </div>
  );
} 