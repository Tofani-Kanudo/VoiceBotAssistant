import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import AudioPlayer from './audioPlayer';
import { sendMessage } from '../api/axiosInstance';
import { Buffer } from 'buffer';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [audio, setAudio] = useState(null);
  const [audioRate, setAudioRate] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (isCallActive) {
      const socket = new WebSocket('ws://localhost:8000/ws');
      
      socket.onmessage = async (event) => {
        const response = JSON.parse(event.data);
        if (response.type === 'audio') {
          const audioBuffer = Buffer.from(response.data, 'hex');
          const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
          const audioURL = URL.createObjectURL(audioBlob);
          setAudio(audioURL);
          setAudioRate(response.rate);
        }
        setChat(prev => [...prev, { sender: 'bot', text: response.message }]);
      };

      setWs(socket);

      return () => {
        socket.close();
      };
    }
  }, [isCallActive]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    setChat(prev => [...prev, { sender: 'user', text: message }]);

    if (isCallActive && ws) {
      // WebSocket communication
      ws.send(message);
    } else {
      // REST API communication
      try {
        const response = await sendMessage(message);
        setChat(prev => [...prev, { sender: 'bot', text: response.reply }]);
        
        const audioBuffer = Buffer.from(response.audio_data, 'hex');
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudio(audioURL);
        setAudioRate(response.rate);
      } catch (error) {
        console.error('Error sending message:', error);
        setChat(prev => [...prev, { sender: 'bot', text: 'Sorry, there was an error processing your request.' }]);
      }
    }

    setMessage('');
  };

  const handleCallToggle = () => {
    setIsCallActive(!isCallActive);
    if (!isCallActive) {
      setChat([]);
      setAudio(null);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Customer Success Voicebot
      </Typography>

      {/* Chat History */}
      <Box
        sx={{
          height: '400px',
          overflowY: 'auto',
          p: 2,
          mb: 2,
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          backgroundColor: '#f5f5f5'
        }}
      >
        {chat.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Typography
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#fff',
                maxWidth: '70%'
              }}
            >
              <strong>{msg.sender === 'user' ? 'You' : 'Bot'}: </strong>
              {msg.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Input Area */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Type your message"
          variant="outlined"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!isCallActive}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!isCallActive || !message.trim()}
        >
          Send
        </Button>
        <Button
          variant="contained"
          color={isCallActive ? 'error' : 'primary'}
          onClick={handleCallToggle}
        >
          {isCallActive ? 'End Call' : 'Start Call'}
        </Button>
      </Box>

      {/* Audio Player */}
      {audio && <AudioPlayer audioURL={audio} rate={audioRate} />}
    </Paper>
  );
};

export default ChatInterface;
