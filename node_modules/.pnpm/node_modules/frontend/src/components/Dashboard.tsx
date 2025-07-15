import React from 'react';
import { Card } from 'ui/Card';
import { TokenList } from './TokenList';
import { SendForm } from './SendForm';
import { SwapForm } from './SwapForm';
import { TaskProgressCard } from './TaskProgressCard';
import { ReferralStatsCard } from './ReferralStatsCard';

const Dashboard = ({ userId, address }: { userId: string; address: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white px-2 py-6">
    <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="col-span-1">
        <h2 className="text-lg font-bold mb-2">Token List</h2>
        <TokenList address={address} />
      </Card>
      <Card className="col-span-1">
        <h2 className="text-lg font-bold mb-2">Kirim Token</h2>
        <SendForm />
      </Card>
      <Card className="col-span-1">
        <h2 className="text-lg font-bold mb-2">Swap Token</h2>
        <SwapForm />
      </Card>
      <Card className="col-span-1">
        <TaskProgressCard userId={userId} />
        <ReferralStatsCard userId={userId} />
      </Card>
    </div>
  </div>
);

export default Dashboard; 