import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

const useWebRTC = (currentUserId, remoteUserId, responseId, callType, socket) => {

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const dataChannelRef = useRef(null);

  const initializePeerConnection = useCallback(() => {
    console.log('[useWebRTC] === FUNCTION CALLED: initializePeerConnection ===');
    try {
      console.log('[useWebRTC] Step 1: Inside try block');
      console.log('[useWebRTC] === START initializePeerConnection ===');
      console.log('[useWebRTC] Initializing peer connection');
      console.log('[useWebRTC] Socket status:', socket ? 'present' : 'null', socket?.connected ? 'connected' : 'disconnected');

      if (peerConnectionRef.current) {
        console.log('[useWebRTC] WARNING: Existing peer connection found, closing it');
        try {
          peerConnectionRef.current.close();
        } catch (e) {
          console.error('[useWebRTC] Error closing existing peer connection:', e);
        }
        peerConnectionRef.current = null;
      }

      console.log('[useWebRTC] Step 2: About to get RTCPeerConnection constructor');
      const RTCPeerConnectionConstructor = 
        window.RTCPeerConnection || 
        window.webkitRTCPeerConnection || 
        window.mozRTCPeerConnection ||
        window.msRTCPeerConnection;

      console.log('[useWebRTC] Step 3: Constructor lookup result:', RTCPeerConnectionConstructor ? 'FOUND' : 'NOT FOUND');

      if (!RTCPeerConnectionConstructor) {
        throw new Error('RTCPeerConnection not supported in this browser');
      }

      console.log('[useWebRTC] Using RTCPeerConnection constructor:', RTCPeerConnectionConstructor.name);

      let peerConnection = null;
      const configs = [
        { iceServers: ICE_SERVERS.iceServers },
        { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
        { iceServers: [] },
        {}
      ];

      console.log('[useWebRTC] Step 4: About to enter config loop');
      console.log('[useWebRTC] ICE_SERVERS available:', ICE_SERVERS ? 'yes' : 'NO');
      console.log('[useWebRTC] Attempting to create RTCPeerConnection with', configs.length, 'configs');

      for (let i = 0; i < configs.length; i++) {
        try {
          console.log('[useWebRTC] Trying config', i, ':', JSON.stringify(configs[i]).substring(0, 100));
          peerConnection = new RTCPeerConnectionConstructor(configs[i]);
          console.log('[useWebRTC] ✅ RTCPeerConnection created successfully with config', i);
          break;
        } catch (error) {
          console.warn(`[useWebRTC] ❌ Config ${i} failed:`, error.message);
          if (i === configs.length - 1) {
            throw new Error(`All RTCPeerConnection configs failed. Last error: ${error.message}`);
          }
        }
      }

      console.log('[useWebRTC] Step 5: After config loop, peerConnection is:', peerConnection ? 'CREATED' : 'NULL');

      if (!peerConnection) {
        throw new Error('Failed to create RTCPeerConnection after all attempts');
      }

      console.log('[useWebRTC] Step 6: About to set up event handlers');
      console.log('[useWebRTC] Setting up event handlers...');

      console.log('[useWebRTC] Step 7a: Setting onicecandidate handler');
      peerConnection.onicecandidate = (event) => {
        console.log('[useWebRTC] onicecandidate event fired:', event.candidate ? 'candidate found' : 'gathering complete');
        if (event.candidate && socket && typeof socket.emit === 'function') {
          console.log('[useWebRTC] Sending ICE candidate:', event.candidate.candidate.substring(0, 50) + '...');
          try {
            socket.emit('ice-candidate', {
              to: remoteUserId,
              from: currentUserId,
              candidate: event.candidate,
              roomId: `${currentUserId}-${remoteUserId}-${responseId}`,
            });
          } catch (e) {
            console.error('[useWebRTC] Error sending ICE candidate:', e);
          }
        } else if (!event.candidate) {
          console.log('[useWebRTC] ICE candidate gathering complete');
        }
      };
      console.log('[useWebRTC] Step 7a: ✅ onicecandidate handler set');

      console.log('[useWebRTC] Step 7b: Setting ontrack handler');
      peerConnection.ontrack = (event) => {
        console.log('[useWebRTC] Remote track received:', event.track.kind);
        try {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        } catch (e) {
          console.error('[useWebRTC] Error handling remote track:', e);
        }
      };
      console.log('[useWebRTC] Step 7b: ✅ ontrack handler set');

      console.log('[useWebRTC] Step 7c: Setting onconnectionstatechange handler');
      peerConnection.onconnectionstatechange = () => {
        console.log('[useWebRTC] Connection state changed:', peerConnection.connectionState);
        console.log('[useWebRTC] ICE connection state:', peerConnection.iceConnectionState);
        console.log('[useWebRTC] Signaling state:', peerConnection.signalingState);
        setConnectionState(peerConnection.connectionState);
      };
      console.log('[useWebRTC] Step 7c: ✅ onconnectionstatechange handler set');

      console.log('[useWebRTC] Step 7d: Setting oniceconnectionstatechange handler');
      peerConnection.oniceconnectionstatechange = () => {
        console.log('[useWebRTC] ICE connection state changed:', peerConnection.iceConnectionState);
        console.log('[useWebRTC] Current connection state:', peerConnection.connectionState);
        setIceConnectionState(peerConnection.iceConnectionState);
      };
      console.log('[useWebRTC] Step 7d: oniceconnectionstatechange handler set');

      console.log('[useWebRTC] All event handlers set up');
      console.log('[useWebRTC] DEBUG: typeof peerConnection =', typeof peerConnection);
      peerConnectionRef.current = peerConnection;
      console.log('[useWebRTC] DEBUG: typeof peerConnectionRef.current =', typeof peerConnectionRef.current);
      
      if (!peerConnectionRef.current) {
        console.error('[useWebRTC] CRITICAL: Ref not set!');
        peerConnectionRef.current = peerConnection;
      }
      
      console.log('[useWebRTC] Final: ref is', peerConnectionRef.current ? 'SET' : 'FAILED');
      console.log('[useWebRTC] === END initializePeerConnection ===');
      return peerConnection;
    } catch (error) {
      console.error('[useWebRTC] === ERROR in initializePeerConnection ===');
      console.error('[useWebRTC] Failed to initialize peer connection:', error.message);
      console.error('[useWebRTC] Error details:', error);
      peerConnectionRef.current = null;
      throw error;
    }
  }, [currentUserId, remoteUserId, responseId]);

  const getLocalStream = useCallback(async () => {
    try {
      console.log('[useWebRTC] Requesting local media:', { audio: true, video: callType === 'video' });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
      });

      console.log('[useWebRTC] Local stream obtained');

      localStreamRef.current = stream;
      setLocalStream(stream);
      if (peerConnectionRef.current) {
        const tracksToAdd = stream.getTracks();
        console.log('[useWebRTC] Adding', tracksToAdd.length, 'tracks to peer connection');
        tracksToAdd.forEach((track) => {
          try {
            console.log('[useWebRTC] Adding track:', track.kind, '- enabled:', track.enabled);
            peerConnectionRef.current.addTrack(track, stream);
            console.log('[useWebRTC] Track added successfully:', track.kind);
          } catch (trackError) {
            console.error('[useWebRTC] Error adding track:', track.kind, trackError);
          }
        });
      } else {
        console.warn('[useWebRTC] Peer connection not available when trying to add tracks');
      }

      return stream;
    } catch (error) {
      console.error('[useWebRTC] Error getting local media:', error);
      throw error;
    }
  }, [callType]);

  const createAndSendOffer = useCallback(async () => {
    try {
      console.log('[useWebRTC] Creating and sending offer');

      if (!socket) {
        throw new Error('Socket.io not connected. Please refresh and try again.');
      }

      if (typeof socket.emit !== 'function') {
        throw new Error('Socket.io emit method not available');
      }

      if (!peerConnectionRef.current) {
        console.log('[useWebRTC] Peer connection not initialized, initializing now...');
        console.log('[useWebRTC] Current peer connection ref:', peerConnectionRef.current);
        try {
          const pc = initializePeerConnection();
          console.log('[useWebRTC] initializePeerConnection returned:', pc ? 'success (PC object returned)' : 'null');
          if (pc) {
            console.log('[useWebRTC] Using returned PC object directly, ref status:', peerConnectionRef.current ? 'already set' : 'not set yet');
          }
        } catch (initError) {
          console.error('[useWebRTC] initializePeerConnection threw error:', initError.message);
          console.error('[useWebRTC] Error stack:', initError.stack);
          throw initError;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[useWebRTC] After timeout, peer connection ref:', peerConnectionRef.current ? 'set' : 'null');
      }
      if (!peerConnectionRef.current) {
        console.error('[useWebRTC] CRITICAL: Peer connection ref is still null after initialization');
        console.error('[useWebRTC] peerConnectionRef.current value:', peerConnectionRef.current);
        console.error('[useWebRTC] This means initializePeerConnection() did not properly set the ref');
        throw new Error('Failed to initialize peer connection - ref not set');
      }

      console.log('[useWebRTC] ✅ Peer connection ready, proceeding to get local stream');

      await getLocalStream();
      console.log('[useWebRTC] Local stream added, now creating offer');

      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      };
      console.log('[useWebRTC] Creating offer with options:', offerOptions);
      const offer = await peerConnectionRef.current.createOffer(offerOptions);

      console.log('[useWebRTC] Offer created successfully');
      console.log('[useWebRTC] Offer type:', offer.type, '- SDP length:', offer.sdp.length);

      console.log('[useWebRTC] Setting local description with offer');
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('[useWebRTC] Local description set successfully');

      if (!socket.connected) {
        throw new Error('Socket.io connection lost. Please reconnect.');
      }
      socket.emit('call-offer', {
        to: remoteUserId,
        from: currentUserId,
        offer,
        callType,
        responseId,
        roomId: `${currentUserId}-${remoteUserId}-${responseId}`,
      });

      console.log('[useWebRTC] Offer sent to remote peer');
      return offer;
    } catch (error) {
      console.error('[useWebRTC] Error creating/sending offer:', error);
      throw error;
    }
  }, [currentUserId, remoteUserId, responseId, callType, socket, getLocalStream, initializePeerConnection]);

  const handleOfferAndCreateAnswer = useCallback(async (offer) => {
    try {
      console.log('[useWebRTC] Handling offer and creating answer');

      if (!socket) {
        throw new Error('Socket.io not connected');
      }

      if (typeof socket.emit !== 'function') {
        throw new Error('Socket.io emit method not available');
      }

      if (!peerConnectionRef.current) {
        console.log('[useWebRTC] Peer connection not initialized, initializing now...');
        console.log('[useWebRTC] Current peer connection ref:', peerConnectionRef.current);
        try {
          const pc = initializePeerConnection();
          console.log('[useWebRTC] initializePeerConnection returned:', pc ? 'success' : 'null');
        } catch (initError) {
          console.error('[useWebRTC] initializePeerConnection threw error:', initError.message);
          console.error('[useWebRTC] Error stack:', initError.stack);
          throw initError;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('[useWebRTC] After timeout, peer connection ref:', peerConnectionRef.current ? 'set' : 'null');
      }
      if (!peerConnectionRef.current) {
        console.error('[useWebRTC] Peer connection ref is still null after initialization');
        console.error('[useWebRTC] peerConnectionRef.current value:', peerConnectionRef.current);
        throw new Error('Failed to initialize peer connection');
      }

      const remoteDesc = new RTCSessionDescription(offer);
      await peerConnectionRef.current.setRemoteDescription(remoteDesc);

      console.log('[useWebRTC] Remote offer set as description');

      await getLocalStream();

      const answer = await peerConnectionRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });

      console.log('[useWebRTC] Answer created');

      await peerConnectionRef.current.setLocalDescription(answer);

      if (!socket.connected) {
        throw new Error('Socket.io connection lost');
      }

      socket.emit('call-answer', {
        to: remoteUserId,
        from: currentUserId,
        answer,
        roomId: `${currentUserId}-${remoteUserId}-${responseId}`,
      });

      console.log('[useWebRTC] Answer sent to caller');
      return answer;
    } catch (error) {
      console.error('[useWebRTC] Error handling offer/creating answer:', error);
      throw error;
    }
  }, [currentUserId, remoteUserId, responseId, callType, socket, getLocalStream, initializePeerConnection]);

  const handleIncomingAnswer = useCallback(async (answer) => {
    try {
      console.log('[useWebRTC] Handling incoming answer');

      if (!peerConnectionRef.current) {
        throw new Error('Peer connection not initialized');
      }

      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnectionRef.current.setRemoteDescription(remoteDesc);

      console.log('[useWebRTC] Remote answer set as description');
    } catch (error) {
      console.error('[useWebRTC] Error handling incoming answer:', error);
      throw error;
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate) => {
    try {
      if (!peerConnectionRef.current) {
        console.warn('[useWebRTC] Peer connection not ready, queuing candidate');
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
      setIsMuted(!isMuted);
      console.log('[useWebRTC] Audio toggled:', audioTracks[0]?.enabled);
    }
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
      console.log('[useWebRTC] Video toggled:', videoTracks[0]?.enabled);
    }
  }, [isVideoOn]);

  const closeConnection = useCallback(() => {
    console.log('[useWebRTC] Closing WebRTC connection');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log('[useWebRTC] Stopped local track:', track.kind);
      });
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log('[useWebRTC] Stopped remote track:', track.kind);
      });
      remoteStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log('[useWebRTC] Peer connection closed');
    }

    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('disconnected');
  }, []);

  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, [closeConnection]);

  return {
    localStream,
    remoteStream,

    connectionState,
    iceConnectionState,
    isMuted,
    isVideoOn,

    initializePeerConnection,
    createAndSendOffer,
    handleOfferAndCreateAnswer,
    handleIncomingAnswer,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    closeConnection,
  };
};

export default useWebRTC;
