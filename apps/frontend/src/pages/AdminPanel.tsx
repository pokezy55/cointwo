import React, { useEffect, useState } from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

export const AdminPanel: React.FC<{ adminKey: string }> = ({ adminKey }) => {
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchRewards();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (rewardId: string) => {
    try {
      setLoading(true);
      await api.post('/admin/approve', { rewardId, adminKey });
      toast.success('Reward approved!');
      fetchRewards();
    } catch (err: any) {
      toast.error(err.error || 'Gagal approve reward');
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
        {loading && <div className="animate-pulse text-slate-400">Loading rewards...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="space-y-4">
          {rewards.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-2 border-b pb-2">
              <div>
                <div className="font-semibold">User: {r.userEmail}</div>
                <div className="text-xs text-slate-500">Task: {r.taskNumber} | Reward: {r.reward}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={() => handleApprove(r.id)} disabled={loading}>Approve</Button>
                <Button variant="secondary" onClick={() => handleReject(r.id)} disabled={loading}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}; 