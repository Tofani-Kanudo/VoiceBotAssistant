import unittest
import io
import numpy as np
from unittest.mock import patch, MagicMock
from stt_model import transcribe_audio
import os
import sys
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_dir)
class TestSTTModel(unittest.TestCase):
    def setUp(self):
        # Create different types of mock audio data
        self.mock_audio_data = b'mock_audio_data'
        self.mock_audio_data_long = b'mock_audio_data' * 100  # Longer audio
        self.mock_audio_data_empty = b''
        self.mock_audio_data_invalid = None
        
    @patch('stt_model.WhisperProcessor')
    @patch('stt_model.WhisperForConditionalGeneration')
    @patch('stt_model.AudioSegment')
    def test_transcribe_audio_success(self, mock_audio_segment, mock_model, mock_processor):
        # Mock the audio processing chain
        mock_audio = MagicMock()
        mock_audio.get_array_of_samples.return_value = [0, 1, 2, 3]
        mock_audio_segment.from_file.return_value = mock_audio
        
        # Mock the processor and model
        mock_processor_instance = MagicMock()
        mock_processor.from_pretrained.return_value = mock_processor_instance
        mock_processor_instance.return_value = {'input_features': np.array([[1, 2, 3]])}
        
        mock_model_instance = MagicMock()
        mock_model.from_pretrained.return_value = mock_model_instance
        mock_model_instance.generate.return_value = np.array([[1, 2, 3]])
        
        mock_processor_instance.batch_decode.return_value = ['Transcribed text']
        
        # Test the transcription
        result = transcribe_audio(self.mock_audio_data)
        
        # Assertions
        self.assertEqual(result, 'Transcribed text')
        mock_audio_segment.from_file.assert_called_once()
        mock_processor.from_pretrained.assert_called_once()
        mock_model.from_pretrained.assert_called_once()
        
    @patch('stt_model.WhisperProcessor')
    @patch('stt_model.WhisperForConditionalGeneration')
    @patch('stt_model.AudioSegment')
    def test_transcribe_audio_long_input(self, mock_audio_segment, mock_model, mock_processor):
        # Test with longer audio input
        mock_audio = MagicMock()
        mock_audio.get_array_of_samples.return_value = [0, 1, 2, 3] * 100
        mock_audio_segment.from_file.return_value = mock_audio
        
        mock_processor_instance = MagicMock()
        mock_processor.from_pretrained.return_value = mock_processor_instance
        mock_processor_instance.return_value = {'input_features': np.array([[1, 2, 3]])}
        
        mock_model_instance = MagicMock()
        mock_model.from_pretrained.return_value = mock_model_instance
        mock_model_instance.generate.return_value = np.array([[1, 2, 3]])
        
        mock_processor_instance.batch_decode.return_value = ['Long transcribed text']
        
        result = transcribe_audio(self.mock_audio_data_long)
        self.assertEqual(result, 'Long transcribed text')
        
    def test_transcribe_audio_invalid_input(self):
        # Test with invalid audio data
        with self.assertRaises(Exception):
            transcribe_audio(self.mock_audio_data_invalid)
            
    @patch('stt_model.WhisperProcessor')
    @patch('stt_model.WhisperForConditionalGeneration')
    @patch('stt_model.AudioSegment')
    def test_transcribe_audio_empty_input(self, mock_audio_segment, mock_model, mock_processor):
        # Test with empty audio data
        with self.assertRaises(Exception):
            transcribe_audio(self.mock_audio_data_empty)
            
    @patch('stt_model.WhisperProcessor')
    @patch('stt_model.WhisperForConditionalGeneration')
    @patch('stt_model.AudioSegment')
    def test_transcribe_audio_with_noise(self, mock_audio_segment, mock_model, mock_processor):
        # Test with noisy audio data
        mock_audio = MagicMock()
        # Simulate noisy audio with random values
        mock_audio.get_array_of_samples.return_value = np.random.rand(1000)
        mock_audio_segment.from_file.return_value = mock_audio
        
        mock_processor_instance = MagicMock()
        mock_processor.from_pretrained.return_value = mock_processor_instance
        mock_processor_instance.return_value = {'input_features': np.array([[1, 2, 3]])}
        
        mock_model_instance = MagicMock()
        mock_model.from_pretrained.return_value = mock_model_instance
        mock_model_instance.generate.return_value = np.array([[1, 2, 3]])
        
        mock_processor_instance.batch_decode.return_value = ['Noisy audio transcription']
        
        result = transcribe_audio(self.mock_audio_data)
        self.assertEqual(result, 'Noisy audio transcription')

if __name__ == '__main__':
    unittest.main() 