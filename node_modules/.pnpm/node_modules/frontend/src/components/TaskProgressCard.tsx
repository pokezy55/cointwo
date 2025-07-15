import React, { useEffect, useState } from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

const statusLabel: Record<string, string> = {
  not_started: 'Belum Mulai',
  eligible: 'Eligible',
  pending_admin: 'Menunggu Admin',
  completed: 'Selesai',
  rejected: 'Ditolak',
};

const statusColor: Record<string, string> = {
  not_started: 'bg-slate-300 text-slate-700',
  eligible: 'bg-blue-100 text-blue-700',
  pending_admin: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export const TaskProgressCard: React.FC<{ userId?: string }> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    api.get('/tasks', { params: { userId } })
      .then(res => setTasks(res.data.tasks))
      .catch(err => {
        setError(err.error || 'Gagal fetch task');
        toast.error(err.error || 'Gagal fetch task');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleClaim = async (taskId: string) => {
    try {
      setLoading(true);
      await api.post('/task/claim', { taskId });
      toast.success('Reward berhasil di-claim!');
      // Refresh tasks
      const res = await api.get('/tasks', { params: { userId } });
      setTasks(res.data.tasks);
    } catch (err: any) {
      toast.error(err.error || 'Gagal claim reward');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <h2 className="text-lg font-bold mb-4">Progress Task</h2>
      {loading && (
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 bg-slate-200 rounded animate-pulse" />
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold">Task {task.taskNumber}: {task.title}</div>
              <div className="text-xs text-slate-500">Reward: {task.reward}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[task.status]}`}>{statusLabel[task.status]}</span>
            {task.status === 'eligible' && <Button variant="primary" onClick={() => handleClaim(task.id)} disabled={loading}>Claim</Button>}
          </div>
        ))}
      </div>
    </Card>
  );
}; 