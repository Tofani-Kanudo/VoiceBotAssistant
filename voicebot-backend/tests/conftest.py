import pytest
import torch
from unittest.mock import MagicMock
import os
import sys
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_dir)
@pytest.fixture
def mock_audio_data():
    return b'test_audio_data'

@pytest.fixture
def mock_transcribed_text():
    return "This is a test transcription"

@pytest.fixture
def mock_llm_response():
    return "This is a test response from the language model"

@pytest.fixture
def mock_audio_response():
    return b'test_audio_response'

@pytest.fixture
def mock_websocket():
    websocket = MagicMock()
    websocket.accept = MagicMock()
    websocket.receive_bytes = MagicMock()
    websocket.send_text = MagicMock()
    return websocket

@pytest.fixture
def mock_tokenizer():
    tokenizer = MagicMock()
    tokenizer.encode = MagicMock(return_value=torch.tensor([[1, 2, 3]]))
    tokenizer.decode = MagicMock(return_value="Decoded text")
    tokenizer.eos_token = '</s>'
    tokenizer.eos_token_id = 1
    return tokenizer

@pytest.fixture
def mock_model():
    model = MagicMock()
    model.generate = MagicMock(return_value=torch.tensor([[1, 2, 3, 4, 5]]))
    return model

@pytest.fixture
def mock_processor():
    processor = MagicMock()
    processor.return_value = {'input_features': torch.tensor([[1, 2, 3]])}
    processor.batch_decode = MagicMock(return_value=['Processed text'])
    return processor 