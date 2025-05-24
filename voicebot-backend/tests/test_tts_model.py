import unittest
import io
from unittest.mock import patch, MagicMock, mock_open
import os
import sys
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_dir)
from tts_model import generate_audio
class TestTTSModel(unittest.TestCase):
    def setUp(self):
        self.test_text = "Hello, this is a test message."
        
    @patch('tts_model.gTTS')
    @patch('builtins.open', new_callable=mock_open)
    def test_generate_audio_success(self, mock_file, mock_gtts):
        # Mock gTTS
        mock_tts = MagicMock()
        mock_gtts.return_value = mock_tts
        
        # Mock file operations
        mock_file.return_value.__enter__.return_value.read.return_value = b'mock_audio_data'
        
        # Test audio generation
        result = generate_audio(self.test_text)
        
        # Assertions
        self.assertEqual(result, b'mock_audio_data')
        mock_gtts.assert_called_once_with(text=self.test_text, lang='en')
        mock_tts.save.assert_called_once_with("audio.mp3")
        
    def test_generate_audio_empty_input(self):
        # Test with empty input
        with self.assertRaises(Exception):
            generate_audio("")
            
    def test_generate_audio_invalid_input(self):
        # Test with invalid input
        with self.assertRaises(Exception):
            generate_audio(None)
            
    @patch('tts_model.gTTS')
    @patch('builtins.open', new_callable=mock_open)
    def test_generate_audio_file_error(self, mock_file, mock_gtts):
        # Mock gTTS
        mock_tts = MagicMock()
        mock_gtts.return_value = mock_tts
        
        # Mock file operation to raise an error
        mock_file.side_effect = IOError("File error")
        
        # Test file error handling
        with self.assertRaises(IOError):
            generate_audio(self.test_text)

if __name__ == '__main__':
    unittest.main() 