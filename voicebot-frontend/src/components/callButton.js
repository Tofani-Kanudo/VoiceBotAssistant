import React from 'react';
import { Button, Box } from '@mui/material';

const CallButton = ({ onStartCall, onEndCall, isInCall }) => {
  return (
    <Box display="flex" justifyContent="center" mt={2}>
      {!isInCall ? (
        <Button variant="contained" color="primary" onClick={onStartCall}>
          Start Call
        </Button>
      ) : (
        <Button variant="contained" color="secondary" onClick={onEndCall}>
          End Call
        </Button>
      )}
    </Box>
  );
};

export default CallButton;
