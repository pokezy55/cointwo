import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from '../components/TaskCard';
import { Star } from 'phosphor-react';

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
    <div className="min-h-screen bg-[#10141f] max-w-md mx-auto px-4 py-6 flex flex-col text-white font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Your Tasks</h1>
        <div className="text-gray-400 text-sm">Complete tasks to earn rewards.</div>
        <div className="flex gap-2 mt-2">
          <button className={`px-3 py-1 rounded ${!showCampaign && !showLeaderboard ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'}`} onClick={() => { setShowCampaign(false); setShowLeaderboard(false); }}>Tasks</button>
          <button className={`px-3 py-1 rounded ${showCampaign ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'}`} onClick={() => { setShowCampaign(true); setShowLeaderboard(false); }}>Campaigns</button>
          <button className={`px-3 py-1 rounded ${showLeaderboard ? 'bg-green-600 text-white' : 'bg-zinc-800 text-gray-400'}`} onClick={() => { setShowLeaderboard(true); setShowCampaign(false); }}>Leaderboard</button>
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
      <div className="flex-1 flex flex-col gap-4">
        <AnimatePresence>
          {loading && !showLeaderboard ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : showLeaderboard ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2 font-bold text-blue-400"><Star size={18} />Leaderboard</div>
              <div className="flex flex-col gap-1">
                {leaderboard.length === 0 && <div className="text-gray-500">No leaderboard data.</div>}
                {leaderboard.map((u, i) => (
                  <div key={u.address} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${u.isActive ? 'bg-blue-900 text-white font-bold' : 'bg-zinc-900 text-gray-200'}`}>
                    <span className="w-6 text-center">{u.rank}</span>
                    <span className="flex-1">{u.username}</span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-blue-700 text-xs font-bold"><Star size={14} />{u.level}</span>
                    <span className="text-xs">XP: {u.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : showCampaign ? (
            campaigns.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-500 py-8">No campaigns found.</motion.div>
            ) : (
              campaigns.map(camp => <TaskCard key={camp.id} task={camp} showLeaderboard={false} />)
            )
          ) : (
            tasks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-500 py-8">No tasks found.</motion.div>
            ) : (
              tasks.map(task => <TaskCard key={task.id} task={task} />)
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 