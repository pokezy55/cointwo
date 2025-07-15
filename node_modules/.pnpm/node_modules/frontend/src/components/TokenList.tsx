import React, { useEffect, useState } from 'react';
import { Card } from 'ui/Card';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

export const TokenList: React.FC<{ address?: string; chain?: string }> = ({ address, chain = 'ethereum' }) => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    api.get('/wallet/balance', { params: { address, chain } })
      .then(res => setBalance(res.data.native))
      .catch(err => {
        setError(err.error || 'Gagal fetch saldo');
        toast.error(err.error || 'Gagal fetch saldo');
      })
      .finally(() => setLoading(false));
  }, [address, chain]);

  return (
    <Card className="mb-4">
      <h2 className="text-lg font-bold mb-2">Token List</h2>
      {!address && <div className="text-slate-500">(Masukkan wallet address untuk cek saldo)</div>}
      {loading && (
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-6 w-24 bg-slate-200 rounded" />
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
      {balance && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg">{balance}</span>
          <span className="text-slate-500">ETH</span>
        </div>
      )}
    </Card>
  );
}; 