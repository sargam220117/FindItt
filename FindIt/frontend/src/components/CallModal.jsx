import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

const CallModal = ({ callerName, callType, onAccept, onReject, isVisible }) => {
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setPulse(true);
            const interval = setInterval(() => {
                setPulse((prev) => !prev);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-scaleIn">
                <div className="flex justify-center mb-6">
                    <div
                        className={`relative ${pulse ? 'scale-110' : 'scale-100'
                            } transition-transform duration-500`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full">
                            {callType === 'video' ? (
                                <Video className="w-12 h-12 text-white" />
                            ) : (
                                <Phone className="w-12 h-12 text-white" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{callerName}</p>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onReject}
                        className="group relative bg-red-500 hover:bg-red-600 text-white p-6 rounded-full shadow-lg transform transition-all duration-200 hover:scale-110 active:scale-95"
                        aria-label="Reject call"
                    >
                        <PhoneOff className="w-8 h-8 rotate-135" />
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Reject
                        </div>
                    </button>

                    <button
                        onClick={onAccept}
                        className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-6 rounded-full shadow-lg transform transition-all duration-200 hover:scale-110 active:scale-95"
                        aria-label="Accept call"
                    >
                        <Phone className="w-8 h-8" />
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Accept
                        </div>
                    </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-8">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .rotate-135 {
          transform: rotate(135deg);
        }
      `}</style>
        </div>
    );
};

export default CallModal;
