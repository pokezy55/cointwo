import React, { useEffect, useState } from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { api } from '../utils/api';
import { toast } from 'react-toastify';
import { FaGift } from 'react-icons/fa';

export const AdminPanel: React.FC<{ adminKey: string }> = ({ adminKey }) => {
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [referralRewards, setReferralRewards] = useState<any[]>([]);
  const [tab, setTab] = useState<'task' | 'referral'>('task');

  const fetchRewards = () => {
    setLoading(true);
    setError(null);
    api.get('/admin/pending-rewards', { params: { adminKey } })
      .then(res => setRewards(res.data.rewards))
      .catch(err => {
        setError(err.error || 'Gagal fetch rewards');
        toast.error(err.error || 'Gagal fetch rewards');
      })
      .finally(() => setLoading(false));
  };

  const fetchReferralRewards = () => {
    setLoading(true);
    setError(null);
    api.get('/admin/referral-rewards')
      .then(res => setReferralRewards(res.data.rewards))
      .catch(err => {
        setError(err.error || 'Gagal fetch referral rewards');
        toast.error(err.error || 'Gagal fetch referral rewards');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRewards();
    fetchReferralRewards();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (taskId: string) => {
    try {
      setLoading(true);
      await api.post('/admin/reward/complete', { taskId });
      toast.success('Reward sent & task completed!');
      fetchRewards();
    } catch (err: any) {
      toast.error(err.error || 'Gagal kirim reward');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReferral = async (referralId: string) => {
    try {
      setLoading(true);
      await api.post('/admin/referral-reward/complete', { referralId });
      toast.success('Referral reward sent!');
      fetchReferralRewards();
    } catch (err: any) {
      toast.error(err.error || 'Gagal kirim referral reward');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (rewardId: string) => {
    try {
      setLoading(true);
      await api.post('/admin/reject', { rewardId, adminKey });
      toast.success('Reward rejected!');
      fetchRewards();
    } catch (err: any) {
      toast.error(err.error || 'Gagal reject reward');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Panel</h2>
        <div className="flex gap-4 mb-4 justify-center">
          <button className={`px-4 py-2 rounded font-bold ${tab === 'task' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setTab('task')}>Task Rewards</button>
          <button className={`px-4 py-2 rounded font-bold ${tab === 'referral' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setTab('referral')}>Referral Rewards</button>
        </div>
        {loading && <div className="animate-pulse text-slate-400">Loading rewards...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {tab === 'task' && (
          <div className="space-y-4">
            {rewards.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-2 border-b pb-2">
                <div>
                  <div className="font-semibold">User: {r.userEmail}</div>
                  <div className="text-xs text-slate-500">Task: {r.taskNumber} | Reward: {r.reward}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => handleApprove(r.id)} disabled={loading}>Approve & Send Reward</Button>
                  <Button variant="secondary" onClick={() => handleReject(r.id)} disabled={loading}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'referral' && (
          <div className="space-y-4">
            {referralRewards.length === 0 && <div className="text-slate-400 text-center">No referral rewards to approve.</div>}
            {referralRewards.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-2 border-b pb-2">
                <div>
                  <div className="font-semibold flex items-center"><FaGift className="mr-2 text-yellow-500" /> Referrer: {r.referrerEmail || r.referrerAddress}</div>
                  <div className="text-xs text-slate-500">Referred: {r.referredEmail || r.referredAddress}</div>
                  <div className="text-xs text-slate-400">Updated: {new Date(r.updatedAt).toLocaleString()}</div>
                </div>
                <Button variant="primary" onClick={() => handleApproveReferral(r.id)} disabled={loading}>Approve & Send</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}; 