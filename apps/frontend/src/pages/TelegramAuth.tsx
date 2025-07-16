import { useState, useEffect } from 'react';
import { ethers, isHexString } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../types/telegram.d.ts";

function isTelegramWebApp() {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

const TelegramAuth = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [importValue, setImportValue] = useState('');
  const [importError, setImportError] = useState('');
  const [tgUser, setTgUser] = useState<any>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (isTelegramWebApp()) {
      const tg = window.Telegram.WebApp;
      if (tg?.initDataUnsafe?.user) {
        setTgUser(tg.initDataUnsafe.user);
        setUser((prev: any) => ({ ...prev, telegram: tg.initDataUnsafe.user }));
      }
    } else {
      setFallback(true);
    }
  }, [setUser]);

  useEffect(() => {
    // Jika sudah ada wallet di localStorage/context, redirect ke WalletPage
    if (user?.address) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCreateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    const newUser = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      telegram: tgUser,
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    navigate('/');
  };

  const handleImportWallet = () => {
    setImportError('');
    try {
      let wallet;
      if (isHexString(importValue) && importValue.length === 66) {
        wallet = new ethers.Wallet(importValue);
      } else {
        wallet = ethers.Wallet.fromPhrase(importValue);
      }
      const newUser = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        telegram: tgUser,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      navigate('/');
    } catch (e) {
      setImportError('Invalid private key or seed phrase');
    }
  };

  if (fallback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A20] text-white font-sans">
        <div className="bg-[#232b3b] rounded-2xl p-8 shadow-xl w-full max-w-xs flex flex-col gap-4 items-center">
          <h1 className="text-2xl font-bold mb-4 text-center">Telegram WebApp Required</h1>
          <p className="text-center text-gray-400">Please open this app from Telegram to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A20] text-white font-sans">
      <div className="bg-[#232b3b] rounded-2xl p-8 shadow-xl w-full max-w-xs flex flex-col gap-6 items-center animate-fade-in">
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome to CoinTwo</h1>
        {tgUser && (
          <div className="flex flex-col items-center mb-2">
            <span className="text-lg font-semibold">Hi, {tgUser.first_name}!</span>
            <span className="text-sm text-gray-400">@{tgUser.username}</span>
          </div>
        )}
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all" onClick={handleCreateWallet}>Create Wallet</button>
        <div className="flex flex-col gap-2 w-full">
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#181A20] text-white placeholder-gray-400"
            placeholder="Seed phrase or Private Key"
            value={importValue}
            onChange={e => setImportValue(e.target.value)}
          />
          <button className="w-full py-3 rounded-xl bg-gray-700 text-white font-bold text-lg hover:bg-gray-600 active:scale-95 transition-all" onClick={handleImportWallet}>Import Wallet</button>
          {importError && <div className="text-red-400 text-xs text-center mt-1">{importError}</div>}
        </div>
      </div>
    </div>
  );
};

export default TelegramAuth; 