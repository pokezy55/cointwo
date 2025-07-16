import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);

  // Cek param ref_username dari URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refUsername = params.get('ref_username');
    if (refUsername) {
      localStorage.setItem('ref_username', refUsername);
    }
  }, []);

  // Dummy login handler
  const handleLogin = () => {
    const refUsername = localStorage.getItem('ref_username');
    const user = { id: 'dummy-id', address: '0x123...', email };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    // Kirim ref_username ke backend saat register/login/import wallet
    // (Implementasi POST ke backend, tambahkan ref_username jika ada)
    // Setelah sukses, hapus ref_username dari localStorage
    if (refUsername) localStorage.removeItem('ref_username');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200/60 via-white to-blue-100/80 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-slate-800 drop-shadow">Login</h1>
        <form className="w-full flex flex-col gap-5" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 text-lg shadow"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 text-lg shadow"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 transition mb-2 mt-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth; 