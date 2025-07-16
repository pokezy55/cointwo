import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaRegPaperPlane, FaRegArrowAltCircleDown, FaExchangeAlt, FaPlus, FaBars } from 'react-icons/fa';
import tokenListRaw from '../assets/tokenList.json';
import ActionModal from '../components/ActionModal';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-toastify';

interface Token {
  symbol: string;
  name: string;
  address: string;
  chain: string;
  logo: string;
  balance?: number;
}

interface PriceMap {
  [coingeckoId: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

interface BalanceMap {
  [symbol: string]: string;
}

const tokenList: Token[] = tokenListRaw as Token[];

const COINGECKO_IDS: { [symbol: string]: string } = {
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin',
  DAI: 'dai',
  BNB: 'binancecoin',
  BUSD: 'binance-usd',
  MATIC: 'matic-network',
  QUICK: 'quick',
};

const CURRENT_CHAIN = 'ethereum'; // TODO: dynamic chain switch
// Ambil address dari context

export default function WalletPage() {
  const { address } = useAuth();
  const [prices, setPrices] = useState<PriceMap>({});
  const [balances, setBalances] = useState<BalanceMap>({});
  const [tokens, setTokens] = useState<Token[]>([]);
  const [modal, setModal] = useState<null | 'send' | 'receive' | 'swap' | 'add'>(null);

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

  // Fetch prices from CoinGecko
  useEffect(() => {
    async function fetchPrices() {
      try {
        const ids = Array.from(new Set(tokenList.map(t => COINGECKO_IDS[t.symbol]).filter(Boolean))).join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const data = await res.json();
        setPrices(data);
      } catch (e) {}
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch balances from backend
  useEffect(() => {
    if (!address) return;
    async function fetchBalances() {
      try {
        const res = await fetch(`/wallet/balance?address=${address}&chain=${CURRENT_CHAIN}`);
        const data: { symbol: string; balance: string; address: string; chain: string }[] = await res.json();
        const balMap: BalanceMap = {};
        data.forEach(t => { balMap[t.symbol] = t.balance; });
        setBalances(balMap);
      } catch (e) {}
    }
    fetchBalances();
  }, [address]);

  // Filter and sort tokens for current chain
  useEffect(() => {
    const filtered: Token[] = tokenList.filter((t: Token) => t.chain === CURRENT_CHAIN);
    // Attach balance
    const withBalance: Token[] = filtered.map((t: Token) => ({ ...t, balance: parseFloat(balances[t.symbol] || '0') }));
    // Sort: balance > 0 ke atas
    withBalance.sort((a, b) => (b.balance! > 0 ? 1 : 0) - (a.balance! > 0 ? 1 : 0) || (b.balance! - a.balance!));
    setTokens(withBalance);
  }, [balances]);

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
        body: JSON.stringify({ to: sendAddress, amount: sendAmount, chain: CURRENT_CHAIN, address })
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
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
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
        body: JSON.stringify({ fromToken: swapFrom, toToken: swapTo, amount: swapAmount, chain: CURRENT_CHAIN, address })
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
      const infoRes = await fetch(`/wallet/token-info?address=${addTokenAddress}&chain=${CURRENT_CHAIN}`);
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
        body: JSON.stringify({ address: addTokenAddress, chain: CURRENT_CHAIN, user: address })
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

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181f2a] text-white">
        <div className="text-lg font-bold mb-4">Please login or import wallet to continue</div>
        {/* Bisa render <Auth /> di sini jika mau */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181f2a] flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="font-bold text-lg">CoinTwo Wallet</div>
        <FaBars className="text-2xl" />
      </div>
      <div className="px-4 text-xs text-gray-400">{address}</div>
      {/* Balance */}
      <div className="flex flex-col items-center mt-2 mb-2">
        <div className="text-3xl font-bold">$0.00</div>
        <div className="text-xs text-gray-400">Total Portfolio Value | 0.0000</div>
        <div className="text-xs text-gray-500">Last updated: 23:59:59 PM</div>
      </div>
      {/* Action Bar */}
      <div className="flex justify-between px-4 mt-2 mb-2 gap-2">
        <button className="flex flex-col items-center flex-1 py-2 hover:bg-[#232b3b] rounded-lg" onClick={() => setModal('send')}>
          <FaRegPaperPlane className="text-xl mb-1" />
          <span className="text-xs">Send</span>
        </button>
        <button className="flex flex-col items-center flex-1 py-2 hover:bg-[#232b3b] rounded-lg" onClick={() => setModal('receive')}>
          <FaRegArrowAltCircleDown className="text-xl mb-1" />
          <span className="text-xs">Receive</span>
        </button>
        <button className="flex flex-col items-center flex-1 py-2 hover:bg-[#232b3b] rounded-lg" onClick={() => setModal('swap')}>
          <FaExchangeAlt className="text-xl mb-1" />
          <span className="text-xs">Swap</span>
        </button>
        <button className="flex flex-col items-center flex-1 py-2 hover:bg-[#232b3b] rounded-lg" onClick={() => setModal('add')}>
          <FaPlus className="text-xl mb-1" />
          <span className="text-xs">Add</span>
        </button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-[#232b3b] px-4 mt-2">
        <button className="flex-1 py-2 text-blue-400 border-b-2 border-blue-400 font-bold">Token</button>
        <button className="flex-1 py-2 text-gray-400">History</button>
      </div>
      {/* Token List */}
      <div className="flex-1 overflow-y-auto px-2 pb-24">
        {tokens.map((token) => {
          const priceData = prices[COINGECKO_IDS[token.symbol]] || {};
          const price = priceData.usd || 0;
          const change = priceData.usd_24h_change?.toFixed(2) || 0;
          return (
            <div key={token.symbol} className="flex items-center bg-[#232b3b] rounded-xl p-4 mb-3">
              <img src={token.logo} alt={token.symbol} className="w-10 h-10 mr-4" />
              <div className="flex-1">
                <div className="font-bold text-base">{token.symbol}</div>
                <div className="text-xs text-gray-400">({token.name}) ${price?.toLocaleString()} <span className={+change >= 0 ? 'text-green-400' : 'text-red-400'}>{+change >= 0 ? '+' : ''}{change}%</span></div>
              </div>
              <div className="text-right">
                <div className="font-bold text-base">{token.balance?.toFixed(6)}</div>
                <div className="text-xs text-gray-400">${((token.balance || 0) * price).toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <ActionModal open={modal === 'send'} onClose={() => setModal(null)} title="Send Token">
        <form className="flex flex-col gap-4" onSubmit={handleSend}>
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white"
            placeholder="Recipient Address"
            value={sendAddress}
            onChange={e => setSendAddress(e.target.value)}
            disabled={sendLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white"
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
          <div className="font-mono text-lg bg-[#181f2a] px-4 py-2 rounded-lg">{address}</div>
          <QRCodeCanvas value={address} size={128} bgColor="#181f2a" fgColor="#fff" />
          <button className="text-xs text-blue-400 underline" onClick={handleCopyAddress}>Copy Address</button>
        </div>
      </ActionModal>
      <ActionModal open={modal === 'swap'} onClose={() => setModal(null)} title="Swap Token">
        <form className="flex flex-col gap-4" onSubmit={handleSwap}>
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white"
            placeholder="From Token (ex: ETH)"
            value={swapFrom}
            onChange={e => setSwapFrom(e.target.value)}
            disabled={swapLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white"
            placeholder="To Token (ex: USDT)"
            value={swapTo}
            onChange={e => setSwapTo(e.target.value)}
            disabled={swapLoading}
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white"
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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white"
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
        <div className="flex flex-col gap-4">
          <input className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white" placeholder="From Token (ex: ETH)" />
          <input className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white" placeholder="To Token (ex: USDT)" />
          <input className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white" placeholder="Amount" type="number" />
          <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition">Swap</button>
        </div>
      </ActionModal>
      <ActionModal open={modal === 'add'} onClose={() => setModal(null)} title="Add Token">
        <div className="flex flex-col gap-4">
          <input className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#181f2a] text-white" placeholder="Token Address" />
          <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition">Add Token</button>
        </div>
      </ActionModal>
      <div className="text-center text-xs text-gray-500 mt-2 mb-1">@cointwobot</div>
    </div>
  );
} 