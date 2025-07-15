import React from 'react';

interface TokenOption {
  symbol: string;
  address: string;
}

interface TokenSelectProps {
  options: TokenOption[];
  value: string;
  onChange: (address: string) => void;
  className?: string;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({ options, value, onChange, className = '' }) => (
  <select
    className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-150 ${className}`}
    value={value}
    onChange={e => onChange(e.target.value)}
  >
    {options.map(opt => (
      <option key={opt.address} value={opt.address}>{opt.symbol}</option>
    ))}
  </select>
); 