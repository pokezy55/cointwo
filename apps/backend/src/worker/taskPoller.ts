import { PrismaClient } from '@prisma/client';
import { JsonRpcProvider, formatEther, Log } from 'ethers';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Konfigurasi chain & RPC
const CHAIN_CONFIG = {
  ethereum: {
    rpc: process.env.ETH_RPC_URL || '',
    uniswapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3
  },
  // Tambahkan chain lain jika perlu
};

// ERC20 Transfer event topic
const ERC20_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// Ambil harga token dari CoinGecko
async function getTokenPriceUSD(symbol: string): Promise<number> {
  const ids: Record<string, string> = {
    ETH: 'ethereum',
    USDT: 'tether',
    USDC: 'usd-coin',
    DAI: 'dai',
    BNB: 'binancecoin',
    BUSD: 'binance-usd',
    MATIC: 'matic-network',
  };
  const id = ids[symbol];
  if (!id) return 0;
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
  const data = await res.json();
  return data[id]?.usd || 0;
}

// Helper: decode ERC20 Transfer log
function decodeTransferLog(log: Log) {
  // topics[1] = from, topics[2] = to, data = value
  return {
    from: '0x' + log.topics[1].slice(26),
    to: '0x' + log.topics[2].slice(26),
    value: BigInt(log.data),
    contract: log.address,
  };
}

// Cek deposit (native & ERC20)
async function checkDeposit(provider: JsonRpcProvider, address: string, minUSD: number): Promise<boolean> {
  let totalUSD = 0;
  // Cek native balance
  const balance = await provider.getBalance(address);
  const ethPrice = await getTokenPriceUSD('ETH');
  totalUSD += parseFloat(formatEther(balance)) * ethPrice;

  // Cek ERC20 transfer in (event Transfer)
  const latestBlock = await provider.getBlockNumber();
  // Ambil log 10.000 block terakhir (bisa dioptimasi)
  const logs = await provider.getLogs({
    fromBlock: latestBlock - 10000,
    toBlock: latestBlock,
    topics: [ERC20_TRANSFER_TOPIC, null, '0x' + address.slice(2).padStart(64, '0')],
  });
  for (const log of logs) {
    const { value, contract } = decodeTransferLog(log);
    // Dapatkan symbol token dari address contract (hardcoded mapping atau onchain call)
    // Untuk demo, asumsikan USDT jika contract USDT
    let symbol = 'USDT';
    if (contract.toLowerCase() === '0xdac17f958d2ee523a2206206994597c13d831ec7') symbol = 'USDT';
    if (contract.toLowerCase() === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') symbol = 'USDC';
    if (contract.toLowerCase() === '0x6b175474e89094c44da98b954eedeac495271d0f') symbol = 'DAI';
    // ...tambahkan mapping lain jika perlu
    const decimals = 6; // USDT/USDC 6, DAI 18 (bisa fetch onchain)
    const price = await getTokenPriceUSD(symbol);
    const amount = Number(value) / 10 ** decimals;
    totalUSD += amount * price;
  }
  return totalUSD >= minUSD;
}

// Helper: decode Uniswap swap log (placeholder, perlu ABI decode untuk real)
function decodeSwapLog(log: Log) {
  // ...implementasi parsing log swap Uniswap...
  return {
    fromToken: 'ETH',
    toToken: 'USDT',
    amountUSD: 25,
  };
}

// Cek swap tx (Uniswap)
async function checkSwap(provider: JsonRpcProvider, address: string, minUSD: number): Promise<boolean> {
  const latestBlock = await provider.getBlockNumber();
  // Ambil log swap di router (Uniswap)
  const logs = await provider.getLogs({
    fromBlock: latestBlock - 10000,
    toBlock: latestBlock,
    address: CHAIN_CONFIG.ethereum.uniswapRouter,
    // topics: [SWAP_TOPIC], // tambahkan jika ingin filter event swap
  });
  for (const log of logs) {
    // Perlu parsing log swap Uniswap (pakai ABI decode)
    const swap = decodeSwapLog(log);
    // Validasi pair dan amount
    if (
      swap.fromToken === 'ETH' &&
      swap.toToken === 'USDT' &&
      swap.amountUSD >= minUSD
    ) {
      return true;
    }
  }
  return false;
}

function calcLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 20));
}

async function updateXPAndCampaign(userId: string, chain: string, action: 'deposit' | 'swap' | 'invite') {
  // XP config
  const XP_MAP = { deposit: 5, swap: 10, invite: 5 };
  const xpAdd = XP_MAP[action] || 0;
  // Update XP
  let userXP = await prisma.userXP.findFirst({ where: { userId, chain } });
  if (!userXP) {
    userXP = await prisma.userXP.create({ data: { userId, chain, xp: 0, level: 1 } });
  }
  const newXP = userXP.xp + xpAdd;
  const newLevel = calcLevel(newXP);
  await prisma.userXP.update({ where: { id: userXP.id }, data: { xp: newXP, level: newLevel } });
  // Update campaign progress
  let camp = await prisma.campaignProgress.findFirst({ where: { userId, chain, campaignId: action } });
  if (!camp) {
    camp = await prisma.campaignProgress.create({ data: { userId, chain, campaignId: action, progress: 0, status: 'in_progress' } });
  }
  const progressGoal = action === 'deposit' ? 1 : action === 'swap' ? 1 : action === 'invite' ? 1 : 1;
  const newProgress = Math.min(camp.progress + 1, progressGoal);
  let status = 'in_progress';
  if (newProgress >= progressGoal) status = 'completed';
  await prisma.campaignProgress.update({ where: { id: camp.id }, data: { progress: newProgress, status } });
}

// Worker utama
async function pollTasks() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    const address = user.address;
    const chain = 'ethereum'; // TODO: dynamic per user
    const provider = new JsonRpcProvider(CHAIN_CONFIG[chain].rpc);
    // Deposit
    const eligibleDeposit = await checkDeposit(provider, address, 15);
    if (eligibleDeposit) {
      await prisma.task.updateMany({
        where: { userId: user.id, type: 'deposit' },
        data: { status: 'eligible' },
      });
      await updateXPAndCampaign(user.id, chain, 'deposit');
    }
    // Swap
    const eligibleSwap = await checkSwap(provider, address, 20);
    if (eligibleSwap) {
      await prisma.task.updateMany({
        where: { userId: user.id, type: 'swap' },
        data: { status: 'eligible' },
      });
      await updateXPAndCampaign(user.id, chain, 'swap');
    }
    // TODO: Invite logic (misal: cek referral baru, dsb)
    // await updateXPAndCampaign(user.id, chain, 'invite');
  }
}

// Jalankan worker periodik
setInterval(pollTasks, 60 * 1000); // setiap 1 menit

export {}; 