import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    gradient: 'from-red-500 to-rose-600',
                    buttonBg: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                    iconBg: 'bg-red-100 dark:bg-red-900/30',
                    iconColor: 'text-red-600 dark:text-red-400'
                };
            case 'warning':
                return {
                    gradient: 'from-yellow-500 to-orange-600',
                    buttonBg: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
                    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    iconColor: 'text-yellow-600 dark:text-yellow-400'
                };
            default:
                return {
                    gradient: 'from-vivid-500 to-electric-600',
                    buttonBg: 'from-vivid-500 to-vivid-600 hover:from-vivid-600 hover:to-vivid-700',
                    iconBg: 'bg-vivid-100 dark:bg-vivid-900/30',
                    iconColor: 'text-vivid-600 dark:text-vivid-400'
                };
        }
    };

    const styles = getTypeStyles();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in">
                <div className={`bg-gradient-to-r ${styles.gradient} px-6 py-4 flex items-center justify-between`}>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                            <AlertCircle className={`w-6 h-6 ${styles.iconColor}`} />
                        </div>

                        <div className="flex-1 pt-1">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-3 bg-gradient-to-r ${styles.buttonBg} text-white font-bold rounded-xl transition-all shadow-lg`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
