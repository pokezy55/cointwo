import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaperPlaneRight, DownloadSimple, ArrowsLeftRight, Plus, Copy, CurrencyEth, Star } from 'phosphor-react';
import tokenListRaw from '../assets/tokenList.json';
import ActionModal from '../components/ActionModal';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-toastify';
import WelcomeCard from '../components/WelcomeCard';
import TokenItem from '../components/TokenItem';
import HistoryItem from '../components/HistoryItem';
import NetworkBadge from '../components/NetworkBadge';
import { motion } from 'framer-motion';

const tokenList = tokenListRaw as any[];
const COINGECKO_IDS: { [symbol: string]: string } = {
  ETH: 'ethereum', USDT: 'tether', USDC: 'usd-coin', DAI: 'dai', BNB: 'binancecoin', BUSD: 'binance-usd', MATIC: 'matic-network', QUICK: 'quick',
};

export default function WalletPage() {
  const { user, selectedNetwork } = useAuth();
  const address = user?.address;
  const avatar = user?.telegram?.photo_url;
  const [prices, setPrices] = useState<any>({});
  const [balances, setBalances] = useState<any>({});
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'token'|'history'>('token');
  const [history, setHistory] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [modal, setModal] = useState<null | 'send' | 'receive' | 'swap' | 'add'>(null);
  const [airdropTokens, setAirdropTokens] = useState<any[]>([]);
  const [showAirdropTab, setShowAirdropTab] = useState(false);
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);

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

  // State untuk form Add Token
  const [addTokenAddress, setAddTokenAddress] = useState('');
  const [addTokenLoading, setAddTokenLoading] = useState(false);
  const [addTokenError, setAddTokenError] = useState<string | null>(null);
  const [addTokenInfo, setAddTokenInfo] = useState<{ symbol: string; name: string; decimals: number } | null>(null);

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
        setXP(me.xp);
        setLevel(me.level);
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

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied!');
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

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTokenError(null);
    setAddTokenInfo(null);
    if (!isValidAddress(addTokenAddress)) {
      setAddTokenError('Invalid token address');
      return;
    }
    setAddTokenLoading(true);
    try {
      // Fetch token info
      const infoRes = await fetch(`/wallet/token-info?address=${addTokenAddress}&chain=${selectedNetwork.name}`);
      const info = await infoRes.json();
      if (!info.symbol || !info.name) {
        setAddTokenError('Token info not found');
        setAddTokenLoading(false);
        return;
      }
      setAddTokenInfo(info);
      // Simpan ke backend (atau local state)
      const saveRes = await fetch('/wallet/add-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addTokenAddress, chain: selectedNetwork.name, user: address })
      });
      const saveData = await saveRes.json();
      if (saveRes.ok) {
        toast.success('Token added!');
        setAddTokenAddress('');
        setAddTokenInfo(null);
        setModal(null);
      } else {
        setAddTokenError(saveData.error || 'Failed to add token');
        toast.error(saveData.error || 'Failed to add token');
      }
    } catch (err) {
      setAddTokenError('Network error');
      toast.error('Network error');
    } finally {
      setAddTokenLoading(false);
    }
  };

  // Scan Airdrop manual
  const handleScanAirdrop = async () => {
    // Dummy: fetch token baru 24 jam terakhir
    // Replace with real backend logic if available
    const res = await fetch(`/wallet/airdrop-scan?address=${user?.address}&chain=${selectedNetwork.name}`);
    const data = await res.json();
    setAirdropTokens(data.tokens || []);
    setShowAirdropTab(true);
    toast.info('Airdrop scan complete!');
  };

  // Portfolio value
  const totalValue = tokens.reduce((sum, t) => sum + (t.balance * (prices[COINGECKO_IDS[t.symbol]]?.usd || 0)), 0);

  if (!address) {
    return <WelcomeCard />;
  }

  return (
    <motion.div
      className="min-h-screen bg-[#0f0f0f] max-w-md mx-auto px-4 py-6 flex flex-col text-white font-sans rounded-2xl shadow-md"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded-lg select-all">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button
              onClick={handleCopyAddress}
              className="ml-1 p-1 rounded-lg hover:bg-white/10 transition text-blue-400"
              title="Copy address"
            >
              <Copy size={16} />
            </button>
            <NetworkBadge name={selectedNetwork.name} logo={selectedNetwork.logo} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-700/80 text-xs font-semibold">
              <Star size={14} />Level {level}
            </span>
            <span className="text-xs text-gray-400">XP: {xp}</span>
          </div>
        </div>
        {avatar && (
          <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-white/10 object-cover" />
        )}
      </div>
      {/* Portfolio Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-4xl font-bold tracking-tight">${totalValue.toFixed(2)}</span>
          <CurrencyEth size={22} className="text-blue-400" />
        </div>
        <span className="text-sm text-gray-400 mb-1">Total Portfolio Value</span>
        <span className="text-xs text-gray-500">Last updated: {lastUpdated}</span>
      </div>
      {/* Main Action Grid */}
      <motion.div layout className="grid grid-cols-2 gap-4 mb-6">
        <motion.button whileTap={{ scale: 0.95 }} className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl bg-white/5 hover:bg-white/10 transition ring-1 ring-white/10 text-white" onClick={() => setModal('send')}>
          <PaperPlaneRight size={32} className="mb-1" />
          <span className="text-base font-medium">Send</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl bg-white/5 hover:bg-white/10 transition ring-1 ring-white/10 text-white" onClick={() => setModal('receive')}>
          <DownloadSimple size={32} className="mb-1" />
          <span className="text-base font-medium">Receive</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl bg-white/5 hover:bg-white/10 transition ring-1 ring-white/10 text-white" onClick={() => setModal('swap')}>
          <ArrowsLeftRight size={32} className="mb-1" />
          <span className="text-base font-medium">Swap</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl bg-white/5 hover:bg-white/10 transition ring-1 ring-white/10 text-white" onClick={() => setModal('add')}>
          <Plus size={32} className="mb-1" />
          <span className="text-base font-medium">Add</span>
        </motion.button>
      </motion.div>
      {/* Tab Switcher */}
      <div className="flex justify-center mb-4">
        <button
          className={`flex-1 py-2 text-center font-semibold transition border-b-2 ${selectedTab === 'token' ? 'text-white border-blue-500' : 'text-gray-400 border-transparent'}`}
          onClick={() => setSelectedTab('token')}
        >
          Token
        </button>
        <button
          className={`flex-1 py-2 text-center font-semibold transition border-b-2 ${selectedTab === 'history' ? 'text-white border-blue-500' : 'text-gray-400 border-transparent'}`}
          onClick={() => setSelectedTab('history')}
        >
          History
        </button>
      </div>
      {/* Tab Content */}
      <motion.div layout className="flex-1 overflow-y-auto">
        {selectedTab === 'token' ? (
          <div className="flex flex-col gap-2">
            {tokens.length === 0 && <div className="text-center text-gray-500 py-8">No tokens found.</div>}
            {tokens.map(token => <TokenItem key={token.symbol} token={token} price={prices[COINGECKO_IDS[token.symbol]]?.usd} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.length === 0 && <div className="text-center text-gray-500 py-8">No transaction history found.</div>}
            {history.map(tx => <HistoryItem key={tx.id} tx={tx} />)}
          </div>
        )}
      </motion.div>
      {/* Modals */}
      <ActionModal open={modal === 'send'} onClose={() => setModal(null)} title="Send Token">
        <form className="flex flex-col gap-4" onSubmit={handleSend}>
          <input
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#181f2a] text-white"
            placeholder="Recipient Address"
            value={sendAddress}
            onChange={e => setSendAddress(e.target.value)}
            disabled={sendLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#181f2a] text-white"
            placeholder="Amount"
            type="number"
            value={sendAmount}
            onChange={e => setSendAmount(e.target.value)}
            disabled={sendLoading}
          />
          {sendError && <div className="text-red-400 text-sm text-center">{sendError}</div>}
          <button
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60"
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
          <div className="font-mono text-lg bg-[#181f2a] px-4 py-2 rounded-lg border border-white/10">{address}</div>
          <QRCodeCanvas value={address} size={128} bgColor="#181f2a" fgColor="#fff" />
          <button className="text-xs text-blue-400 underline" onClick={handleCopyAddress}>Copy Address</button>
        </div>
      </ActionModal>
      <ActionModal open={modal === 'swap'} onClose={() => setModal(null)} title="Swap Token">
        <form className="flex flex-col gap-4" onSubmit={handleSwap}>
          <input
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#181f2a] text-white"
            placeholder="From Token (ex: ETH)"
            value={swapFrom}
            onChange={e => setSwapFrom(e.target.value)}
            disabled={swapLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#181f2a] text-white"
            placeholder="To Token (ex: USDT)"
            value={swapTo}
            onChange={e => setSwapTo(e.target.value)}
            disabled={swapLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#181f2a] text-white"
            placeholder="Amount"
            type="number"
            value={swapAmount}
            onChange={e => setSwapAmount(e.target.value)}
            disabled={swapLoading}
          />
          {swapError && <div className="text-red-400 text-sm text-center">{swapError}</div>}
          <button
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60"
            type="submit"
            disabled={swapLoading}
          >
            {swapLoading ? 'Swapping...' : 'Swap'}
          </button>
        </form>
      </ActionModal>
      <ActionModal open={modal === 'add'} onClose={() => setModal(null)} title="Add Token">
        <form className="flex flex-col gap-4" onSubmit={handleAddToken}>
          <input
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#181f2a] text-white"
            placeholder="Token Address"
            value={addTokenAddress}
            onChange={e => setAddTokenAddress(e.target.value)}
            disabled={addTokenLoading}
          />
          {addTokenInfo && (
            <div className="text-xs text-green-400 text-center">
              Token: {addTokenInfo.symbol} ({addTokenInfo.name}), Decimals: {addTokenInfo.decimals}
            </div>
          )}
          {addTokenError && <div className="text-red-400 text-sm text-center">{addTokenError}</div>}
          <button
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60"
            type="submit"
            disabled={addTokenLoading}
          >
            {addTokenLoading ? 'Adding...' : 'Add Token'}
          </button>
        </form>
      </ActionModal>
      <div className="text-center text-xs text-gray-500 mt-2 mb-1">@cointwobot</div>
    </motion.div>
  );
} 