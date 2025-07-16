import { Routes, Route, Navigate } from 'react-router-dom';
import WalletPage from './pages/Wallet';
import TaskPage from './pages/Task';
import ReferralPage from './pages/Referral';
import MenuPage from './pages/Menu';
import TelegramAuth from './pages/TelegramAuth';
import { AuthProvider } from './context/AuthContext';

function TabBar() {
  // ...tab bar code, sama seperti sebelumnya...
  // (bisa diimprove nanti)
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#232b3b] flex justify-around items-center py-2 border-t border-[#232b3b] z-50">
      {/* ...tab bar buttons... */}
    </div>
  );
}

function MainLayout() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WalletPage />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
      <TabBar />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<TelegramAuth />} />
        <Route path="/*" element={<MainLayout />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
