import React, { useEffect, useRef } from 'react';

const WIDTH = 120;
const HEIGHT = 40;
const POINTS = 32;

function generateWavePath(phase = 0, amplitude = 1) {
  let path = '';
  for (let i = 0; i < POINTS; i++) {
    const x = (i / (POINTS - 1)) * WIDTH;
    const y = HEIGHT / 2 + Math.sin((i / (POINTS - 1)) * Math.PI * 2 + phase) * (HEIGHT / 2 - 4) * amplitude;
    path += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  }
  return path;
}

const JarvisWaveform = ({ analyserNode }) => {
  const pathRef = useRef();
  const phaseRef = useRef(0);
  const requestRef = useRef();

  useEffect(() => {
    let running = true;
    let amplitude = 1;
    const dataArray = analyserNode ? new Uint8Array(analyserNode.frequencyBinCount) : null;

    function animate() {
      phaseRef.current += 0.08;
      if (analyserNode && dataArray) {
        analyserNode.getByteFrequencyData(dataArray);
        // Use the average volume for amplitude
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        amplitude = 0.5 + Math.min(avg / 256, 1) * 1.2; // scale amplitude
      } else {
        amplitude = 0.7 + 0.3 * Math.sin(phaseRef.current * 0.7);
      }
      if (pathRef.current) {
        pathRef.current.setAttribute('d', generateWavePath(phaseRef.current, amplitude));
      }
      if (running) requestRef.current = requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; cancelAnimationFrame(requestRef.current); };
  }, [analyserNode]);

  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'none' }}>
      <path
        ref={pathRef}
        fill="none"
        stroke="#61dafb"
        strokeWidth="4"
        strokeLinejoin="round"
        style={{ filter: 'blur(1.5px)', opacity: 0.85 }}
      />
    </svg>
  );
};

export default JarvisWaveform; 