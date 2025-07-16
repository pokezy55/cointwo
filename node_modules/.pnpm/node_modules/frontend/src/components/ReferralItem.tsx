import { Info } from 'phosphor-react';
import { useState } from 'react';

const statusColor = {
  progress: 'bg-blue-600 text-white',
  completed: 'bg-green-600 text-white',
};
const rewardColor = {
  eligible: 'bg-yellow-500 text-white',
  sent: 'bg-green-600 text-white',
};

export default function ReferralItem({ referral, chain }: { referral: any, chain: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const badge = referral.status === 'completed' ? 'Completed' : 'In Progress';
  const badgeClass = referral.status === 'completed' ? statusColor.completed : statusColor.progress;
  const rewardBadge = referral.reward === 'sent' ? '$1 Sent' : '$1 Eligible';
  const rewardClass = referral.reward === 'sent' ? rewardColor.sent : rewardColor.eligible;
  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-2 shadow relative">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-base flex items-center gap-1">
          {referral.name || referral.username || referral.email || 'Friend'}
          <button
            className="ml-1 text-gray-400 hover:text-blue-400"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onTouchStart={() => setShowTooltip(v => !v)}
          >
            <Info size={16} />
          </button>
          {showTooltip && (
            <div className="absolute left-0 top-10 z-20 bg-zinc-800 text-xs text-white rounded-xl px-4 py-2 shadow-lg w-64 max-w-xs animate-fade-in">
              <div><b>Referral:</b> {referral.name || referral.username || referral.email || 'Friend'}</div>
              <div><b>Address:</b> {referral.address}</div>
              <div><b>Status:</b> {badge}</div>
              <div><b>Reward:</b> {rewardBadge}</div>
              <div><b>Chain:</b> {chain}</div>
            </div>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{badge}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-400">{referral.address?.slice(0, 6)}...{referral.address?.slice(-4)}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rewardClass}`}>{rewardBadge}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-blue-300">{chain}</span>
      </div>
    </div>
  );
} 