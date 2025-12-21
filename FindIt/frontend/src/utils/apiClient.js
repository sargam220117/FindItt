import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;

            // Handle specific status codes
            if (status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (status === 403) {
                console.error('Forbidden:', data.message);
            } else if (status === 404) {
                console.error('Not found:', data.message);
            } else if (status >= 500) {
                console.error('Server error:', data.message);
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network error: No response from server');
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Helper function for fetch-style requests with auth
export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

// Export
export { API_URL };
export default apiClient;
