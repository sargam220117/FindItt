import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

export const sendOtp = async (email) => {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
};

export const verifyOtp = async (email, otp) => {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return response.data;
};

export const signup = async (email, otp, name) => {
    const response = await axios.post(`${API_URL}/signup`, { email, otp, name });

    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data;
};

export const login = async (email, otp) => {
    const response = await axios.post(`${API_URL}/login`, { email, otp });

    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
};

export const getCurrentUser = () => {
    return localStorage.getItem('token');
};
