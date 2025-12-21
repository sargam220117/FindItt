import Call from '../models/callModel.js';

const activeUsers = new Map();
const activeCalls = new Map();

export const initializeSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        socket.on('register-user', (userId) => {
            console.log(`[Socket] User registered: ${userId} → Socket: ${socket.id}`);
            activeUsers.set(userId, socket.id);
            socket.userId = userId;
            io.emit('online-users', Array.from(activeUsers.keys()));
        });

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`[Socket] User ${socket.userId} joined room: ${roomId}`);
        });

        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`[Socket] User ${socket.userId} left room: ${roomId}`);
        });

        socket.on('sendMessage', async (data) => {
            io.to(data.roomId).emit('message', data);
        });

        socket.on('call-offer', async (data) => {
            const { to, from, offer, callType, responseId, callerName } = data;

            console.log(`[WebRTC] Call offer from ${from} to ${to} (${callType})`);

            try {
                const call = await Call.create({
                    caller: from,
                    callee: to,
                    callType,
                    responseId,
                    status: 'ringing',
                });

                const callId = call._id.toString();
                activeCalls.set(callId, {
                    caller: from,
                    callee: to,
                    callType,
                    startTime: Date.now(),
                    callRecordId: callId,
                });

                const targetSocketId = activeUsers.get(to);

                if (targetSocketId) {
                    io.to(targetSocketId).emit('incoming-call', {
                        from,
                        offer,
                        callType,
                        callId,
                        callerName,
                        responseId,
                    });

                    console.log(`[WebRTC] Offer sent to ${to} via socket ${targetSocketId}`);
                } else {
                    console.log(`[WebRTC] User ${to} is not online`);
                    socket.emit('call-failed', {
                        reason: 'User is not online',
                        to,
                    });

                    await Call.findByIdAndUpdate(callId, { status: 'missed' });
                    activeCalls.delete(callId);
                }
            } catch (error) {
                console.error('[WebRTC] Error handling call offer:', error);
                socket.emit('call-failed', {
                    reason: 'Server error',
                    error: error.message,
                });
            }
        });

        socket.on('call-answer', async (data) => {
            const { to, from, answer, callId } = data;

            console.log(`[WebRTC] Call answer from ${from} to ${to}`);

            try {
                await Call.findByIdAndUpdate(callId, {
                    status: 'connected',
                    startedAt: new Date(),
                });

                const callerSocketId = activeUsers.get(to);

                if (callerSocketId) {
                    io.to(callerSocketId).emit('call-answered', {
                        from,
                        answer,
                        callId,
                    });

                    console.log(`[WebRTC] Answer sent to ${to} via socket ${callerSocketId}`);
                } else {
                    console.log(`[WebRTC] Caller ${to} is no longer online`);
                    socket.emit('call-failed', {
                        reason: 'Caller disconnected',
                    });
                }
            } catch (error) {
                console.error('[WebRTC] Error handling call answer:', error);
            }
        });

        socket.on('ice-candidate', (data) => {
            const { to, from, candidate } = data;

            console.log(`[WebRTC] ICE candidate from ${from} to ${to}`);

            const targetSocketId = activeUsers.get(to);

            if (targetSocketId) {
                io.to(targetSocketId).emit('ice-candidate', {
                    from,
                    candidate,
                });

                console.log(`[WebRTC] ICE candidate forwarded to ${to}`);
            } else {
                console.log(`[WebRTC] Cannot forward ICE candidate - user ${to} not online`);
            }
        });

        socket.on('call-rejected', async (data) => {
            const { callId, to, from } = data;

            console.log(`[WebRTC] Call rejected by ${from}`);

            try {
                await Call.findByIdAndUpdate(callId, {
                    status: 'rejected',
                    endedAt: new Date(),
                });
                activeCalls.delete(callId);

                const callerSocketId = activeUsers.get(to);
                if (callerSocketId) {
                    io.to(callerSocketId).emit('call-rejected', {
                        from,
                        callId,
                    });
                }

                console.log(`[WebRTC] Call rejection sent to ${to}`);
            } catch (error) {
                console.error('[WebRTC] Error handling call rejection:', error);
            }
        });

        socket.on('end-call', async (data) => {
            const { callId, to, from } = data;

            console.log(`[WebRTC] Call ended by ${from}`);

            try {
                const callData = activeCalls.get(callId);

                if (callData) {
                    const duration = Math.floor((Date.now() - callData.startTime) / 1000);

                    await Call.findByIdAndUpdate(callId, {
                        status: 'completed',
                        duration,
                        endedAt: new Date(),
                    });

                    activeCalls.delete(callId);

                    console.log(`[WebRTC] Call completed - Duration: ${duration}s`);
                }

                const targetSocketId = activeUsers.get(to);
                if (targetSocketId) {
                    io.to(targetSocketId).emit('call-ended', {
                        from,
                        callId,
                    });

                    console.log(`[WebRTC] Call end notification sent to ${to}`);
                }
            } catch (error) {
                console.error('[WebRTC] Error handling call end:', error);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);

            const userId = socket.userId;

            if (userId) {
                activeUsers.delete(userId);
                io.emit('online-users', Array.from(activeUsers.keys()));

                for (const [callId, callData] of activeCalls.entries()) {
                    if (callData.caller === userId || callData.callee === userId) {
                        console.log(`[WebRTC] User ${userId} disconnected during call ${callId}`);

                        const otherUserId = callData.caller === userId ? callData.callee : callData.caller;
                        const otherSocketId = activeUsers.get(otherUserId);

                        if (otherSocketId) {
                            io.to(otherSocketId).emit('peer-disconnected', {
                                callId,
                                userId,
                            });
                        }

                        try {
                            const duration = Math.floor((Date.now() - callData.startTime) / 1000);
                            await Call.findByIdAndUpdate(callId, {
                                status: 'failed',
                                duration,
                                endedAt: new Date(),
                            });
                        } catch (error) {
                            console.error('[WebRTC] Error updating call on disconnect:', error);
                        }

                        activeCalls.delete(callId);
                    }
                }
            }
        });
    });

    console.log('[Socket] WebRTC signaling handlers initialized');
};

export const getActiveUsers = () => {
    return Array.from(activeUsers.entries());
};

export const getActiveCalls = () => {
    return Array.from(activeCalls.entries());
};
