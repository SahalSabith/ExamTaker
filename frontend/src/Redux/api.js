import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({ baseURL: BASE_URL });

const sendToLogin = (message) => {
  localStorage.clear();
  localStorage.setItem('auth_message', message);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access');
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const url = originalRequest?.url || '';
      const isRoleEndpoint = url.includes('/student/') || url.includes('/teacher/');

      if (user && isRoleEndpoint) {
        sendToLogin('Your login session does not match this account. Please login again.');
      }

      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        sendToLogin('Your session expired. Please login again.');
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);
        api.defaults.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        sendToLogin('Your session could not be verified. Please login again.');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
