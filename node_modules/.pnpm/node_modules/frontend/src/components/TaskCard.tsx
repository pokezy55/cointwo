import { motion } from 'framer-motion';
import { Info } from 'phosphor-react';
import { useState } from 'react';

const statusColor = {
  pending: 'bg-gray-600 text-gray-100',
  eligible: 'bg-blue-600 text-white',
  completed: 'bg-green-600 text-white',
  reward: 'bg-purple-600 text-white',
  sent: 'bg-green-700 text-white',
};

export default function TaskCard({ task, showLeaderboard }: { task: any, showLeaderboard?: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);
  let badge = 'Pending', badgeClass = statusColor.pending;
  if (task.status === 'eligible') { badge = 'Eligible'; badgeClass = statusColor.eligible; }
  if (task.status === 'completed') { badge = 'Completed'; badgeClass = statusColor.completed; }
  if (task.status === 'reward_sent') { badge = 'Reward Sent'; badgeClass = statusColor.sent; }

  // Dummy progress (0-100)
  const progress = task.progress ?? 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}
      className="bg-zinc-900 rounded-2xl p-5 shadow flex flex-col gap-2 relative">
      <div className="flex items-center justify-between mb-1">
        <div className="font-bold text-lg flex items-center gap-1">
          {task.title}
          <button
            className="ml-1 text-gray-400 hover:text-blue-400"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onTouchStart={() => setShowTooltip(v => !v)}
          >
            <Info size={16} />
          </button>
          {showTooltip && (
            <div className="absolute left-0 top-12 z-20 bg-zinc-800 text-xs text-white rounded-xl px-4 py-2 shadow-lg w-64 max-w-xs animate-fade-in">
              <div><b>Detail:</b> {task.detail || 'No description.'}</div>
              {task.requirement && <div><b>Requirement:</b> {task.requirement}</div>}
              {task.reward && <div><b>Reward:</b> ${task.reward}</div>}
            </div>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{badge}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-gray-400 text-sm">Reward</div>
        <div className="font-bold text-base text-green-400">${task.reward}</div>
      </div>
      {/* Progress bar */}
      {typeof progress === 'number' && (
        <div className="w-full h-2 bg-zinc-800 rounded-full mt-2">
          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {/* Dummy leaderboard */}
      {showLeaderboard && (
        <div className="mt-3 bg-zinc-800 rounded-xl p-3">
          <div className="font-bold text-sm mb-1">Leaderboard</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2"><span className="font-bold">1.</span> Alice <span className="ml-auto text-xs text-blue-400">Level 5</span> <span className="ml-2 text-xs text-green-400">XP 1200</span></div>
            <div className="flex items-center gap-2"><span className="font-bold">2.</span> Bob <span className="ml-auto text-xs text-blue-400">Level 4</span> <span className="ml-2 text-xs text-green-400">XP 900</span></div>
            <div className="flex items-center gap-2"><span className="font-bold">3.</span> You <span className="ml-auto text-xs text-blue-400">Level 3</span> <span className="ml-2 text-xs text-green-400">XP 600</span></div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 