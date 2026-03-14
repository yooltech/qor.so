import axios from 'axios';

const getBaseURL = () => {
    const metaBase = document.querySelector('meta[name="api-base-url"]')?.content;
    if (metaBase) return metaBase;

    // Fallback: If we are in a subfolder like /chs/noteshare-express/, 
    // we should try to detect it from the path.
    const path = window.location.pathname;
    const subfolderMatch = path.match(/^\/([^/]+\/[^/]+)\//);
    if (subfolderMatch) {
        return `/${subfolderMatch[1]}/api`;
    }
    
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    }
});

// Interceptor to handle token for Sanctum
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle 401 errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
