import { FaTasks, FaWallet, FaUserFriends, FaBars } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import { getTaskStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Ambil address dari context
const TASK_TITLES: Record<number, string> = {
  1: 'Deposit $15+',
  2: 'Swap $20+',
  3: 'Invite Friend',
};

export default function TaskPage() {
  const { address } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const prevTasksRef = useRef<any[]>([]);

  useEffect(() => {
    if (!address) return;
    let timer: any;
    async function fetchTasks() {
      try {
        setLoading(true);
        const data = await getTaskStatus(address);
        // Deteksi perubahan status task
        const prevTasks = prevTasksRef.current;
        data.forEach((task: any, i: number) => {
          const prev = prevTasks.find((t: any) => t.taskNumber === task.taskNumber);
          if (prev && prev.status !== task.status) {
            // Eligible
            if (task.status === 'eligible') {
              toast.success('Task ' + TASK_TITLES[task.taskNumber] + ' completed, reward is waiting for admin approval!');
            }
            // Completed / reward sent
            if (task.status === 'completed' || task.rewardSent) {
              toast('Your $3 reward has been sent to your wallet! 🤑', { type: 'info' });
            }
          }
        });
        prevTasksRef.current = data;
        setTasks(data);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
    timer = setInterval(fetchTasks, 5000);
    return () => clearInterval(timer);
  }, [address]);

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
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="font-bold text-lg">Task</div>
        <FaBars className="text-2xl" />
      </div>
      <div className="px-4 text-xs text-gray-400 mb-2">Complete tasks to earn rewards!</div>
      <div className="flex-1 overflow-y-auto px-2 pb-24">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading tasks...</div>
        ) : (
          tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No tasks found.</div>
          ) : (
            tasks.map((task, i) => {
              const done = ['eligible', 'completed'].includes(task.status) || task.rewardSent;
              return (
                <div key={i} className={`flex items-center bg-[#232b3b] rounded-xl p-4 mb-3 ${done ? 'opacity-60' : ''}`}>
                  <div className={`w-4 h-4 rounded-full mr-4 ${done ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                  <div className="flex-1 font-bold text-base">{TASK_TITLES[task.taskNumber] || `Task #${task.taskNumber}`}</div>
                  {done && <span className="text-green-400 text-xs font-bold ml-2">Done</span>}
                  {!done && <span className="text-yellow-400 text-xs font-bold ml-2">{task.status}</span>}
                </div>
              );
            })
          )
        )}
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-[#232b3b] flex justify-around items-center py-2 border-t border-[#232b3b] z-10">
        <button className="flex flex-col items-center text-gray-400">
          <FaWallet className="text-xl" />
          <span className="text-xs">Wallet</span>
        </button>
        <button className="flex flex-col items-center text-blue-400">
          <FaTasks className="text-xl" />
          <span className="text-xs">Task</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <FaUserFriends className="text-xl" />
          <span className="text-xs">Referral</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <FaBars className="text-xl" />
          <span className="text-xs">Menu</span>
        </button>
      </div>
      <div className="text-center text-xs text-gray-500 mt-2 mb-1">@cointwobot</div>
    </div>
  );
} 