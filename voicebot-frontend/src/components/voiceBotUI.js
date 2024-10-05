import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, Paper, Box, IconButton, CircularProgress } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import { v4 as uuidv4 } from 'uuid';

const Voicebot = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isAudioInput, setIsAudioInput] = useState(false); // New state for audio input indication
    const [silenceTimer, setSilenceTimer] = useState(null);  // Timer for silence tracking
    const [isPlayingAudio, setIsPlayingAudio] = useState(false); // Track audio playback state
    const [currentStatus, setCurrentStatus] = useState("Idle");
    const ws = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioContextRef = useRef(null); // Ref for AudioContext
    const analyserNodeRef = useRef(null); // Ref for AnalyserNode
    const mediaStreamSourceRef = useRef(null); // Ref for MediaStreamSource
    const clientId = uuidv4();
    let audio;

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

        ws.current.onmessage = async (event) => {
            const response = JSON.parse(event.data); // Parse the JSON response

            if (response.type === 'error') {
                // Handle error messages
                setCurrentStatus(response.message);
                return;
            }

            setCurrentStatus("Processing...");
            if (response.type === 'audio') {
                // Bot's audio response
                const audioBlob = new Blob([new Uint8Array(atob(response.data).split("").map(c => c.charCodeAt(0)))], { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                playAudio(audioUrl); // Play the received audio
                setMessages((prev) => [...prev, 'Bot: Audio response received']);
            }
            setCurrentStatus("Idle"); // Reset status after processing
        };

    }, []);

    const startRecording = async () => {
        setCurrentStatus("Recording...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();

        // Initialize AudioContext and AnalyserNode for audio input detection
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        mediaStreamSourceRef.current.connect(analyserNodeRef.current);
        analyserNodeRef.current.fftSize = 256;

        // Periodically check if there is audio input
        const checkAudioInterval = setInterval(detectAudioInput, 200);

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            clearInterval(checkAudioInterval); // Stop audio input check when recording stops
            audioContextRef.current.close(); // Close AudioContext
            sendAudio(audioChunksRef.current[0]);
            audioChunksRef.current = []; // Reset for next recording
        };

        setIsRecording(true);
    };

    const detectAudioInput = () => {
        if (analyserNodeRef.current) {
            const bufferLength = analyserNodeRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserNodeRef.current.getByteFrequencyData(dataArray);
            const maxValue = Math.max(...dataArray);
            console.log(maxValue);

            // Check the volume levels to determine if there is sound
            const isSoundDetected = dataArray.some(value => value > 125); // Threshold to detect sound
            setIsAudioInput(isSoundDetected);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setCurrentStatus("Idle");
            setIsRecording(false);
        } else {
            console.warn("MediaRecorder is not initialized or already stopped.");
        }
    };
    
const sendAudio = async (audioBlob) => {
    // const arrayBuffer = await new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //         resolve(reader.result); // Resolve with the result
    //     };
    //     reader.onerror = reject; // Reject on error
    //     reader.readAsArrayBuffer(audioBlob); // Read the audio Blob
    // });

    // Send audio as ArrayBuffer
    ws.current.send(audioBlob);
};

    const playAudio = (url) => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        audio = new Audio(url);
        setIsPlayingAudio(true);
        setCurrentStatus("Playing Audio...");

        audio.play().catch((error) => {
            console.error("Error playing audio:", error);
        });

        audio.onended = () => {
            setIsPlayingAudio(false);
            setCurrentStatus("Idle");
            startRecording();
        };
    };

    const handleCallToggle = () => {
        if (isCallActive) {
            stopRecording();
            mediaRecorderRef.current.stop();
            ws.current.close();
        } else {
            startRecording();
        }
        setIsCallActive(!isCallActive);
    };

    useEffect(() => {
        if (!isAudioInput) {
            if (!silenceTimer) {
                const timer = setTimeout(() => {
                    stopRecording();
                }, 3000);
                setSilenceTimer(timer);
            }
        } else {
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                setSilenceTimer(null);
            }
        }
    }, [isAudioInput]);
    
    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Box textAlign="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Virtual Customer Success Voicebot
                </Typography>
                <Typography variant="h6" color={isCallActive ? "success.main" : "text.secondary"}>
                    {isCallActive ? 'Call Connected' : 'Call Disconnected'}
                </Typography>
                <Typography variant="body1" color="text.primary">
                    Current Status: {currentStatus}
                </Typography>
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: '300px', mb: 2 }}
            >
                <Box
                    width="100%"
                    height="200px"
                    overflow="auto"
                    sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, mb: 3 }}
                >
                    {messages.map((msg, index) => (
                        <Typography
                            key={index}
                            variant="body1"
                            sx={{ mb: 1, fontWeight: msg.startsWith('You:') ? 'bold' : 'normal' }}
                        >
                            {msg}
                        </Typography>
                    ))}
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                        {isAudioInput ? 'Detecting Sound...' : 'Silent'}
                    </Typography>
                    <CircularProgress
                        color={isAudioInput ? 'primary' : 'inherit'}
                        size={24}
                        variant={isAudioInput ? 'indeterminate' : 'determinate'}
                        value={0}
                    />
                </Box>

                <IconButton
                    color={isCallActive ? "error" : "primary"}
                    onClick={handleCallToggle}
                    sx={{ mb: 2 }}
                >
                    {isCallActive ? <PhoneDisabledIcon fontSize="large" /> : <PhoneIcon fontSize="large" />}
                </IconButton>

                <Button
                    variant="contained"
                    color={isRecording ? 'secondary' : 'primary'}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!isCallActive}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
            </Box>
        </Paper>
    );
};

export default Voicebot;
