import React from 'react';

const AudioPlayer = ({ audioURL, rate }) => {
  return (
    <div>
      <h4>Bot's Audio Response:</h4>
      <audio controls src={audioURL}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
