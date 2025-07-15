import React, { useEffect, useState } from 'react';
import { Card } from 'ui/Card';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

export const ReferralStatsCard: React.FC<{ userId?: string }> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    api.get('/referral', { params: { userId } })
      .then(res => setData(res.data))
      .catch(err => {
        setError(err.error || 'Gagal fetch referral');
        toast.error(err.error || 'Gagal fetch referral');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Referral</h2>
      {loading && (
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 rounded animate-pulse w-32" />
          <div className="h-6 bg-slate-200 rounded animate-pulse w-24" />
          <div className="h-6 bg-slate-200 rounded animate-pulse w-40" />
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
      {data && (
        <>
          <div className="mb-2">
            <span className="font-semibold">Kode Referral:</span> <span className="bg-slate-100 px-2 py-1 rounded font-mono">{data.referralCode}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Total Referral:</span> <span className="text-blue-600 font-bold">{data.totalReferral}</span>
          </div>
          <div>
            <span className="font-semibold">Reward Referral:</span> <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{data.rewardStatus}</span>
          </div>
        </>
      )}
    </Card>
  );
}; 