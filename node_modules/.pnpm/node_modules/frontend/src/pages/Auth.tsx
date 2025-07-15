import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ...state lain...

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition mb-4">
          Login
        </button>
        <div className="flex justify-between">
          <button className="w-[48%] py-3 rounded-lg bg-gray-100 font-bold text-lg hover:bg-gray-200 transition">
            Register
          </button>
          <button className="w-[48%] py-3 rounded-lg bg-gray-100 font-bold text-lg hover:bg-gray-200 transition">
            Import Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth; 