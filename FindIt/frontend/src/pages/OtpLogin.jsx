import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOtp, login } from '../services/authService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Mail, Lock, Clock, ArrowRight, RefreshCw, LogIn } from 'lucide-react';

const OtpLogin = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpExpiry, setOtpExpiry] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (otpExpiry) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
                setTimeRemaining(remaining);

                if (remaining === 0) {
                    toast.error('OTP expired. Please request a new one.');
                    setStep(1);
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [otpExpiry]);

    useEffect(() => {
        if (step === 2 && !canResend) {
            const timer = setTimeout(() => {
                setCanResend(true);
            }, 60000);

            return () => clearTimeout(timer);
        }
    }, [step, canResend]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await sendOtp(email);
            toast.success(response.message || 'OTP sent to your email!');
            setOtpExpiry(Date.now() + 5 * 60 * 1000);
            setStep(2);
            setCanResend(false);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) {
            toast.warning('Please wait before requesting another OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await sendOtp(email);
            toast.success(response.message || 'OTP resent successfully!');
            setOtpExpiry(Date.now() + 5 * 60 * 1000);
            setCanResend(false);
            setOtp('');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to resend OTP';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await login(email, otp);
            toast.success(response.message || 'Login successful!');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                        <LogIn className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Login to FindIt with secure OTP verification
                    </p>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4">
                        {[1, 2].map((num) => (
                            <div key={num} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step >= num
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-110'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}
                                >
                                    {num}
                                </div>
                                {num < 2 && (
                                    <div
                                        className={`h-1 w-20 mx-2 transition-all duration-300 ${step > num
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-around mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>Email</span>
                        <span>Verify OTP</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 dark:bg-gray-800 shadow-2xl rounded-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">

                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Enter OTP
                                    </label>
                                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                        <Clock className="h-4 w-4" />
                                        {formatTime(timeRemaining)}
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl font-bold tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="000000"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    We sent a 6-digit code to <strong>{email}</strong>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Login
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={!canResend || loading}
                                className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {canResend ? 'Resend OTP' : 'Wait 1 minute to resend'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                            >
                                Change Email
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            to="/otp-signup"
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OtpLogin;
