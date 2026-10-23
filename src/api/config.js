import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://hackas-back.class.fabricadesoftware.ifc.edu.br/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injeta o access token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && token !== 'undefined' && token !== 'null' && !config.url?.includes('/token/')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Em caso de 401, tenta renovar o token e reenviar a requisição original
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/token/')
    ) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL.replace(/\/$/, '')}/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', data.access);
          if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          // refresh falhou — segue para o logout
        }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
