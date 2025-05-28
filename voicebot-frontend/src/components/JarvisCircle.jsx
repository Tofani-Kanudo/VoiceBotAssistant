// JarvisCircle.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import './JarvisCircle.css';

const NUM_WAVES = 5; // Number of visual wave elements

const JarvisCircle = ({ status = 'idle', analyserNode = null }) => {
  const animationFrameId = useRef(null);
  const wavesRef = useRef([]); // To store refs to wave divs

  // Initialize refs for waves
  wavesRef.current = useMemo(() =>
    Array(NUM_WAVES).fill(null).map((_, i) => wavesRef.current[i] || React.createRef()),
    []
  );

  useEffect(() => {
    const processAudioData = () => {
      if (!analyserNode || !wavesRef.current.every(ref => ref.current)) {
        // Fallback or stop if analyser or refs not ready
        wavesRef.current.forEach(ref => {
          if (ref.current) {
            ref.current.style.transform = 'scale(1)';
            ref.current.style.opacity = ''; // Revert to CSS opacity
          }
        });
        if (status === 'hearing' || status === 'speaking') {
            animationFrameId.current = requestAnimationFrame(processAudioData);
        }
        return;
      }

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray); // More suitable for this kind of viz

      // Simple averaging for overall energy
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const averageEnergy = sum / bufferLength / 255; // Normalize to 0-1

      // Segment data for more nuanced animation (example: 3 bands)
      const bandSize = Math.floor(bufferLength / NUM_WAVES);
      const bandEnergies = [];
      for (let i = 0; i < NUM_WAVES; i++) {
        let bandSum = 0;
        for (let j = 0; j < bandSize; j++) {
          bandSum += dataArray[i * bandSize + j];
        }
        bandEnergies.push((bandSum / (bandSize * 255)) * 2); // Normalize & boost slightly
      }


      wavesRef.current.forEach((waveRef, index) => {
        if (waveRef.current) {
          const waveElement = waveRef.current;
          let scale = 1;
          let opacity = parseFloat(getComputedStyle(waveElement).getPropertyValue('--base-opacity')) || 0.5;

          if (status === 'hearing') {
            // Hearing: Pulsate based on overall energy, subtle morphing
            const energy = bandEnergies[index] || averageEnergy;
            scale = 1 + energy * 0.8; // Max scale 1.8
            opacity = Math.min(1, (parseFloat(getComputedStyle(waveElement).getPropertyValue('--base-opacity')) || 0.3) + energy * 0.7);
            waveElement.style.transition = 'transform 0.05s ease-out, opacity 0.05s ease-out'; // Fast response
          } else if (status === 'speaking') {
            // Speaking: More outward, slightly different response
            const energy = bandEnergies[NUM_WAVES - 1 - index] || averageEnergy; // Invert band influence for variety
            scale = 1 + energy * 1.2; // Max scale 2.2, more expansive
            opacity = Math.min(1, (parseFloat(getComputedStyle(waveElement).getPropertyValue('--base-opacity')) || 0.4) + energy * 0.6);
            waveElement.style.transition = 'transform 0.07s ease-out, opacity 0.07s ease-out';
          }
          waveElement.style.transform = `scale(${Math.max(0.5, Math.min(scale, 2.5))})`; // Clamp scale
          waveElement.style.opacity = `${opacity}`;
        }
      });

      animationFrameId.current = requestAnimationFrame(processAudioData);
    };

    if ((status === 'hearing' || status === 'speaking') && analyserNode) {
      // Clear any previous animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // Reset styles before starting JS animation to ensure CSS transitions apply from a known state
        wavesRef.current.forEach(ref => {
            if(ref.current) {
                ref.current.style.transform = '';
                ref.current.style.opacity = '';
                 // Add a class to trigger CSS transition to the base for hearing/speaking
                ref.current.classList.add('js-animating');
            }
        });

      animationFrameId.current = requestAnimationFrame(processAudioData);
    } else {
      // Not hearing or speaking, or no analyserNode: rely on CSS animations
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      // Remove JS-driven styles to let CSS take over for idle/processing
      wavesRef.current.forEach(ref => {
        if (ref.current) {
          ref.current.style.transform = '';
          ref.current.style.opacity = '';
          ref.current.style.transition = ''; // Remove JS transition
          ref.current.classList.remove('js-animating');
        }
      });
    }

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [status, analyserNode]); // Rerun effect if status or analyserNode changes

  return (
    <div className={`jarvis-circle status-${status}`}>
      <div className="jarvis-circle-inner">
        {wavesRef.current.map((ref, i) => (
          <div
            key={i}
            ref={ref}
            className={`wave wave-${i + 1}`}
            // Use CSS custom properties for base values that CSS animations can also use
            style={{ '--wave-index': i, '--base-opacity': 0.1 + i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default JarvisCircle;