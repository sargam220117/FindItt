import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (user) {
            console.log('[SocketContext] User logged in, initializing socket connection');

            const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('[SocketContext] Socket connected:', newSocket.id);
                setIsConnected(true);
                if (user._id) {
                    console.log('[SocketContext] Registering user:', user._id);
                    newSocket.emit('register-user', user._id);
                }
            });

            newSocket.on('disconnect', () => {
                console.log('[SocketContext] Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('[SocketContext] Connection error:', error);
                setIsConnected(false);
            });

            return () => {
                console.log('[SocketContext] Cleaning up socket connection');
                newSocket.close();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            if (socketRef.current) {
                console.log('[SocketContext] User logged out, closing socket');
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};
