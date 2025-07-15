import React, { useState } from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { Input } from 'ui/Input';
import { TokenSelect } from 'ui/TokenSelect';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

const TOKENS = [
  { symbol: 'ETH', address: '' },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  // Tambahkan token lain jika perlu
];

export const SwapForm: React.FC<{ user: any }> = ({ user }) => {
  const [fromToken, setFromToken] = useState(TOKENS[0].address);
  const [toToken, setToToken] = useState(TOKENS[1].address);
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/wallet/swap', {
        privateKey: user.privateKey,
        fromToken,
        toToken,
        amountIn,
        chain: 'ethereum', // TODO: dynamic
        slippage,
      });
      toast.success('Swap berhasil! TX: ' + res.data.txHash);
      setAmountIn('');
    } catch (err: any) {
      toast.error(err.error || 'Gagal swap token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-bold mb-2">Swap Token</h2>
      <form className="space-y-2" onSubmit={handleSwap}>
        <TokenSelect options={TOKENS} value={fromToken} onChange={setFromToken} />
        <TokenSelect options={TOKENS} value={toToken} onChange={setToToken} />
        <Input label="Jumlah" placeholder="0.0" type="number" value={amountIn} onChange={e => setAmountIn(e.target.value)} required />
        <Input label="Slippage (%)" type="number" value={slippage} onChange={e => setSlippage(Number(e.target.value))} min={0.1} max={5} step={0.1} />
        <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Swap'}</Button>
      </form>
    </Card>
  );
}; 