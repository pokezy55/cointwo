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