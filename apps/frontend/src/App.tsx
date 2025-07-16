import { useState } from 'react';
import WalletPage from './pages/Wallet';
import TaskPage from './pages/Task';
import ReferralPage from './pages/Referral';
import MenuPage from './pages/Menu';
import { AuthProvider } from './context/AuthContext';

const TABS = ['wallet', 'task', 'referral', 'menu'] as const;
type Tab = typeof TABS[number];

function App() {
  const [tab, setTab] = useState<Tab>('wallet');

  return (
    <AuthProvider>
      {tab === 'wallet' && <WalletPage />}
      {tab === 'task' && <TaskPage />}
      {tab === 'referral' && <ReferralPage />}
      {tab === 'menu' && <MenuPage />}
      {/* TabBar global, override tab state */}
      <div className="fixed bottom-0 left-0 w-full bg-[#232b3b] flex justify-around items-center py-2 border-t border-[#232b3b] z-50">
        <button className={`flex flex-col items-center ${tab === 'wallet' ? 'text-blue-400' : 'text-gray-400'}`} onClick={() => setTab('wallet')}>
          <span className="material-icons text-xl">account_balance_wallet</span>
          <span className="text-xs">Wallet</span>
        </button>
        <button className={`flex flex-col items-center ${tab === 'task' ? 'text-blue-400' : 'text-gray-400'}`} onClick={() => setTab('task')}>
          <span className="material-icons text-xl">task</span>
          <span className="text-xs">Task</span>
        </button>
        <button className={`flex flex-col items-center ${tab === 'referral' ? 'text-blue-400' : 'text-gray-400'}`} onClick={() => setTab('referral')}>
          <span className="material-icons text-xl">group</span>
          <span className="text-xs">Referral</span>
        </button>
        <button className={`flex flex-col items-center ${tab === 'menu' ? 'text-blue-400' : 'text-gray-400'}`} onClick={() => setTab('menu')}>
          <span className="material-icons text-xl">menu</span>
          <span className="text-xs">Menu</span>
        </button>
      </div>
    </AuthProvider>
  );
}

export default App;
