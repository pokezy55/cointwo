import { createContext, useContext, useState, useEffect } from 'react';

const NETWORKS = [
  { name: 'Ethereum', chainId: 1, symbol: 'ETH', logo: '/eth.svg', rpc: 'https://rpc.ankr.com/eth' },
  { name: 'BNB Smart Chain', chainId: 56, symbol: 'BNB', logo: '/bnb.svg', rpc: 'https://rpc.ankr.com/bsc' },
  { name: 'Polygon', chainId: 137, symbol: 'MATIC', logo: '/polygon.svg', rpc: 'https://rpc.ankr.com/polygon' },
  { name: 'Base', chainId: 8453, symbol: 'ETH', logo: '/base.svg', rpc: 'https://mainnet.base.org' },
];

const defaultNetwork = NETWORKS[0];

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    const n = localStorage.getItem('selectedNetwork');
    return n ? JSON.parse(n) : defaultNetwork;
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('selectedNetwork', JSON.stringify(selectedNetwork));
  }, [selectedNetwork]);

  return (
    <AuthContext.Provider value={{ user, setUser, selectedNetwork, setSelectedNetwork, NETWORKS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 