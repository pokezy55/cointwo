import React, { useState } from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { Input } from 'ui/Input';
import { TokenSelect } from 'ui/TokenSelect';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

const TOKENS = [
  { symbol: 'ETH', address: '' },
  // Tambahkan token ERC20 lain jika perlu
];

export const SendForm: React.FC<{ user: any }> = ({ user }) => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(TOKENS[0].address);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/wallet/send', {
        privateKey: user.privateKey,
        to,
        amount,
        tokenAddress: token || undefined,
        chain: 'ethereum', // TODO: dynamic
      });
      toast.success('Transaksi berhasil! TX: ' + res.data.txHash);
      setTo('');
      setAmount('');
    } catch (err: any) {
      toast.error(err.error || 'Gagal kirim token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <h2 className="text-lg font-bold mb-2">Kirim Token</h2>
      <form className="space-y-2" onSubmit={handleSend}>
        <TokenSelect options={TOKENS} value={token} onChange={setToken} />
        <Input label="Alamat Tujuan" placeholder="0x..." value={to} onChange={e => setTo(e.target.value)} required />
        <Input label="Jumlah" placeholder="0.0" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
        <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Kirim'}</Button>
      </form>
    </Card>
  );
}; 