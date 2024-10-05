import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import AudioPlayer from './audioPlayer';
import { sendMessage } from '../api/axiosInstance';
import { Buffer } from 'buffer';

const ChatWindow = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [audio, setAudio] = useState(null);
  const [audioRate, setAudioRate] = useState(null);

  const handleSendMessage = async () => {
    // Send message to backend and get the response
    const response = await sendMessage(message);

    // Update chat with the bot's response
    setChat([...chat, { user: message, bot: response.reply }]);

    // Handle the audio response
    const audioBuffer = Buffer.from(response.audio_data, 'hex');
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    const audioURL = URL.createObjectURL(audioBlob);

    setAudio(audioURL);
    setAudioRate(response.rate);
    setMessage('');  // Clear input field
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Customer Success Voicebot</Typography>

      {/* Chat History */}
      <Box className="chat-history" sx={{ mb: 2 }}>
        {chat.map((msg, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body1"><strong>User:</strong> {msg.user}</Typography>
            <Typography variant="body1"><strong>Bot:</strong> {msg.bot}</Typography>
          </Box>
        ))}
      </Box>

      {/* Text Input and Send Button */}
      <TextField
        label="Type your message"
        variant="outlined"
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSendMessage}>Send</Button>

      {/* Audio Player for TTS */}
      {audio && <AudioPlayer audioURL={audio} rate={audioRate} />}
    </Box>
  );
};

export default ChatWindow;
