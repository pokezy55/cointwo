import { Trophy } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#101828] max-w-md mx-auto px-2 py-8 flex flex-col items-center justify-center text-white font-sans rounded-2xl shadow-xl">
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full flex flex-col items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Leaderboard</h1>
        <div className="text-gray-400 text-base mb-2">Track top users by XP & level</div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="bg-white/10 backdrop-blur-md rounded-full p-6 shadow-lg mb-2">
          <Trophy size={64} className="text-yellow-400 drop-shadow" />
        </motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-col items-center gap-4 w-full">
        <div className="text-2xl font-bold text-center mb-2 animate-pulse">Coming Soon</div>
        <button onClick={() => navigate('/task')} className="mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all">Back to Tasks</button>
      </motion.div>
    </div>
  );
} 