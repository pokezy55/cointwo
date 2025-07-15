import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { generateWallet, getBalance, sendToken, swapToken } from '../../../packages/utils/ethers';
import { CHAINS } from '../../../packages/utils/chain';
import bcrypt from 'bcrypt';

// Load env
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date() });
});

// TODO: Tambahkan endpoint wallet, task, admin, dsb

app.post('/wallet/create', async (req: Request, res: Response) => {
  try {
    const { email, password, referralCode } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email & password wajib diisi' });
    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) return res.status(409).json({ error: 'Email sudah terdaftar' });
    const wallet = generateWallet();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const encryptedPrivateKey = wallet.privateKey; // TODO: encrypt
    const seedPhrase = wallet.mnemonic; // TODO: encrypt
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        walletAddress: wallet.address,
        encryptedPrivateKey,
        seedPhrase,
        referralCode: referralCode || (Math.random().toString(36).substring(2, 10)),
        referredBy: null,
      },
    });
    res.json({ address: wallet.address });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal membuat wallet', detail: err.message });
  }
});

app.get('/wallet/balance', async (req: Request, res: Response) => {
  try {
    const { address, chain } = req.query;
    if (!address || !chain) return res.status(400).json({ error: 'address & chain wajib diisi' });
    const balance = await getBalance(address as string, chain as keyof typeof CHAINS);
    res.json({ native: balance.native });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal ambil saldo', detail: err.message });
  }
});

app.post('/wallet/send', async (req: Request, res: Response) => {
  try {
    const { privateKey, to, amount, tokenAddress, chain } = req.body;
    if (!privateKey || !to || !amount || !chain) return res.status(400).json({ error: 'Data wajib diisi' });
    const result = await sendToken({ privateKey, to, amount, tokenAddress, chain });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal kirim token', detail: err.message });
  }
});

app.post('/wallet/swap', async (req: Request, res: Response) => {
  try {
    const { privateKey, fromToken, toToken, amountIn, chain, slippage } = req.body;
    if (!privateKey || !fromToken || !toToken || !amountIn || !chain || slippage === undefined) return res.status(400).json({ error: 'Data wajib diisi' });
    const result = await swapToken({ privateKey, fromToken, toToken, amountIn, chain, slippage });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal swap token', detail: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 