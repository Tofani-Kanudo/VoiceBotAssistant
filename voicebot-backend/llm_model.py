from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import asyncio
import requests
import logging
from logging_config import setup_logging, log_error_with_traceback

model_name = "facebook/blenderbot-400M-distill"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Store conversation history
conversation_history = []

# Add API configuration
API_URL = "https://api.aimlapi.com/chat/completions"
API_KEY = "d86b1c0acd254bebb70ec1802eeb3e20"

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)

def format_prompt(user_input: str) -> str:
    """Format the prompt with conversation history for BlenderBot."""
    global conversation_history
    # Add user input to history
    conversation_history.append(f"Human: {user_input}")
    
    # Format the full conversation
    full_prompt = " ".join(conversation_history)
    return full_prompt

def ask_bot(user_input, chat_history_ids=None):
    # Encode user input + past history
    new_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')

    # Append tokens to chat history (or start it)
    bot_input_ids = torch.cat([chat_history_ids, new_input_ids], dim=-1) if chat_history_ids is not None else new_input_ids

    # Generate response
    chat_history_ids = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)

    # Decode last response
    response = tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)

    return response, chat_history_ids

def ask_bot_api(user_message):
    """Handle API-based chat completions"""
    global conversation_history
    try:
        logger.info(f"Received user message: {user_message}")

        conversation_history.append({"role": "user", "content": user_message})
        logger.debug(f"Updated conversation history: {conversation_history}")

        payload = {
            "messages": conversation_history,
            "temperature": 0.7,
            "model": "gpt-3.5-turbo"
        }

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        logger.info("Sending request to LLM API")
        response = requests.post(API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        logger.debug(f"API response: {data}")

        bot_reply = data["choices"][0]["message"]["content"]
        conversation_history.append({"role": "assistant", "content": bot_reply})
        logger.info(f"Generated bot response: {bot_reply}")

        return bot_reply
    except requests.exceptions.RequestException as e:
        log_error_with_traceback(logger, f"API request failed: {str(e)}")
        return f"Error: {e}"
    except Exception as e:
        log_error_with_traceback(logger, f"Unexpected error: {str(e)}")
        return f"Error: {e}"

async def main():
    global conversation_history
    print("Chatbot initialized. Type 'quit' to exit, 'clear' to clear history, or 'api' for API mode")
    api_mode = True
    
    while True:
        user_input = input("You: ").strip()
        
        if user_input.lower() == 'quit':
            break
        elif user_input.lower() == 'clear':
            conversation_history = []
            print("Conversation history cleared.")
            continue
            
        if not user_input:
            print("Please enter a message.")
            continue
            
        response = ask_bot_api(user_input)
            
        print(f"Bot: {response}")

if __name__ == "__main__":
    asyncio.run(main())
    # main()
