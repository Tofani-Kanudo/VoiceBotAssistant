import unittest
import json
import base64
import os
import sys
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_dir)
from main import app, websocket_endpoint, process_audio

class TestMainApp(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.test_client_id = "test_client_123"
        self.test_audio_data = b'test_audio_data'
        
    @patch('main.transcribe_audio')
    @patch('main.generate_response')
    @patch('main.generate_audio')
    async def test_websocket_endpoint_success(self, mock_generate_audio, mock_generate_response, mock_transcribe_audio):
        # Mock the dependencies
        mock_transcribe_audio.return_value = "Transcribed text"
        mock_generate_response.return_value = "Generated response"
        mock_generate_audio.return_value = b'generated_audio_data'
        
        # Create mock WebSocket
        mock_websocket = AsyncMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.receive_bytes = AsyncMock(return_value=self.test_audio_data)
        mock_websocket.send_text = AsyncMock()
        
        # Test the WebSocket endpoint
        await websocket_endpoint(mock_websocket, self.test_client_id)
        
        # Assertions
        mock_websocket.accept.assert_called_once()
        mock_transcribe_audio.assert_called_once_with(self.test_audio_data)
        mock_generate_response.assert_called_once_with("Transcribed text")
        mock_generate_audio.assert_called_once_with("Generated response")
        
        # Verify the response format
        expected_response = {
            "type": "audio",
            "data": base64.b64encode(b'generated_audio_data').decode('utf-8'),
            "message": "Bot response received."
        }
        mock_websocket.send_text.assert_called_once_with(json.dumps(expected_response))
        
    @patch('main.transcribe_audio')
    @patch('main.generate_response')
    @patch('main.generate_audio')
    async def test_websocket_endpoint_error(self, mock_generate_audio, mock_generate_response, mock_transcribe_audio):
        # Mock an error in the processing chain
        mock_transcribe_audio.side_effect = Exception("Test error")
        
        # Create mock WebSocket
        mock_websocket = AsyncMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.receive_bytes = AsyncMock(return_value=self.test_audio_data)
        mock_websocket.send_text = AsyncMock()
        
        # Test the WebSocket endpoint with error
        await websocket_endpoint(mock_websocket, self.test_client_id)
        
        # Verify error response
        expected_error = {
            "type": "error",
            "message": "Test error"
        }
        mock_websocket.send_text.assert_called_once_with(json.dumps(expected_error))
        
    @patch('main.transcribe_audio')
    @patch('main.generate_response')
    @patch('main.generate_audio')
    async def test_websocket_endpoint_disconnect(self, mock_generate_audio, mock_generate_response, mock_transcribe_audio):
        # Mock WebSocket disconnect
        mock_websocket = AsyncMock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.receive_bytes = AsyncMock(side_effect=Exception("Connection closed"))
        
        # Test the WebSocket endpoint with disconnect
        await websocket_endpoint(mock_websocket, self.test_client_id)
        
        # Verify client is removed from clients dict
        self.assertNotIn(self.test_client_id, app.clients)
        
    def test_process_audio(self):
        # Test the process_audio function
        with patch('main.transcribe_audio') as mock_transcribe:
            mock_transcribe.return_value = "Processed text"
            result = process_audio(self.test_audio_data)
            self.assertEqual(result, "Processed text")
            mock_transcribe.assert_called_once_with(self.test_audio_data)

if __name__ == '__main__':
    print(sys.path)
    unittest.main() 