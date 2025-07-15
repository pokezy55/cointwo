import { useState } from 'react';
import { Button } from 'ui/Button';

const SendForm = () => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Alamat Tujuan"
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={to}
        onChange={e => setTo(e.target.value)}
      />
      <input
        type="number"
        placeholder="Jumlah Token"
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <Button className="w-full py-3 text-lg">Kirim</Button>
    </form>
  );
};

export default SendForm; 