import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
});

api.interceptors.response.use(
  res => res,
  err => {
    // Bisa tambahkan toast di sini jika mau
    return Promise.reject(err?.response?.data || err);
  }
);

export async function getTaskStatus(walletAddress: string) {
  const res = await api.get(`/task/status?user=${walletAddress}`);
  return res.data.tasks;
}

export interface UserContextType {
  address: string;
  email?: string;
  user?: any;
  setUser: (user: any) => void;
  logout: () => void;
} 