import { ArrowDown, ArrowUp, ArrowsLeftRight } from 'phosphor-react';

interface HistoryItemProps {
  tx: any;
}

export default function HistoryItem({ tx }: HistoryItemProps) {
  // Dummy: type = 'in' | 'out' | 'swap'
  let icon = <ArrowDown size={20} className="text-green-400" />;
  if (tx.type === 'out') icon = <ArrowUp size={20} className="text-red-400" />;
  if (tx.type === 'swap') icon = <ArrowsLeftRight size={20} className="text-blue-400" />;
  return (
    <div className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="font-mono text-xs text-gray-400">{tx.hash?.slice(0, 8)}...{tx.hash?.slice(-6)}</div>
          <div className="text-xs text-gray-500">{tx.time}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-base">{tx.amount}</div>
        <div className="text-xs text-gray-400">{tx.symbol}</div>
      </div>
    </div>
  );
} 