import io

import numpy as np
import soundfile as sf
import torch
import torchaudio
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import wave
from pydub import AudioSegment

# Load the STT pipeline from Hugging Face
processor = WhisperProcessor.from_pretrained("openai/whisper-tiny.en")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny.en")


def transcribe_audio(audio_data: bytes) -> str:
    # Save the audio data to a temporary file
    audio_segment = AudioSegment.from_file(io.BytesIO(audio_data), format="webm")
    audio_segment = audio_segment.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    raw_audio = np.array(audio_segment.get_array_of_samples()).astype(np.float32) / 32768.0  # Normalize
    inputs = processor(raw_audio, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        predicted_ids = model.generate(**inputs)
    return processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
