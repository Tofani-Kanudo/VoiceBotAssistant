import React, { useEffect, useRef, useState } from 'react';
import { Typography, Paper, Box, CircularProgress, Fade, Grow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import JarvisCircle from './JarvisCircle';

const START_TEXT = 'Start';

const VoiceBotUI = () => {
    // State management
    const [isRecording, setIsRecording] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isAudioInput, setIsAudioInput] = useState(false);
    const [currentStatus, setCurrentStatus] = useState("Idle");
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [showStartText, setShowStartText] = useState(false);
    const [startTextIndex, setStartTextIndex] = useState(0);
    const [buttonFaded, setButtonFaded] = useState(false);
    const hasUserSpokenRef = useRef(false);
    const theme = useTheme();

    // Refs for audio handling
    const isRecordingRef = useRef(isRecording);
    const ws = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioContextRef = useRef(null);
    const analyserNodeRef = useRef(null);
    const mediaStreamSourceRef = useRef(null);
    const audioRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const audioInputIntervalRef = useRef(null);
    const clientId = useRef(uuidv4());

    useEffect(() => {
        isRecordingRef.current = isRecording;
      }, [isRecording]);

    // WebSocket setup
    useEffect(() => {
        if (isCallActive) {
            ws.current = new WebSocket(`ws://localhost:8000/ws/${clientId.current}`);
            
            ws.current.onmessage = handleWebSocketMessage;
            
            return () => {
                if (ws.current) {
                    ws.current.close();
                }
            };
        }
    }, [isCallActive]);

    const handleWebSocketMessage = async (event) => {
        const response = JSON.parse(event.data);

        if (response.type === 'error') {
            setCurrentStatus(response.message);
            setIsProcessing(false);
            return;
        }

        setCurrentStatus("Processing...");
        setIsProcessing(true);
        
        if (response.type === 'audio') {
            const audioBlob = new Blob(
                [new Uint8Array(atob(response.data).split("").map(c => c.charCodeAt(0)))],
                { type: 'audio/mp3' }
            );
            const audioUrl = URL.createObjectURL(audioBlob);
            playAudio(audioUrl);
            setMessages(prev => [...prev, 'Bot: Audio response received']);
        }
        
        setCurrentStatus("Idle");
        setIsProcessing(false);
    };

    // Audio recording setup
    const setupAudioRecording = async (stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        
        mediaStreamSourceRef.current.connect(analyserNodeRef.current);
        analyserNodeRef.current.fftSize = 256;
        analyserNodeRef.current.smoothingTimeConstant = 0.7;

        mediaRecorderRef.current.onstart = () => {
            setIsRecording(true);
            setCurrentStatus("Recording...");
        };

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            setIsRecording(false);
            setCurrentStatus("Processing audio...");
            if (audioChunksRef.current.length > 0) {
                setIsProcessing(true);
                setCurrentStatus("Sending audio to server...");
                await sendAudio(audioChunksRef.current[0]);
                audioChunksRef.current = [];
            }
            audioContextRef.current.close();
        };
    };

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            await setupAudioRecording(stream);
            hasUserSpokenRef.current = false;
            mediaRecorderRef.current.start();
            startAudioInputDetection();
        } catch (error) {
            console.error('Error starting recording:', error);
            setCurrentStatus("Error: Could not access microphone");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecordingRef.current) {
            mediaRecorderRef.current.stop();
            stopAudioInputDetection();
        }
    };

    // Audio input detection
    const startAudioInputDetection = () => {
        if (audioInputIntervalRef.current) clearInterval(audioInputIntervalRef.current);
        audioInputIntervalRef.current = setInterval(detectAudioInput, 100);
    };

    const stopAudioInputDetection = () => {
        if (audioInputIntervalRef.current) {
            clearInterval(audioInputIntervalRef.current);
            audioInputIntervalRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    };

    const detectAudioInput = () => {
        if (!analyserNodeRef.current) return;

        const bufferLength = analyserNodeRef.current.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyserNodeRef.current.getByteTimeDomainData(dataArray);

        // Calculate RMS
        const rms = Math.sqrt(
            dataArray.reduce((sum, val) => {
                const normalized = (val - 128) / 128;
                return sum + normalized * normalized;
            }, 0) / bufferLength
        );

        const isSoundDetected = rms > 0.03; // You can fine-tune this threshold
        console.log(rms, isSoundDetected);
        setIsAudioInput(isSoundDetected);

        // Track if user has ever spoken
        if (isSoundDetected && !hasUserSpokenRef.current) {
            hasUserSpokenRef.current = true;
        }

        // Silence timeout logic
        if (!isSoundDetected && !silenceTimerRef.current && hasUserSpokenRef.current) {
            silenceTimerRef.current = setTimeout(() => {
                if (isRecordingRef.current) {
                    stopRecording();
                }
            }, 2000);
        } else if (isSoundDetected && silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    };

    // Audio playback
    const playAudio = (url) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        audioRef.current = new Audio(url);
        setIsPlayingAudio(true);
        setCurrentStatus("Playing Audio...");

        audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            setCurrentStatus("Error playing audio");
        });

        audioRef.current.onended = () => {
            setIsPlayingAudio(false);
            setCurrentStatus("Idle");
            if (isCallActive) {
                startRecording();
            }
        };
    };

    // Send audio to server
    const sendAudio = async (audioBlob) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(audioBlob);
        }
    };

    // Animate 'Start' text letter by letter on hover
    useEffect(() => {
        let timer;
        if (showStartText && startTextIndex < START_TEXT.length) {
            timer = setTimeout(() => {
                setStartTextIndex(i => i + 1);
            }, 90);
        } else if (!showStartText) {
            setStartTextIndex(0);
        }
        return () => clearTimeout(timer);
    }, [showStartText, startTextIndex]);

    // Handle start button click
    const handleStart = async () => {
        setButtonFaded(true);
        setTimeout(async () => {
            setHasStarted(true);
            setIsCallActive(true);
            await startRecording();
        }, 400); // match fade duration
    };

    // --- LANDING PAGE ---
    if (!hasStarted) {
        return (
            <Box
                minHeight="100vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ background: theme.palette.background.default }}
            >
                <Fade in={!buttonFaded} timeout={400}>
                    <Box
                        onMouseEnter={() => setShowStartText(true)}
                        onMouseLeave={() => setShowStartText(false)}
                        onClick={handleStart}
                        sx={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            background: showStartText
                                ? `linear-gradient(135deg, ${theme.palette.primary.main} 80%, ${theme.palette.primary.dark} 100%)`
                                : `linear-gradient(135deg, ${theme.palette.primary.light} 60%, ${theme.palette.primary.main} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: theme.shadows[4],
                            cursor: 'pointer',
                            border: `2px solid ${theme.palette.primary.light}`,
                            transition: 'background 0.5s cubic-bezier(.4,2,.6,1), transform 0.3s cubic-bezier(.4,2,.6,1)',
                            '&:hover': { transform: 'scale(1.06)' },
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                color: showStartText ? theme.palette.primary.contrastText : theme.palette.primary.main,
                                fontWeight: 700,
                                letterSpacing: 2,
                                fontSize: 38,
                                userSelect: 'none',
                                transition: 'color 0.4s',
                            }}
                        >
                            {START_TEXT.slice(0, startTextIndex)}
                        </Typography>
                    </Box>
                </Fade>
            </Box>
        );
    }

    // --- MAIN LAYOUT ---
    return (
        <Fade in={hasStarted} timeout={500}>
            <Paper elevation={theme.palette.mode === 'dark' ? 4 : 1} sx={{
                p: 6,
                borderRadius: 4,
                maxWidth: 800,
                mx: 'auto',
                mt: 6,
                background: theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'dark' ? '0 2px 24px 0 rgba(0,0,0,0.45)' : theme.shadows[1],
            }}>
                <Box textAlign="center" mb={4}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, letterSpacing: 1, color: theme.palette.text.primary }}>
                        W-GPT
                    </Typography>
                    <Typography variant="h6" color={isCallActive ? theme.palette.success.main : theme.palette.text.secondary} sx={{ fontWeight: 400, opacity: 0.7 }}>
                        {isCallActive ? 'GPT Connected' : 'GPT Disconnected'}
                    </Typography>
                    {/* <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Typography variant="body1" color={theme.palette.text.primary} sx={{ fontWeight: 300, opacity: 0.7 }}>
                            Current Status: {currentStatus}
                        </Typography>
                    </Box> */}
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ minHeight: '420px', mb: 2 }}
                >
                    <Grow in={hasStarted} timeout={600}>
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
                            <JarvisCircle
                                status={
                                    isPlayingAudio ? 'speaking' :
                                    isProcessing ? 'processing' :
                                    isAudioInput ? 'hearing' :
                                    'idle'
                                }
                                analyserNode={analyserNodeRef.current}
                                size={280}
                            />
                        </Box>
                    </Grow>
                    <Box
                        width="100%"
                        height="200px"
                        overflow="auto"
                        sx={{
                            borderRadius: 2,
                            p: 2,
                            mb: 3,
                            background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.default,
                            boxShadow: theme.palette.mode === 'dark' ? '0 1px 12px 0 rgba(0,0,0,0.35)' : theme.shadows[1],
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: theme.palette.primary.main, letterSpacing: 1 }}>
                            Transcript
                        </Typography>
                        {messages.length === 0 ? (
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ opacity: 0.5 }}>
                                No transcript yet.
                            </Typography>
                        ) : (
                            messages.map((msg, index) => (
                                <Typography
                                    key={index}
                                    variant="body1"
                                    sx={{ mb: 1, fontWeight: msg.startsWith('You:') ? 'bold' : 'normal', color: theme.palette.text.primary }}
                                >
                                    {msg}
                                </Typography>
                            ))
                        )}
                    </Box>
                    {/* <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                        <Typography variant="body1" sx={{ mr: 2, fontWeight: 300, opacity: 0.7, color: theme.palette.text.secondary }}>
                            {isAudioInput ? 'Detecting Sound...' : 'Silent'}
                        </Typography>
                        <CircularProgress
                            color={isAudioInput ? 'primary' : 'inherit'}
                            size={22}
                            variant={isAudioInput ? 'indeterminate' : 'determinate'}
                            value={0}
                            sx={{ opacity: 0.5 }}
                        />
                    </Box> */}
                </Box>
            </Paper>
        </Fade>
    );
};

export default VoiceBotUI;

