import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ethers, isHexString } from 'ethers';
import { useNavigate } from 'react-router-dom';
import "../types/telegram.d.ts";

function isTelegramWebApp() {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Cek param ref_username dari URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refUsername = params.get('ref_username');
    if (refUsername) {
      localStorage.setItem('ref_username', refUsername);
    }
  }, []);

  // Dummy login handler
  const handleLogin = () => {
    const refUsername = localStorage.getItem('ref_username');
    const user = { id: 'dummy-id', address: '0x123...', email };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    if (refUsername) localStorage.removeItem('ref_username');
  };

  // Handler Create Wallet
  const handleCreateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    const user = { address: wallet.address, privateKey: wallet.privateKey };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/');
  };

  // Handler Import Wallet
  const [importValue, setImportValue] = useState('');
  const [importError, setImportError] = useState('');
  const handleImportWallet = () => {
    setImportError('');
    try {
      let wallet;
      if (isHexString(importValue) && importValue.length === 66) {
        wallet = new ethers.Wallet(importValue);
      } else {
        wallet = ethers.Wallet.fromPhrase(importValue);
      }
      const user = { address: wallet.address, privateKey: wallet.privateKey };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (e) {
      setImportError('Invalid private key or seed phrase');
    }
  };

  if (isTelegramWebApp()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#10141f] text-white">
        <div className="bg-[#181f2a] rounded-2xl p-8 shadow-xl w-full max-w-xs flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Welcome to CoinTwo</h1>
          <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-lg" onClick={handleCreateWallet}>Create Wallet</button>
          <div className="flex flex-col gap-2 mt-2">
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#10141f] text-white"
              placeholder="Seed phrase or Private Key"
              value={importValue}
              onChange={e => setImportValue(e.target.value)}
            />
            <button className="w-full py-3 rounded-xl bg-gray-700 text-white font-bold text-lg" onClick={handleImportWallet}>Import Wallet</button>
            {importError && <div className="text-red-400 text-xs text-center mt-1">{importError}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Browser mode: email login, dark mode
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#10141f] text-white">
      <div className="w-full max-w-md bg-[#181f2a] rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-8 text-center">Login</h1>
        <form className="w-full flex flex-col gap-5" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-5 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#10141f] text-lg shadow"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-5 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#10141f] text-lg shadow"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition mb-2 mt-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth; 