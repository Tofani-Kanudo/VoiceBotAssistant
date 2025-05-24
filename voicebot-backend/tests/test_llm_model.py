import unittest
import torch
from unittest.mock import patch, MagicMock
import os
import sys
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_dir)
from llm_model import generate_response

class TestLLMModel(unittest.TestCase):
    def setUp(self):
        # Different types of test inputs
        self.test_inputs = {
            'greeting': "Hello, how are you?",
            'question': "What is the weather like today?",
            'command': "Play some music",
            'long_input': "This is a very long input that tests the model's ability to handle longer sequences of text and maintain context throughout the conversation.",
            'empty': "",
            'invalid': None
        }
        
    @patch('llm_model.AutoTokenizer')
    @patch('llm_model.AutoModelForCausalLM')
    async def test_generate_response_success(self, mock_model, mock_tokenizer):
        # Mock tokenizer
        mock_tokenizer_instance = MagicMock()
        mock_tokenizer.from_pretrained.return_value = mock_tokenizer_instance
        mock_tokenizer_instance.encode.return_value = torch.tensor([[1, 2, 3]])
        mock_tokenizer_instance.eos_token = '</s>'
        mock_tokenizer_instance.eos_token_id = 1
        
        # Mock model
        mock_model_instance = MagicMock()
        mock_model.from_pretrained.return_value = mock_model_instance
        mock_model_instance.generate.return_value = torch.tensor([[1, 2, 3, 4, 5]])
        
        # Mock decode
        mock_tokenizer_instance.decode.return_value = "I'm doing well, thank you!"
        
        # Test the response generation
        result = await generate_response(self.test_inputs['greeting'])
        
        # Assertions
        self.assertEqual(result, "I'm doing well, thank you!")
        mock_tokenizer.from_pretrained.assert_called_once()
        mock_model.from_pretrained.assert_called_once()
        mock_model_instance.generate.assert_called_once()
        
    @patch('llm_model.AutoTokenizer')
    @patch('llm_model.AutoModelForCausalLM')
    async def test_generate_response_question(self, mock_model, mock_tokenizer):
        # Test with a question input
        mock_tokenizer_instance = MagicMock()
        mock_tokenizer.from_pretrained.return_value = mock_tokenizer_instance
        mock_tokenizer_instance.encode.return_value = torch.tensor([[1, 2, 3]])
        mock_tokenizer_instance.eos_token = '</s>'
        mock_tokenizer_instance.eos_token_id = 1
        
        mock_model_instance = MagicMock()
        mock_model.from_pretrained.return_value = mock_model_instance
        mock_model_instance.generate.return_value = torch.tensor([[1, 2, 3, 4, 5]])
        
        mock_tokenizer_instance.decode.return_value = "The weather is sunny today."
        
        result = await generate_response(self.test_inputs['question'])
        self.assertEqual(result, "The weather is sunny today.")
        
    @patch('llm_model.AutoTokenizer')
    @patch('llm_model.AutoModelForCausalLM')
    async def test_generate_response_command(self, mock_model, mock_tokenizer):
        # Test with a command input
        mock_tokenizer_instance = MagicMock()
        mock_tokenizer.from_pretrained.return_value = mock_tokenizer_instance
        mock_tokenizer_instance.encode.return_value = torch.tensor([[1, 2, 3]])
        mock_tokenizer_instance.eos_token = '</s>'
        mock_tokenizer_instance.eos_token_id = 1
        
        mock_model_instance = MagicMock()
        mock_model.from_pretrained.return_value = mock_model_instance
        mock_model_instance.generate.return_value = torch.tensor([[1, 2, 3, 4, 5]])
        
        mock_tokenizer_instance.decode.return_value = "Playing your favorite music."
        
        result = await generate_response(self.test_inputs['command'])
        self.assertEqual(result, "Playing your favorite music.")
        
    @patch('llm_model.AutoTokenizer')
    @patch('llm_model.AutoModelForCausalLM')
    async def test_generate_response_long_input(self, mock_model, mock_tokenizer):
        # Test with a long input
        mock_tokenizer_instance = MagicMock()
        mock_tokenizer.from_pretrained.return_value = mock_tokenizer_instance
        mock_tokenizer_instance.encode.return_value = torch.tensor([[1, 2, 3]])
        mock_tokenizer_instance.eos_token = '</s>'
        mock_tokenizer_instance.eos_token_id = 1
        
        mock_model_instance = MagicMock()
        mock_model.from_pretrained.return_value = mock_model_instance
        mock_model_instance.generate.return_value = torch.tensor([[1, 2, 3, 4, 5]])
        
        mock_tokenizer_instance.decode.return_value = "I understand your long message and will respond accordingly."
        
        result = await generate_response(self.test_inputs['long_input'])
        self.assertEqual(result, "I understand your long message and will respond accordingly.")
        
    @patch('llm_model.AutoTokenizer')
    @patch('llm_model.AutoModelForCausalLM')
    async def test_generate_response_empty_input(self, mock_model, mock_tokenizer):
        # Test with empty input
        with self.assertRaises(Exception):
            await generate_response(self.test_inputs['empty'])
            
    @patch('llm_model.AutoTokenizer')
    @patch('llm_model.AutoModelForCausalLM')
    async def test_generate_response_invalid_input(self, mock_model, mock_tokenizer):
        # Test with invalid input
        with self.assertRaises(Exception):
            await generate_response(self.test_inputs['invalid'])
            
    @patch('llm_model.AutoTokenizer')
    @patch('llm_model.AutoModelForCausalLM')
    async def test_generate_response_with_parameters(self, mock_model, mock_tokenizer):
        # Test with custom parameters
        mock_tokenizer_instance = MagicMock()
        mock_tokenizer.from_pretrained.return_value = mock_tokenizer_instance
        mock_tokenizer_instance.encode.return_value = torch.tensor([[1, 2, 3]])
        mock_tokenizer_instance.eos_token = '</s>'
        mock_tokenizer_instance.eos_token_id = 1
        
        mock_model_instance = MagicMock()
        mock_model.from_pretrained.return_value = mock_model_instance
        mock_model_instance.generate.return_value = torch.tensor([[1, 2, 3, 4, 5]])
        
        mock_tokenizer_instance.decode.return_value = "Custom response"
        
        # Test with different parameter combinations
        test_params = [
            {'temperature': 0.7, 'top_p': 0.8, 'top_k': 40},
            {'temperature': 0.9, 'top_p': 0.9, 'top_k': 50},
            {'temperature': 0.5, 'top_p': 0.7, 'top_k': 30}
        ]
        
        for params in test_params:
            result = await generate_response(
                self.test_inputs['greeting'],
                **params
            )
            self.assertEqual(result, "Custom response")
            call_args = mock_model_instance.generate.call_args[1]
            self.assertEqual(call_args['temperature'], params['temperature'])
            self.assertEqual(call_args['top_p'], params['top_p'])
            self.assertEqual(call_args['top_k'], params['top_k'])

if __name__ == '__main__':
    unittest.main() 