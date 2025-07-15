import React from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { Input } from 'ui/Input';
import { TokenSelect } from 'ui/TokenSelect';
import { TokenList } from './TokenList';
import { TaskProgressCard } from './TaskProgressCard';
import { ReferralStatsCard } from './ReferralStatsCard';

// Placeholder komponen utama
const SendForm = () => (
  <Card className="mb-4">
    <h2 className="text-lg font-bold mb-2">Kirim Token</h2>
    <form className="space-y-2">
      <TokenSelect options={[{symbol:'ETH',address:'0x0'}]} value={'0x0'} onChange={()=>{}} />
      <Input label="Alamat Tujuan" placeholder="0x..." />
      <Input label="Jumlah" placeholder="0.0" type="number" />
      <Button type="submit">Kirim</Button>
    </form>
  </Card>
);

const SwapForm = () => (
  <Card>
    <h2 className="text-lg font-bold mb-2">Swap Token</h2>
    <form className="space-y-2">
      <TokenSelect options={[{symbol:'ETH',address:'0x0'}]} value={'0x0'} onChange={()=>{}} />
      <TokenSelect options={[{symbol:'USDT',address:'0x1'}]} value={'0x1'} onChange={()=>{}} />
      <Input label="Jumlah" placeholder="0.0" type="number" />
      <Button type="submit">Swap</Button>
    </form>
  </Card>
);

interface DashboardProps {
  user: { email: string; address: string; id?: string };
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const address = user.address;
  const userId = user.id;
  return (
    <div className="max-w-5xl mx-auto py-8 px-2 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <TokenList address={address} />
        <SendForm />
      </div>
      <div className="space-y-6">
        <SwapForm />
        <TaskProgressCard userId={userId} />
        <ReferralStatsCard userId={userId} />
      </div>
    </div>
  );
}; 