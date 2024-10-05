import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Paper, Typography } from '@mui/material';

const CallInterface = () => {
  const [userMessage, setUserMessage] = useState('');
  const [botMessage, setBotMessage] = useState('Welcome! How can I help you today?');
  const [isCalling, setIsCalling] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (isCalling) {
      const socket = new WebSocket('ws://localhost:8000/ws'); // Your WebSocket URL

      socket.onmessage = (event) => {
        setBotMessage(event.data);
      };

      setWs(socket);

      return () => {
        socket.close();
      };
    }
  }, [isCalling]);

  const handleStartCall = () => {
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setUserMessage('');
    setBotMessage('Welcome! How can I help you today?');
    if (ws) {
      ws.close();
    }
  };

  const handleSendMessage = () => {
    if (userMessage && ws) {
      ws.send(userMessage);
      setUserMessage('');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 5 }}>
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          {isCalling ? 'In Call with Voicebot' : 'Click to Start Call'}
        </Typography>

        {isCalling ? (
          <>
            <Typography variant="body1" gutterBottom>
              {botMessage}
            </Typography>
            <TextField
              label="Your Message"
              fullWidth
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              margin="normal"
            />
            <Button
              variant="contained"
              fullWidth
              color="primary"
              onClick={handleSendMessage}
              sx={{ marginTop: 2 }}
            >
              Send
            </Button>
            <Button
              variant="contained"
              fullWidth
              color="secondary"
              onClick={handleEndCall}
              sx={{ marginTop: 2 }}
            >
              End Call
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={handleStartCall}
          >
            Start Call
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default CallInterface;
