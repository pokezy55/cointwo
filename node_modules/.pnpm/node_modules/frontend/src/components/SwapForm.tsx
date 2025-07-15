import { useState } from 'react';
import { Button } from 'ui/Button';

const SwapForm = () => {
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Token Asal"
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={fromToken}
        onChange={e => setFromToken(e.target.value)}
      />
      <input
        type="text"
        placeholder="Token Tujuan"
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={toToken}
        onChange={e => setToToken(e.target.value)}
      />
      <input
        type="number"
        placeholder="Jumlah"
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <Button className="w-full py-3 text-lg">Swap</Button>
    </form>
  );
};

export default SwapForm; 