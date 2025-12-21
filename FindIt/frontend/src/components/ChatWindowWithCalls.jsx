import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Phone, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import { fetchWithAuth } from '../utils/apiClient';
import useWebRTC from '../hooks/useWebRTC';
import CallModal from './CallModal';
import CallScreen from './CallScreen';

const ChatWindowWithCalls = ({ responseId, onClose, otherUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useAuth();
    const { socket } = useSocket();
    const { error: showError, warning: showWarning } = useNotification();
    const messageEndRef = useRef(null);
    const socketRef = useRef();

    const [callState, setCallState] = useState('idle');
    const [callType, setCallType] = useState('audio');
    const [incomingCallData, setIncomingCallData] = useState(null);
    const [currentCallId, setCurrentCallId] = useState(null);
    const webRTC = useWebRTC(
        socket,
        user?._id,
        otherUser?._id,
        callType
    );

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetchWithAuth(`/api/chat/${responseId}`);
                const data = await res.json();
                setMessages(data);

                await fetchWithAuth(`/api/chat/${responseId}/read`, { method: 'PUT' });
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [responseId]);

    useEffect(() => {
        if (!socket) return;

        socketRef.current = socket;
        socket.emit('joinRoom', responseId);

        socket.on('message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('incoming-call', async (data) => {
            console.log('[ChatWindow] Incoming call:', data);
            setIncomingCallData(data);
            setCallType(data.callType);
            setCallState('incoming');
            setCurrentCallId(data.callId);
        });

        socket.on('call-answered', async (data) => {
            console.log('[ChatWindow] Call answered:', data);
            try {
                await webRTC.handleAnswer(data.answer);
                setCallState('active');
            } catch (error) {
                console.error('[ChatWindow] Error handling answer:', error);
            }
        });

        socket.on('ice-candidate', async (data) => {
            console.log('[ChatWindow] ICE candidate received');
            try {
                await webRTC.addIceCandidate(data.candidate);
            } catch (error) {
                console.error('[ChatWindow] Error adding ICE candidate:', error);
            }
        });

        socket.on('call-rejected', () => {
            console.log('[ChatWindow] Call rejected');
            showWarning('Call was rejected');
            handleEndCall();
        });

        socket.on('call-ended', (data) => {
            console.log('[ChatWindow] Call ended by peer:', data);
            console.log('[ChatWindow] Current call state before cleanup:', { callState, currentCallId });
            handleEndCall();
        });

        socket.on('peer-disconnected', () => {
            console.log('[ChatWindow] Peer disconnected');
            showWarning('The other user disconnected');
            handleEndCall();
        });

        socket.on('call-failed', (data) => {
            console.log('[ChatWindow] Call failed:', data.reason);
            showError(`Call failed: ${data.reason}`);
            handleEndCall();
        });

        return () => {
            socket.emit('leaveRoom', responseId);
            socket.off('message');
            socket.off('incoming-call');
            socket.off('call-answered');
            socket.off('ice-candidate');
            socket.off('call-rejected');
            socket.off('call-ended');
            socket.off('peer-disconnected');
            socket.off('call-failed');
        };
    }, [socket, responseId, webRTC]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetchWithAuth(`/api/chat/${responseId}`, {
                method: 'POST',
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const initiateCall = async (type) => {
        if (!socket) {
            showError('Not connected to server. Please refresh the page.');
            return;
        }

        setCallType(type);
        setCallState('calling');

        try {
            const { offer, callId } = await webRTC.createOffer(type);

            socket.emit('call-offer', {
                to: otherUser._id,
                from: user._id,
                offer,
                callType: type,
                responseId,
                callerName: user.name,
            });

            console.log('[ChatWindow] Call offer sent, type:', type);
        } catch (error) {
            console.error('[ChatWindow] Error initiating call:', error);
            showError('Failed to start call. Please check microphone permissions.');
            handleEndCall();
        }
    };

    const acceptCall = async () => {
        try {
            const { answer, callId } = await webRTC.handleOffer(
                incomingCallData.offer,
                incomingCallData.callId
            );

            socket.emit('call-answer', {
                to: otherUser._id,
                from: user._id,
                answer,
                callId: incomingCallData.callId,
            });

            setCallState('active');
            console.log('[ChatWindow] Call accepted');
        } catch (error) {
            console.error('[ChatWindow] Error accepting call:', error);
            showError('Failed to accept call. Please check microphone permissions.');
            handleEndCall();
        }
    };

    const rejectCall = () => {
        if (socket && incomingCallData) {
            socket.emit('call-rejected', {
                to: otherUser._id,
                from: user._id,
                callId: incomingCallData.callId,
            });
        }
        handleEndCall();
    };

    const handleEndCall = () => {
        console.log('[ChatWindow] handleEndCall called');
        console.log('[ChatWindow] State:', { callState, currentCallId, hasSocket: !!socket });

        if (socket && currentCallId) {
            console.log('[ChatWindow] Sending end-call event to:', otherUser._id, 'callId:', currentCallId);
            socket.emit('end-call', {
                to: otherUser._id,
                from: user._id,
                callId: currentCallId,
            });
        } else {
            console.warn('[ChatWindow] NOT sending end-call - missing socket or callId:', {
                hasSocket: !!socket,
                currentCallId
            });
        }

        console.log('[ChatWindow] Cleaning up call state');
        webRTC.closeConnection();
        setCallState('idle');
        setIncomingCallData(null);
        setCurrentCallId(null);
    };

    if (callState === 'active') {
        return (
            <CallScreen
                callType={callType}
                localStream={webRTC.localStream}
                remoteStream={webRTC.remoteStream}
                isMuted={webRTC.isMuted}
                onToggleMute={webRTC.toggleAudio}
                onEndCall={handleEndCall}
                remoteName={otherUser?.name || 'User'}
                connectionState={webRTC.connectionState}
                callDuration={webRTC.callDuration}
            />
        );
    }

    return (
        <>
            <CallModal
                callerName={incomingCallData?.callerName || otherUser?.name || 'User'}
                callType={callType}
                onAccept={acceptCall}
                onReject={rejectCall}
                isVisible={callState === 'incoming'}
            />

            <div className="fixed bottom-6 right-6 w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-vivid-500/10 dark:shadow-vivid-500/20 z-50 flex flex-col max-h-[650px] border border-slate-200 dark:border-slate-700 overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-vivid-600 via-rose-500 to-electric-600 px-6 py-4 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-vivid-400/20 to-electric-400/20 animate-pulse"></div>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold border-2 border-white/30 shadow-lg">
                            {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">{otherUser?.name || 'Chat'}</h3>
                            <p className="text-xs text-white/90 flex items-center gap-1">
                                <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse shadow-lg shadow-lime-400/50"></span>
                                Active now
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                        <button
                            onClick={() => initiateCall('audio')}
                            disabled={callState !== 'idle'}
                            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                        >
                            <Phone className="w-5 h-5 text-white" />
                        </button>



                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white/20 hover:bg-red-500/90 rounded-xl transition-all hover:scale-110 active:scale-95"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {callState === 'calling' && (
                    <div className="bg-gradient-to-r from-electric-50 to-vivid-50 dark:from-electric-900/20 dark:to-vivid-900/20 px-4 py-3 border-b border-electric-200 dark:border-electric-800/30">
                        <p className="text-sm text-electric-700 dark:text-electric-300 flex items-center gap-2 font-medium">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-electric-500"></span>
                            </div>
                            Calling {otherUser?.name}...
                        </p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 space-y-4">
                    {messages.map((message, index) => {
                        const isOwnMessage = message.sender?._id === user?._id;
                        const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id;

                        return (
                            <div
                                key={message._id || index}
                                className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
                            >
                                {!isOwnMessage && (
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-vivid-500 to-electric-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                                            {message.sender?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    </div>
                                )}

                                <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    {showAvatar && !isOwnMessage && (
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
                                            {message.sender?.name || 'User'}
                                        </span>
                                    )}
                                    <div
                                        className={`
                                            px-4 py-3 rounded-2xl shadow-sm
                                            ${isOwnMessage
                                                ? 'bg-gradient-to-br from-vivid-500 to-rose-500 text-white rounded-br-md'
                                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-md'
                                            }
                                        `}
                                    >
                                        <p className="text-sm leading-relaxed break-words">{message.content}</p>
                                    </div>
                                    <span className={`text-xs text-slate-500 dark:text-slate-500 px-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </span>
                                </div>

                                {isOwnMessage && (
                                    <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-vivid-600 to-rose-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                                            {user?.name?.charAt(0).toUpperCase() || 'Y'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messageEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="
                                    w-full px-5 py-3.5 rounded-2xl
                                    bg-slate-100 dark:bg-slate-800
                                    border-2 border-transparent
                                    focus:border-vivid-500 focus:bg-white dark:focus:bg-slate-900
                                    focus:outline-none
                                    text-slate-900 dark:text-white
                                    placeholder-slate-500 dark:placeholder-slate-400
                                    transition-all duration-200
                                    text-sm
                                "
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="
                                px-5 py-3.5 rounded-2xl
                                bg-gradient-to-r from-vivid-600 to-electric-600
                                hover:from-vivid-700 hover:to-electric-700
                                text-white font-semibold
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-200
                                hover:scale-105 active:scale-95
                                shadow-lg shadow-vivid-500/30
                                disabled:shadow-none
                                text-sm
                            "
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChatWindowWithCalls;
