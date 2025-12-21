import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-red-900/20 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                                We encountered an unexpected error. Don't worry, this has been logged and we'll look into it.
                            </p>

                            {import.meta.env.DEV && this.state.error && (
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-6 overflow-auto max-h-64">
                                    <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            )}

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="px-6 py-3 bg-gradient-to-r from-vivid-500 to-electric-600 hover:from-vivid-600 hover:to-electric-700 text-white font-bold rounded-xl transition-all shadow-lg"
                                >
                                    Go to Home
                                </button>
                                <button
                                    onClick={this.handleReset}
                                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
