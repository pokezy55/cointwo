import { Wallet } from 'phosphor-react';
import { motion } from 'framer-motion';
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
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-xs bg-[#181a20] rounded-2xl p-8 shadow-md flex flex-col gap-6 items-center border border-white/10">
        <Wallet size={56} className="text-blue-500 mb-2" />
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome to Cointwo Wallet</h1>
        <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all" onClick={handleCreateWallet}>Create Wallet</button>
        <div className="flex flex-col gap-2 w-full">
          <input
            className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-[#10141f] text-white placeholder-gray-400"
            placeholder="Seed phrase or Private Key"
            value={importValue}
            onChange={e => setImportValue(e.target.value)}
          />
          <button className="w-full py-3 rounded-2xl bg-gray-700 text-white font-bold text-lg hover:bg-gray-600 active:scale-95 transition-all" onClick={handleImportWallet}>Import Wallet</button>
          {importError && <div className="text-red-400 text-xs text-center mt-1">{importError}</div>}
        </div>
      </div>
    </motion.div>
  );
} 