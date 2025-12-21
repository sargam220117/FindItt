import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, User } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const CallScreen = ({
    localStream,
    remoteStream,
    isMuted,
    onToggleMute,
    onEndCall,
    remoteName,
    connectionState,
    callDuration,
}) => {
    const remoteAudioRef = useRef(null);
    const currentRemoteAudioStreamRef = useRef(null);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const { error: showError } = useNotification();

    useEffect(() => {
        if (remoteAudioRef.current && remoteStream) {
            const isSameStream = currentRemoteAudioStreamRef.current?.id === remoteStream.id;

            if (isSameStream) {
                console.log('[CallScreen] Audio stream already set, skipping');
                return;
            }

            console.log('[CallScreen] 🔊 Setting remote audio stream:', {
                streamId: remoteStream.id,
                audioTracks: remoteStream.getAudioTracks().length,
                tracks: remoteStream.getAudioTracks().map(t => ({
                    enabled: t.enabled,
                    readyState: t.readyState,
                    muted: t.muted
                }))
            });

            currentRemoteAudioStreamRef.current = remoteStream;

            remoteAudioRef.current.srcObject = remoteStream;

            remoteAudioRef.current.volume = 1.0;
            remoteAudioRef.current.muted = false;

            const playAudio = async () => {
                try {
                    await remoteAudioRef.current.play();
                    setAudioPlaying(true);
                    console.log('[CallScreen] ✅ Audio playing successfully', {
                        volume: remoteAudioRef.current.volume,
                        muted: remoteAudioRef.current.muted,
                        paused: remoteAudioRef.current.paused
                    });
                } catch (error) {
                    console.warn('[CallScreen] ⚠️ Audio autoplay blocked:', error);
                    setAudioPlaying(false);
                }
            };

            playAudio();
        }
    }, [remoteStream]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusColor = () => {
        switch (connectionState) {
            case 'connected':
                return 'bg-green-500';
            case 'connecting':
                return 'bg-yellow-500 animate-pulse';
            case 'disconnected':
            case 'failed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleEnableAudio = async () => {
        console.log('[CallScreen] 🎯 Manual audio enable clicked');

        if (!remoteAudioRef.current) {
            console.error('[CallScreen] No audio element ref');
            return;
        }

        if (!remoteStream) {
            console.error('[CallScreen] No remote stream');
            return;
        }

        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1.0;

        console.log('[CallScreen] Audio element state before play:', {
            srcObject: !!remoteAudioRef.current.srcObject,
            muted: remoteAudioRef.current.muted,
            volume: remoteAudioRef.current.volume,
            paused: remoteAudioRef.current.paused,
            readyState: remoteAudioRef.current.readyState
        });

        for (let i = 0; i < 3; i++) {
            try {
                console.log(`[CallScreen] 🎵 Manual play attempt ${i + 1}/3`);
                await remoteAudioRef.current.play();

                setAudioPlaying(true);
                console.log('[CallScreen] ✅✅✅ AUDIO NOW PLAYING!');
                return;
            } catch (err) {
                console.error(`[CallScreen] ❌ Manual play attempt ${i + 1} failed:`, err);
                if (i < 2) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }

        console.error('[CallScreen] ❌❌❌ ALL MANUAL PLAY ATTEMPTS FAILED');
        alert('Failed to play audio. Please check:\n1. System volume is not muted\n2. Correct audio output device selected\n3. Browser has permission to play audio');
    };


    return (
        <div className="fixed inset-0 bg-gradient-to-br from-vivid-600 via-rose-500 to-electric-600 z-50 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
                <div className="absolute top-8 left-0 right-0 flex justify-center">
                    <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-white/30">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                        <span className="text-white font-semibold text-sm capitalize">
                            {connectionState === 'connected' ? 'Connected' : connectionState}
                        </span>
                    </div>
                </div>

                <div className="mb-8 relative">
                    {!isMuted && (
                        <>
                            <div className="absolute inset-0 -m-8 rounded-full bg-white/20 animate-ping"></div>
                            <div className="absolute inset-0 -m-12 rounded-full bg-white/10 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        </>
                    )}

                    <div className="relative w-48 h-48 rounded-full bg-white/30 backdrop-blur-lg flex items-center justify-center border-4 border-white/50 shadow-2xl">
                        <User className="w-24 h-24 text-white" />
                    </div>
                </div>

                <h2 className="text-4xl font-bold text-white mb-2">{remoteName}</h2>
                <p className="text-white/80 text-lg mb-8">Voice Call</p>

                <div className="text-6xl font-bold text-white mb-16 font-mono">
                    {formatDuration(callDuration)}
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={onToggleMute}
                        className={`
                            w-16 h-16 rounded-full flex items-center justify-center
                            transition-all duration-200 hover:scale-110 active:scale-95
                            shadow-xl
                            ${isMuted
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-white/30 hover:bg-white/40 backdrop-blur-md border-2 border-white/50'
                            }
                        `}
                    >
                        {isMuted ? (
                            <MicOff className="w-7 h-7 text-white" />
                        ) : (
                            <Mic className="w-7 h-7 text-white" />
                        )}
                    </button>

                    <button
                        onClick={onEndCall}
                        className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl"
                    >
                        <PhoneOff className="w-9 h-9 text-white" />
                    </button>
                </div>

                {!audioPlaying && remoteStream && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-vivid-500 to-electric-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                                    <span className="text-4xl">🔊</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Audio Not Playing</h3>
                                <p className="text-gray-600 mb-6">Click the button below to enable audio playback</p>
                                <button
                                    onClick={handleEnableAudio}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-vivid-600 to-electric-600 hover:from-vivid-700 hover:to-electric-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
                                >
                                    🎧 Enable Audio Now
                                </button>
                                <p className="text-sm text-gray-500 mt-4">Your browser blocked automatic audio playback</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <audio
                ref={remoteAudioRef}
                autoPlay
                playsInline
                muted={false}
            />
        </div>
    );
};

export default CallScreen;
