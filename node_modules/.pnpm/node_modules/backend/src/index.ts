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

app.get('/task/status', async (req: Request, res: Response) => {
  try {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: 'user (wallet address) wajib diisi' });
    const userData = await prisma.user.findUnique({
      where: { walletAddress: user as string },
      include: { tasks: true },
    });
    if (!userData) return res.status(404).json({ error: 'User tidak ditemukan' });
    const tasks = userData.tasks.map(task => ({
      taskNumber: task.taskNumber,
      status: task.status,
      txHash: task.txHash,
      rewardSent: task.rewardSent,
      updatedAt: task.updatedAt,
    }));
    res.json({ tasks });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal ambil status task', detail: err.message });
  }
});

app.post('/wallet/create', async (req: Request, res: Response) => {
  try {
    const { email, password, referralCode, ref_username } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email & password wajib diisi' });
    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) return res.status(409).json({ error: 'Email sudah terdaftar' });
    const wallet = generateWallet();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const encryptedPrivateKey = wallet.privateKey; // TODO: encrypt
    const seedPhrase = wallet.mnemonic; // TODO: encrypt
    let referredBy: string | null = null;
    // Prioritas: referralCode (ref wallet address) > ref_username
    if (referralCode) {
      const refUser = await prisma.user.findUnique({ where: { walletAddress: referralCode } });
      if (refUser) referredBy = refUser.referralCode;
    } else if (ref_username) {
      const refUser = await prisma.user.findUnique({ where: { referralCode: ref_username } });
      if (refUser) referredBy = refUser.referralCode;
    }
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        walletAddress: wallet.address,
        encryptedPrivateKey,
        seedPhrase,
        referralCode: referralCode || (Math.random().toString(36).substring(2, 10)),
        referredBy,
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

app.post('/admin/reward/complete', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ error: 'taskId wajib diisi' });
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Task tidak ditemukan' });
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'completed', rewardSent: true },
    });
    // TODO: Kirim reward token ke user, simpan txHash jika perlu
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal update status reward', detail: err.message });
  }
});

app.get('/referral/progress', async (req: Request, res: Response) => {
  try {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: 'user (wallet address) wajib diisi' });
    const referrer = await prisma.user.findUnique({
      where: { walletAddress: user as string },
      include: {
        referralsSent: {
          include: {
            referred: {
              include: { tasks: true }
            }
          }
        }
      }
    });
    if (!referrer) return res.status(404).json({ error: 'User tidak ditemukan' });
    const referrals = referrer.referralsSent.map(ref => {
      const deposit = ref.referred.tasks.find(t => t.taskNumber === 1 && (t.status === 'eligible' || t.status === 'completed' || t.rewardSent));
      const swap = ref.referred.tasks.find(t => t.taskNumber === 2 && (t.status === 'eligible' || t.status === 'completed' || t.rewardSent));
      const completed = deposit && swap;
      let status = 'not_started';
      if (deposit || swap) status = 'in_progress';
      if (completed) status = 'completed';
      return {
        name: ref.referred.email || '',
        address: ref.referred.walletAddress,
        status,
        rewardEligible: completed,
        rewardSent: ref.rewardSent,
        updatedAt: ref.updatedAt,
      };
    });
    const totalReferral = referrals.length;
    const totalCompleted = referrals.filter(r => r.status === 'completed').length;
    res.json({ referrals, totalReferral, totalCompleted });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal ambil progress referral', detail: err.message });
  }
});

app.get('/admin/referral-rewards', async (req: Request, res: Response) => {
  try {
    const rewards = await prisma.referral.findMany({
      where: {
        eligible: true,
        rewardSent: false,
      },
      include: {
        referrer: true,
        referred: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    const result = rewards.map(r => ({
      id: r.id,
      referrerEmail: r.referrer.email,
      referrerAddress: r.referrer.walletAddress,
      referredEmail: r.referred.email,
      referredAddress: r.referred.walletAddress,
      updatedAt: r.updatedAt,
    }));
    res.json({ rewards: result });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal ambil referral rewards', detail: err.message });
  }
});

app.post('/admin/referral-reward/complete', async (req: Request, res: Response) => {
  try {
    const { referralId } = req.body;
    if (!referralId) return res.status(400).json({ error: 'referralId wajib diisi' });
    const referral = await prisma.referral.findUnique({ where: { id: referralId } });
    if (!referral) return res.status(404).json({ error: 'Referral tidak ditemukan' });
    await prisma.referral.update({
      where: { id: referralId },
      data: { rewardSent: true },
    });
    // TODO: Kirim reward token ke referrer, simpan txHash jika perlu
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal update status referral reward', detail: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 