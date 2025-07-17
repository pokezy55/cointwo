import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaperPlaneRight, DownloadSimple, ArrowsLeftRight, Copy, CurrencyEth } from 'phosphor-react';
import tokenListRaw from '../assets/tokenList.json';
import ActionModal from '../components/ActionModal';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-toastify';
import TokenItem from '../components/TokenItem';
import HistoryItem from '../components/HistoryItem';
import NetworkBadge from '../components/NetworkBadge';
import { motion, AnimatePresence } from 'framer-motion';

const tokenList = tokenListRaw as any[];
const COINGECKO_IDS: { [symbol: string]: string } = {
  ETH: 'ethereum', USDT: 'tether', USDC: 'usd-coin', BNB: 'binancecoin', POL: 'matic-network', BASE: 'ethereum',
};

export default function WalletPage() {
  const { user, selectedNetwork } = useAuth();
  const address = user?.address;
  const avatar = user?.telegram?.photo_url;
  const name = user?.telegram?.first_name || '';
  const username = user?.telegram?.username || '';
  const [prices, setPrices] = useState<any>({});
  const [balances, setBalances] = useState<any>({});
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'token'|'history'>('token');
  const [history, setHistory] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [modal, setModal] = useState<null | 'send' | 'receive' | 'swap'>(null);

  // State untuk form Send Token
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // State untuk form Swap Token
  const [swapFrom, setSwapFrom] = useState('');
  const [swapTo, setSwapTo] = useState('');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  const prevTokenSymbols = useRef<string[]>([]);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const ids = Array.from(new Set(tokenList.map(t => COINGECKO_IDS[t.symbol]).filter(Boolean))).join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const data = await res.json();
        setPrices(data);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch {}
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!address) return;
    async function fetchBalances() {
      try {
        const res = await fetch(`/wallet/balance?address=${address}&chain=${selectedNetwork.name}`);
        const data = await res.json();
        const balMap: any = {};
        data.forEach((t: any) => { balMap[t.symbol] = t.balance; });
        setBalances(balMap);
      } catch {}
    }
    fetchBalances();
  }, [address, selectedNetwork.name]);

  useEffect(() => {
    const filtered = tokenList.filter((t: any) => t.chain === selectedNetwork.name);
    const withBalance = filtered.map((t: any) => ({ ...t, balance: parseFloat(balances[t.symbol] || '0') }));
    withBalance.sort((a: any, b: any) => (b.balance > 0 ? 1 : 0) - (a.balance > 0 ? 1 : 0) || (b.balance - a.balance));
    setTokens(withBalance);

    // --- Airdrop Detection ---
    const currentSymbols = withBalance.map(t => t.symbol);
    if (prevTokenSymbols.current.length > 0) {
      const newTokens = withBalance.filter(t => !prevTokenSymbols.current.includes(t.symbol) && t.balance > 0);
      newTokens.forEach(t => {
        setTokens(prev => {
          if (!prev.find(pt => pt.symbol === t.symbol)) {
            toast.info(`🎉 You received new token: $${t.symbol}`);
            return [...prev, t];
          }
          return prev;
        });
      });
    }
    prevTokenSymbols.current = currentSymbols;
  }, [balances, selectedNetwork.name]);

  useEffect(() => {
    if (!address) return;
    async function fetchHistory() {
      try {
        const res = await fetch(`/wallet/history?address=${address}&chain=${selectedNetwork.name}`);
        const data = await res.json();
        setHistory(data);
      } catch {
        setHistory([]);
      }
    }
    fetchHistory();
  }, [address, selectedNetwork.name]);

  useEffect(() => {
    async function fetchXP() {
      const res = await fetch(`/leaderboard?chain=${selectedNetwork.name}&limit=100&address=${address}`);
      const data = await res.json();
      const me = data.leaderboard.find((u: any) => u.address.toLowerCase() === address?.toLowerCase());
      if (me) {
        // Removed unused xp and level state
      }
    }
    if (address) fetchXP();
  }, [address, selectedNetwork]);

  // Regex EVM address
  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);
    if (!isValidAddress(sendAddress)) {
      setSendError('Invalid address');
      return;
    }
    if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
      setSendError('Invalid amount');
      return;
    }
    setSendLoading(true);
    try {
      const res = await fetch('/wallet/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: sendAddress, amount: sendAmount, chain: selectedNetwork.name, address })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Token sent successfully!');
        setSendAddress('');
        setSendAmount('');
        setModal(null);
      } else {
        setSendError(data.error || 'Failed to send token');
        toast.error(data.error || 'Failed to send token');
      }
    } catch (err) {
      setSendError('Network error');
      toast.error('Network error');
    } finally {
      setSendLoading(false);
    }
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwapError(null);
    if (!swapFrom || !swapTo || swapFrom === swapTo) {
      setSwapError('Select different tokens');
      return;
    }
    if (!swapAmount || isNaN(Number(swapAmount)) || Number(swapAmount) <= 0) {
      setSwapError('Invalid amount');
      return;
    }
    setSwapLoading(true);
    try {
      const res = await fetch('/wallet/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromToken: swapFrom, toToken: swapTo, amount: swapAmount, chain: selectedNetwork.name, address })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Swap successful!');
        setSwapFrom('');
        setSwapTo('');
        setSwapAmount('');
        setModal(null);
      } else {
        setSwapError(data.error || 'Failed to swap token');
        toast.error(data.error || 'Failed to swap token');
      }
    } catch (err) {
      setSwapError('Network error');
      toast.error('Network error');
    } finally {
      setSwapLoading(false);
    }
  };

  // Portfolio value
  const totalValue = tokens.reduce((sum, t) => sum + (t.balance * (prices[COINGECKO_IDS[t.symbol]]?.usd || 0)), 0);

  if (!address) return null;

  return (
    <div className="min-h-screen bg-[#101828] max-w-md mx-auto px-2 py-4 flex flex-col text-white font-sans rounded-2xl shadow-xl relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {avatar && (
            <img src={avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-white/10 object-cover shadow" />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-base leading-tight">{name}</span>
            <span className="text-xs text-blue-400">@{username}</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="font-mono text-xs bg-[#1A2236] px-2 py-1 rounded-lg select-all tracking-tight">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success('Address copied!');
                }}
                className="ml-1 p-1 rounded-lg hover:bg-white/10 transition text-blue-400"
                title="Copy address"
                aria-label="Copy address"
              >
                <Copy size={16} />
              </button>
              <NetworkBadge name={selectedNetwork.name} logo={selectedNetwork.logo} />
            </div>
          </div>
        </div>
      </motion.div>
      {/* Portfolio Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-2 mb-1 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg">
          <span className="text-3xl font-bold tracking-tight">${totalValue.toFixed(2)}</span>
          <CurrencyEth size={22} className="text-blue-400" />
        </div>
        <span className="text-xs text-gray-400 mb-1">Total Portfolio Value</span>
        <span className="text-xs text-gray-500">Last updated: {lastUpdated}</span>
      </motion.div>
      {/* Main Action Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="grid grid-cols-3 gap-3 mb-4">
        <button className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl bg-white/10 backdrop-blur-md hover:bg-blue-500/20 transition ring-1 ring-white/10 text-white shadow-lg" onClick={() => setModal('send')}>
          <PaperPlaneRight size={28} className="mb-1" />
          <span className="text-xs font-semibold">Send</span>
        </button>
        <button className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl bg-white/10 backdrop-blur-md hover:bg-blue-500/20 transition ring-1 ring-white/10 text-white shadow-lg" onClick={() => setModal('receive')}>
          <DownloadSimple size={28} className="mb-1" />
          <span className="text-xs font-semibold">Receive</span>
        </button>
        <button className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl bg-white/10 backdrop-blur-md hover:bg-blue-500/20 transition ring-1 ring-white/10 text-white shadow-lg" onClick={() => setModal('swap')}>
          <ArrowsLeftRight size={28} className="mb-1" />
          <span className="text-xs font-semibold">Swap</span>
        </button>
      </motion.div>
      {/* Tab Switcher */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="flex justify-center mb-2 gap-2">
        <button
          className={`flex-1 py-2 rounded-xl font-semibold transition-all ${selectedTab === 'token' ? 'bg-blue-600 text-white shadow' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
          onClick={() => setSelectedTab('token')}
        >
          Token
        </button>
        <button
          className={`flex-1 py-2 rounded-xl font-semibold transition-all ${selectedTab === 'history' ? 'bg-blue-600 text-white shadow' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
          onClick={() => setSelectedTab('history')}
        >
          History
        </button>
      </motion.div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-2">
        <AnimatePresence mode="wait">
          {selectedTab === 'token' ? (
            <motion.div
              key="token"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-2"
            >
              {tokens.length === 0 && <div className="text-center text-gray-500 py-8">No tokens found.</div>}
              {tokens.map(token => <TokenItem key={token.symbol} token={token} price={prices[COINGECKO_IDS[token.symbol]]?.usd} />)}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-2"
            >
              {history.length === 0 && <div className="text-center text-gray-500 py-8">No transaction history found.</div>}
              {history.map(tx => <HistoryItem key={tx.id} tx={tx} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Modals */}
      <ActionModal open={modal === 'send'} onClose={() => setModal(null)} title="Send Token">
        <form className="flex flex-col gap-4" onSubmit={handleSend}>
          <input
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white placeholder-gray-400"
            placeholder="Recipient Address"
            value={sendAddress}
            onChange={e => setSendAddress(e.target.value)}
            disabled={sendLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white placeholder-gray-400"
            placeholder="Amount"
            type="number"
            value={sendAmount}
            onChange={e => setSendAmount(e.target.value)}
            disabled={sendLoading}
          />
          {sendError && <div className="text-red-400 text-sm text-center">{sendError}</div>}
          <button
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
            type="submit"
            disabled={sendLoading}
          >
            {sendLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </ActionModal>
      <ActionModal open={modal === 'receive'} onClose={() => setModal(null)} title="Receive Token">
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-gray-300">Your Address:</div>
          <div className="font-mono text-lg bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 select-all">{address}</div>
          <QRCodeCanvas value={address} size={128} bgColor="#181f2a" fgColor="#fff" />
          <button className="text-xs text-blue-400 underline" onClick={() => {navigator.clipboard.writeText(address);toast.success('Address copied!');}}>Copy Address</button>
        </div>
      </ActionModal>
      <ActionModal open={modal === 'swap'} onClose={() => setModal(null)} title="Swap Token">
        <form className="flex flex-col gap-4" onSubmit={handleSwap}>
          <input
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white placeholder-gray-400"
            placeholder="From Token (ex: ETH)"
            value={swapFrom}
            onChange={e => setSwapFrom(e.target.value)}
            disabled={swapLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white placeholder-gray-400"
            placeholder="To Token (ex: USDT)"
            value={swapTo}
            onChange={e => setSwapTo(e.target.value)}
            disabled={swapLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white placeholder-gray-400"
            placeholder="Amount"
            type="number"
            value={swapAmount}
            onChange={e => setSwapAmount(e.target.value)}
            disabled={swapLoading}
          />
          {swapError && <div className="text-red-400 text-sm text-center">{swapError}</div>}
          <button
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
            type="submit"
            disabled={swapLoading}
          >
            {swapLoading ? 'Swapping...' : 'Swap'}
          </button>
        </form>
      </ActionModal>
      <div className="text-center text-xs text-gray-500 mt-4 mb-1">@cointwobot</div>
    </div>
  );
} 