import React, { useState } from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { Input } from 'ui/Input';
import { api } from '../utils/api';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

export const AuthPage: React.FC<{ onAuth: (user: any) => void }> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'import'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'register') {
        const res = await api.post('/wallet/create', { email, password });
        toast.success('Registrasi berhasil! Wallet address: ' + res.data.address);
        onAuth({ email, address: res.data.address });
      } else if (mode === 'login') {
        const res = await api.post('/login', { email, password });
        toast.success('Login berhasil!');
        onAuth(res.data);
      } else if (mode === 'import') {
        const wallet = ethers.Wallet.fromPhrase(seed.trim());
        toast.success('Wallet berhasil diimport! Address: ' + wallet.address);
        onAuth({ email: '', address: wallet.address, privateKey: wallet.privateKey });
      }
    } catch (err: any) {
      setError(err.error || 'Gagal login/register/import');
      toast.error(err.error || 'Gagal login/register/import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Import Wallet'}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode !== 'import' ? (
            <>
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </>
          ) : (
            <Input label="Seed Phrase" value={seed} onChange={e => setSeed(e.target.value)} required />
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Loading...' : (mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Import')}</Button>
        </form>
        <div className="mt-4 text-center text-sm space-x-2">
          {mode !== 'login' && <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>Login</button>}
          {mode !== 'register' && <button className="text-blue-600 hover:underline" onClick={() => setMode('register')}>Register</button>}
          {mode !== 'import' && <button className="text-blue-600 hover:underline" onClick={() => setMode('import')}>Import Wallet</button>}
        </div>
      </Card>
    </div>
  );
}; 