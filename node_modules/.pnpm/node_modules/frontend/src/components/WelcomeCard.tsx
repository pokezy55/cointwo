import { useAuth } from '../context/AuthContext';
import { ethers, isHexString } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function WelcomeCard() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [importValue, setImportValue] = useState('');
  const [importError, setImportError] = useState('');

  const handleCreateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    const newUser = { address: wallet.address, privateKey: wallet.privateKey };
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
      const newUser = { address: wallet.address, privateKey: wallet.privateKey };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      navigate('/');
    } catch (e) {
      setImportError('Invalid private key or seed phrase');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="w-full max-w-xs bg-[#232b3b] rounded-2xl p-8 shadow-xl flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome to CoinTwo</h1>
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
} 