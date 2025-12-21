import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        const notification = { id, message, type, duration };

        setNotifications(prev => [...prev, notification]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const success = useCallback((message, duration) => showNotification(message, 'success', duration), [showNotification]);
    const error = useCallback((message, duration) => showNotification(message, 'error', duration), [showNotification]);
    const warning = useCallback((message, duration) => showNotification(message, 'warning', duration), [showNotification]);
    const info = useCallback((message, duration) => showNotification(message, 'info', duration), [showNotification]);

    return (
        <NotificationContext.Provider value={{ success, error, warning, info, showNotification, removeNotification }}>
            {children}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
};

const NotificationContainer = ({ notifications, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            {notifications.map(notification => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onClose={() => onRemove(notification.id)}
                />
            ))}
        </div>
    );
};

const Toast = ({ notification, onClose }) => {
    const { message, type } = notification;

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    gradient: 'from-green-500 to-emerald-600',
                    icon: <CheckCircle className="w-5 h-5" />,
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-500',
                    text: 'text-green-900 dark:text-green-100'
                };
            case 'error':
                return {
                    gradient: 'from-red-500 to-rose-600',
                    icon: <AlertCircle className="w-5 h-5" />,
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-500',
                    text: 'text-red-900 dark:text-red-100'
                };
            case 'warning':
                return {
                    gradient: 'from-yellow-500 to-orange-600',
                    icon: <AlertTriangle className="w-5 h-5" />,
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    border: 'border-yellow-500',
                    text: 'text-yellow-900 dark:text-yellow-100'
                };
            case 'info':
            default:
                return {
                    gradient: 'from-vivid-500 to-electric-600',
                    icon: <Info className="w-5 h-5" />,
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-vivid-500',
                    text: 'text-blue-900 dark:text-blue-100'
                };
        }
    };

    const styles = getStyles();

    return (
        <div className="pointer-events-auto animate-slide-in-right">
            <div className={`
                min-w-[320px] max-w-md
                ${styles.bg}
                border-l-4 ${styles.border}
                rounded-lg shadow-lg
                p-4
                flex items-start gap-3
                backdrop-blur-sm
            `}>
                <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full
                    bg-gradient-to-br ${styles.gradient}
                    flex items-center justify-center
                    text-white
                `}>
                    {styles.icon}
                </div>

                <div className="flex-1 pt-1">
                    <p className={`text-sm font-medium ${styles.text} whitespace-pre-line`}>
                        {message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className={`
                        flex-shrink-0 p-1 rounded-lg
                        hover:bg-gray-200 dark:hover:bg-gray-700
                        transition-colors
                        ${styles.text}
                    `}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default NotificationContext;
