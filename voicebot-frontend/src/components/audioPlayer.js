import React from 'react';
import { Box, Typography } from '@mui/material';

const AudioPlayer = ({ audioURL, rate }) => {
  return (
    <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Bot's Response
      </Typography>
      <audio 
        controls 
        src={audioURL}
        style={{ width: '100%' }}
      >
        Your browser does not support the audio element.
      </audio>
    </Box>
  );
};

export default AudioPlayer;
