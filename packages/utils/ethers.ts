import { ethers } from 'ethers';
import { CHAINS } from './chain';

// Generate EVM wallet (random)
export function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || '',
  };
}

// Get native & ERC20 balance (multichain)
export async function getBalance(address: string, chain: keyof typeof CHAINS) {
  const rpc = CHAINS[chain].rpc;
  const provider = new ethers.JsonRpcProvider(rpc);
  const native = await provider.getBalance(address);
  // TODO: Tambah multicall ERC20
  return { native: ethers.formatEther(native) };
}

// Send native/erc20 token
export async function sendToken(params: { privateKey: string, to: string, amount: string, tokenAddress?: string, chain: keyof typeof CHAINS }) {
  const { privateKey, to, amount, tokenAddress, chain } = params;
  const rpc = CHAINS[chain].rpc;
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  if (!tokenAddress) {
    // Native transfer
    const tx = await wallet.sendTransaction({ to, value: ethers.parseEther(amount) });
    await tx.wait();
    return { txHash: tx.hash };
  } else {
    // ERC20 transfer
    const erc20Abi = ["function transfer(address to, uint amount) returns (bool)"];
    const token = new ethers.Contract(tokenAddress, erc20Abi, wallet);
    const decimals = await token.decimals?.().catch(() => 18) || 18;
    const tx = await token.transfer(to, ethers.parseUnits(amount, decimals));
    await tx.wait();
    return { txHash: tx.hash };
  }
}

// Swap via Uniswap V2 router
export async function swapToken(params: {
  privateKey: string,
  fromToken: string,
  toToken: string,
  amountIn: string,
  chain: keyof typeof CHAINS,
  slippage: number
}) {
  const { privateKey, fromToken, toToken, amountIn, chain, slippage } = params;
  const rpc = CHAINS[chain].rpc;
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Uniswap V2 Router (default address per chain)
  const ROUTERS: Record<string, string> = {
    ethereum: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Uniswap V2
    bsc: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2
    polygon: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', // SushiSwap
    base: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86', // Uniswap V2 (Base)
  };
  const routerAddress = ROUTERS[chain];
  const routerAbi = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] memory)",
    "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory)"
  ];
  const router = new ethers.Contract(routerAddress, routerAbi, wallet);

  // ERC20 approve if needed
  const erc20Abi = ["function approve(address spender, uint amount) returns (bool)", "function allowance(address owner, address spender) view returns (uint)", "function decimals() view returns (uint8)"];
  const fromTokenContract = new ethers.Contract(fromToken, erc20Abi, wallet);
  const decimals = await fromTokenContract.decimals();
  const allowance = await fromTokenContract.allowance(wallet.address, routerAddress);
  const amountInWei = ethers.parseUnits(amountIn, decimals);
  if (allowance < amountInWei) {
    const approveTx = await fromTokenContract.approve(routerAddress, amountInWei);
    await approveTx.wait();
  }

  // Get amountOutMin (slippage)
  const amountsOut = await router.getAmountsOut(amountInWei, [fromToken, toToken]);
  const amountOutMin = amountsOut[1] - (amountsOut[1] * BigInt(Math.floor(slippage * 100)) / BigInt(10000));

  // Swap
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 menit
  const tx = await router.swapExactTokensForTokens(
    amountInWei,
    amountOutMin,
    [fromToken, toToken],
    wallet.address,
    deadline
  );
  await tx.wait();
  return { txHash: tx.hash };
}

// Get tx history (optional, bisa pakai 3rd party)
export async function getTxHistory(address: string, chain: keyof typeof CHAINS) {
  // TODO: Implementasi
} 