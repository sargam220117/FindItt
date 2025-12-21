import { useEffect, useRef, useState, useCallback } from 'react';


console.log('🚀 [useWebRTC] AUDIO-ONLY VERSION LOADED');

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
    ],
};

const useWebRTC = (socket, currentUserId, remoteUserId) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionState, setConnectionState] = useState('new');
    const [iceConnectionState, setIceConnectionState] = useState('new');
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const callDurationTimerRef = useRef(null);
    const pendingIceCandidatesRef = useRef([]);

    const initializePeerConnection = useCallback(() => {
        console.log('[useWebRTC] Initializing peer connection');

        if (peerConnectionRef.current) {
            console.log('[useWebRTC] Closing existing peer connection');
            peerConnectionRef.current.close();
        }

        const peerConnection = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = peerConnection;

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socket) {
                console.log('[useWebRTC] Sending ICE candidate to peer');
                socket.emit('ice-candidate', {
                    to: remoteUserId,
                    from: currentUserId,
                    candidate: event.candidate,
                });
            }
        };

        peerConnection.ontrack = (event) => {
            console.log('[useWebRTC] 🎧 Received remote track:', event.track.kind, {
                trackId: event.track.id,
                enabled: event.track.enabled,
                readyState: event.track.readyState,
            });

            if (event.streams && event.streams[0]) {
                const stream = event.streams[0];
                console.log('[useWebRTC] Remote stream updated:', {
                    id: stream.id,
                    audioTracks: stream.getAudioTracks().length,
                    tracks: stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled }))
                });
                setRemoteStream(stream);
            } else {
                console.warn('[useWebRTC] No stream in track event, creating new stream');
                const newStream = new MediaStream([event.track]);
                setRemoteStream(newStream);
            }
        };

        peerConnection.onconnectionstatechange = () => {
            console.log('[useWebRTC] Connection state:', peerConnection.connectionState);
            setConnectionState(peerConnection.connectionState);

            if (peerConnection.connectionState === 'connected') {
                startCallTimer();
            } else if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
                stopCallTimer();
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log('[useWebRTC] ICE connection state:', peerConnection.iceConnectionState);
            setIceConnectionState(peerConnection.iceConnectionState);
        };

        console.log('[useWebRTC] Peer connection initialized');
        return peerConnection;
    }, [socket, currentUserId, remoteUserId]);

    const getLocalStream = useCallback(async () => {
        try {
            console.log('[useWebRTC] 🎤 Requesting microphone access');

            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: false, // NO VIDEO
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            console.log('[useWebRTC] ✅ Audio stream obtained:', {
                streamId: stream.id,
                audioTracks: stream.getAudioTracks().length,
                tracks: stream.getTracks().map(t => ({
                    kind: t.kind,
                    id: t.id,
                    label: t.label,
                    enabled: t.enabled,
                }))
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            if (peerConnectionRef.current) {
                stream.getTracks().forEach((track) => {
                    console.log('[useWebRTC] ➕ Adding track to peer connection:', {
                        kind: track.kind,
                        enabled: track.enabled,
                    });
                    peerConnectionRef.current.addTrack(track, stream);
                });

                const senders = peerConnectionRef.current.getSenders();
                console.log('[useWebRTC] ✅ Senders after adding tracks:', {
                    count: senders.length,
                    tracks: senders.map(s => ({ kind: s.track?.kind, enabled: s.track?.enabled }))
                });
            }

            return stream;
        } catch (error) {
            console.error('[useWebRTC] ❌ Error getting microphone:', error);
            throw error;
        }
    }, []);

    const createOffer = useCallback(async () => {
        try {
            console.log('[useWebRTC] Creating audio-only offer');

            const pc = initializePeerConnection();
            if (!pc) throw new Error('Peer connection not initialized');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: false,
            });

            console.log('[useWebRTC] 🎤 Got local audio stream');
            localStreamRef.current = stream;
            setLocalStream(stream);

            stream.getTracks().forEach((track) => {
                console.log('[useWebRTC] ➕ Adding audio track');
                pc.addTrack(track, stream);
            });

            const senders = pc.getSenders();
            console.log('[useWebRTC] Total senders:', senders.length);

            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false,
            });

            await pc.setLocalDescription(offer);

            console.log('[useWebRTC] ✅ Offer created and set as local description');
            return { offer, callId: Date.now().toString() };
        } catch (error) {
            console.error('[useWebRTC] ❌ Error creating offer:', error);
            throw error;
        }
    }, [initializePeerConnection]);

    const handleOffer = useCallback(async (offer, callId) => {
        try {
            console.log('[useWebRTC] Handling incoming offer');

            if (!peerConnectionRef.current) {
                initializePeerConnection();
            }

            await getLocalStream();

            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            console.log('[useWebRTC] Remote description (offer) set');

            if (pendingIceCandidatesRef.current.length > 0) {
                console.log('[useWebRTC] Adding pending ICE candidates');
                for (const candidate of pendingIceCandidatesRef.current) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingIceCandidatesRef.current = [];
            }

            const answer = await peerConnectionRef.current.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false,
            });

            await peerConnectionRef.current.setLocalDescription(answer);

            console.log('[useWebRTC] ✅ Answer created and set as local description');
            return { answer, callId };
        } catch (error) {
            console.error('[useWebRTC] ❌ Error handling offer:', error);
            throw error;
        }
    }, [initializePeerConnection, getLocalStream]);

    const handleAnswer = useCallback(async (answer) => {
        try {
            console.log('[useWebRTC] Handling incoming answer');

            if (!peerConnectionRef.current) {
                console.error('[useWebRTC] Peer connection not initialized');
                return;
            }

            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('[useWebRTC] ✅ Remote description (answer) set');

            if (pendingIceCandidatesRef.current.length > 0) {
                console.log('[useWebRTC] Adding pending ICE candidates');
                for (const candidate of pendingIceCandidatesRef.current) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingIceCandidatesRef.current = [];
            }
        } catch (error) {
            console.error('[useWebRTC] ❌ Error handling answer:', error);
        }
    }, []);

    const addIceCandidate = useCallback(async (candidate) => {
        try {
            if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) {
                console.log('[useWebRTC] Queuing ICE candidate');
                pendingIceCandidatesRef.current.push(candidate);
                return;
            }

            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('[useWebRTC] ICE candidate added');
        } catch (error) {
            console.error('[useWebRTC] Error adding ICE candidate:', error);
        }
    }, []);

    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            audioTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!audioTracks[0]?.enabled);
            console.log('[useWebRTC] 🔇 Audio toggled:', audioTracks[0]?.enabled ? 'unmuted' : 'muted');
        }
    }, []);

    const startCallTimer = useCallback(() => {
        if (callDurationTimerRef.current) {
            clearInterval(callDurationTimerRef.current);
        }

        setCallDuration(0);
        callDurationTimerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
    }, []);

    const stopCallTimer = useCallback(() => {
        if (callDurationTimerRef.current) {
            clearInterval(callDurationTimerRef.current);
            callDurationTimerRef.current = null;
        }
    }, []);

    const closeConnection = useCallback(() => {
        console.log('[useWebRTC] Closing connection and cleaning up');

        stopCallTimer();

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop();
                console.log('[useWebRTC] Stopped track:', track.kind);
            });
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
            console.log('[useWebRTC] Peer connection closed');
        }

        setLocalStream(null);
        setRemoteStream(null);
        setConnectionState('new');
        setIceConnectionState('new');
        setIsMuted(false);
        setCallDuration(0);
        pendingIceCandidatesRef.current = [];

        console.log('[useWebRTC] ✅ Cleanup complete');
    }, [stopCallTimer]);

    useEffect(() => {
        return () => {
            if (callDurationTimerRef.current) {
                clearInterval(callDurationTimerRef.current);
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, []);

    return {
        localStream,
        remoteStream,
        connectionState,
        iceConnectionState,
        isMuted,
        callDuration,

        createOffer,
        handleOffer,
        handleAnswer,
        addIceCandidate,
        toggleAudio,
        closeConnection,
    };
};

export default useWebRTC;
