import { useState, useEffect } from 'react';
import { Wallet, Eye, EyeSlash, Copy } from 'phosphor-react';
import { ethers, isHexString } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import "../types/telegram.d.ts";

function isTelegramWebApp() {
  return typeof window !== 'undefined' && !!window?.Telegram?.WebApp;
}

const AuthPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'landing'|'creating'|'show-phrase'|'import'>('landing');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [importError, setImportError] = useState('');
  const [tgUser, setTgUser] = useState<any>(null);
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isTelegramWebApp()) {
      const tg = window?.Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        setTgUser(tg.initDataUnsafe?.user);
        setUser((prev: any) => ({ ...prev, telegram: tg.initDataUnsafe?.user }));
      }
    } else {
      setFallback(true);
    }
  }, [setUser]);

  useEffect(() => {
    if (user?.address) {
      navigate('/');
    }
  }, [user, navigate]);

  // --- Create Wallet Flow ---
  const handleCreateWallet = async () => {
    setStep('creating');
    setTimeout(() => {
      const wallet = ethers.Wallet.createRandom();
      setSeedPhrase(wallet.mnemonic?.phrase || '');
      setStep('show-phrase');
    }, 1200);
  };

  const handleDone = () => {
    if (!checkbox) return;
    const wallet = ethers.Wallet.fromPhrase(seedPhrase);
    const newUser = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      telegram: tgUser,
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    navigate('/');
  };

  // --- Import Wallet Flow ---
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

  // --- Copy Seed Phrase ---
  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
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

  if (!tgUser) {
    return <div className="min-h-screen flex items-center justify-center bg-[#181A20] text-white">Loading Telegram user...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A20] text-white font-sans px-2">
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl flex flex-col gap-6 items-center border border-white/10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Wallet size={64} className="text-blue-500 mb-2 drop-shadow-lg" />
        <h1 className="text-2xl font-bold mb-2 text-center tracking-tight">Welcome to CoinTwo Wallet</h1>
        <div className="text-center text-gray-400 text-base mb-2">Your secure, multi-chain wallet powered by Telegram.</div>
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col gap-4"
            >
              <button
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                onClick={handleCreateWallet}
              >
                Create Wallet
              </button>
              <button
                className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-lg shadow hover:bg-white/20 active:scale-95 transition-all"
                onClick={() => setStep('import')}
              >
                Import Wallet
              </button>
            </motion.div>
          )}
          {step === 'creating' && (
            <motion.div
              key="creating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <div className="flex items-center gap-2 text-lg font-semibold text-blue-400 animate-pulse">
                Generating wallet
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
          {step === 'show-phrase' && (
            <motion.div
              key="show-phrase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <div className="w-full bg-[#232b3b] rounded-xl p-4 flex flex-col gap-2 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Seed Phrase</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg tracking-wider select-all">
                    {showPhrase ? seedPhrase : seedPhrase.replace(/\S/g, '•')}
                  </span>
                  <button
                    className="ml-2 p-1 rounded hover:bg-white/10"
                    onClick={() => setShowPhrase(v => !v)}
                    aria-label={showPhrase ? 'Hide phrase' : 'Show phrase'}
                  >
                    {showPhrase ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </button>
                  <button
                    className="ml-1 p-1 rounded hover:bg-white/10"
                    onClick={handleCopy}
                    aria-label="Copy phrase"
                  >
                    <Copy size={20} />
                  </button>
                </div>
                {copied && <div className="text-green-400 text-xs mt-1">Copied!</div>}
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={checkbox}
                  onChange={e => setCheckbox(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-0 border-gray-400 bg-[#181A20]"
                />
                <span className="text-sm text-gray-300">I already saved the seed phrase</span>
              </label>
              <button
                className={`w-full py-3 rounded-2xl font-bold text-lg shadow-lg transition-all ${checkbox ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 active:scale-95' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                onClick={handleDone}
                disabled={!checkbox}
              >
                Done
              </button>
            </motion.div>
          )}
          {step === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <input
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-[#232b3b] text-white placeholder-gray-400"
                placeholder="Seed phrase or Private Key"
                value={importValue}
                onChange={e => setImportValue(e.target.value)}
                autoFocus
              />
              <button
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                onClick={handleImportWallet}
              >
                Import Wallet
              </button>
              {importError && <div className="text-red-400 text-xs text-center mt-1">{importError}</div>}
              <button
                className="w-full py-2 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 active:scale-95 transition-all mt-2"
                onClick={() => setStep('landing')}
              >
                Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="text-xs text-gray-500 text-center mt-2">This wallet is powered by Telegram WebApp. Your keys are stored securely on your device only.</div>
      </motion.div>
    </div>
  );
};

export default AuthPage; 