import { Info } from 'phosphor-react';

interface TokenItemProps {
  token: any;
  price?: number;
}

export default function TokenItem({ token, price }: TokenItemProps) {
  return (
    <div className="flex items-center justify-between bg-[#1A2236] rounded-xl px-4 py-3 shadow-md ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <img src={token.logo} alt={token.symbol} className="w-10 h-10 rounded-full border border-white/10" />
        <div>
          <div className="font-semibold text-base flex items-center gap-1 text-white">
            {token.name}
            <button
              className="ml-1 text-gray-400 hover:text-blue-400 focus:outline-none"
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
              onTouchStart={() => {}}
            >
              <Info size={16} />
            </button>
          </div>
          <div className="text-xs text-gray-400 font-mono">{token.symbol}</div>
        </div>
      </div>
      <div className="text-right min-w-[90px]">
        <div className="font-mono text-base text-white">{token.balance?.toFixed(4)}</div>
        <div className="text-xs text-gray-400">{price ? `$${(token.balance * price).toFixed(2)}` : '-'}</div>
      </div>
    </div>
  );
} 