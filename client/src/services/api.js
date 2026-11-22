import axios from 'axios';

// Create Axios Instance with default settings
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockmate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error extractor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      status: error.response?.status,
      data: error.response?.data,
    };

    // If 401 Unauthorized occurs, handle logout
    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      if (localStorage.getItem('stockmate_token')) {
        localStorage.removeItem('stockmate_token');
        localStorage.removeItem('stockmate_user');
        window.location.href = '/login?sessionExpired=true';
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
