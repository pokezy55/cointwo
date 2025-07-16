import { FaBars, FaWallet, FaTasks, FaUserFriends } from 'react-icons/fa';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-[#181f2a] flex flex-col text-white">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="font-bold text-lg">Menu</div>
        <FaBars className="text-2xl" />
      </div>
      <div className="px-4 text-xs text-gray-400 mb-2">Settings & Info</div>
      <div className="flex flex-col gap-4 px-4 mt-4">
        <button className="bg-[#232b3b] rounded-xl p-4 text-left font-bold hover:bg-[#2d3648] transition">Profile</button>
        <button className="bg-[#232b3b] rounded-xl p-4 text-left font-bold hover:bg-[#2d3648] transition">Change Password</button>
        <button className="bg-[#232b3b] rounded-xl p-4 text-left font-bold hover:bg-[#2d3648] transition">About</button>
        <button className="bg-[#232b3b] rounded-xl p-4 text-left font-bold hover:bg-[#2d3648] transition">Logout</button>
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-[#232b3b] flex justify-around items-center py-2 border-t border-[#232b3b] z-10">
        <button className="flex flex-col items-center text-gray-400">
          <FaWallet className="text-xl" />
          <span className="text-xs">Wallet</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <FaTasks className="text-xl" />
          <span className="text-xs">Task</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <FaUserFriends className="text-xl" />
          <span className="text-xs">Referral</span>
        </button>
        <button className="flex flex-col items-center text-blue-400">
          <FaBars className="text-xl" />
          <span className="text-xs">Menu</span>
        </button>
      </div>
      <div className="text-center text-xs text-gray-500 mt-2 mb-1">@cointwobot</div>
    </div>
  );
} 