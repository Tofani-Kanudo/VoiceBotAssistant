import React from 'react';
import { Box, Typography } from '@mui/material';

const ChatBox = ({ messages }) => {
  return (
    <Box
      sx={{
        height: '300px',
        overflowY: 'scroll',
        padding: '16px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        margin: '16px 0',
        backgroundColor: '#f5f5f5',
      }}
    >
      {messages.map((msg, index) => (
        <Typography key={index} align={msg.sender === 'user' ? 'right' : 'left'}>
          <strong>{msg.sender === 'user' ? 'You' : 'Bot'}: </strong>{msg.text}
        </Typography>
      ))}
    </Box>
  );
};

export default ChatBox;
