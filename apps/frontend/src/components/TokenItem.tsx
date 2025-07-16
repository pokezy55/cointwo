import { Info } from 'phosphor-react';
import { useState } from 'react';

interface TokenItemProps {
  token: any;
  price?: number;
}

export default function TokenItem({ token, price }: TokenItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition rounded-2xl px-4 py-3 shadow-sm relative ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <img src={token.logo} alt={token.symbol} className="w-9 h-9 rounded-full border border-white/10" />
        <div>
          <div className="font-semibold text-base flex items-center gap-1">
            {token.name}
            <button
              className="ml-1 text-gray-400 hover:text-blue-400 focus:outline-none"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onTouchStart={() => setShowTooltip(v => !v)}
            >
              <Info size={18} />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-12 z-20 bg-zinc-900 text-xs text-white rounded-xl px-4 py-2 shadow-lg w-64 max-w-xs animate-fade-in border border-white/10">
                <div><b>Symbol:</b> {token.symbol}</div>
                <div><b>Name:</b> {token.name}</div>
                <div><b>Decimals:</b> {token.decimals ?? '-'}</div>
                <div className="break-all"><b>Address:</b> {token.address}</div>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400 font-mono">{token.symbol}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-base">{token.balance?.toFixed(4)}</div>
        <div className="text-xs text-gray-400">{price ? `$${(token.balance * price).toFixed(2)}` : '-'}</div>
      </div>
    </div>
  );
} 