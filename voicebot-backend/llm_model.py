import asyncio
import requests
import logging
from logging_config import setup_logging, log_error_with_traceback
from llama_cpp import Llama

MODEL_PATH = "./llama.cpp/models/mistral-7b-instruct-v0.1.Q4_K_M.gguf"

# Initialize the LLM
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=6,
    n_gpu_layers=32,  # Set to 0 if you want CPU-only
    use_mlock=True,
    embedding=False,
)

# Store conversation history
conversation_history = []

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)

def format_prompt(convo):
    prompt = ""
    for turn in convo:
        prompt += f"[INST] {turn['user']} [/INST] {turn['bot']}\n"
    prompt += f"[INST] {convo[-1]['user']} [/INST]"
    return prompt

def ask_bot_api(user_message):
    """Handle API-based chat completions"""
    global conversation_history
    try:
        user_message = user_message.strip()

        logger.info(f"Received user message: {user_message}")

        conversation_history.append({"user": user_message, "bot": ""})
        logger.debug(f"Updated conversation history: {conversation_history}")

        # Format input for model
        prompt = format_prompt(conversation_history)

        # Generate model response
        output = llm(prompt, max_tokens=256, stop=["</s>"], echo=False)
        reply = output["choices"][0]["text"].strip()

        # Save bot reply to conversation
        conversation_history[-1]["bot"] = reply
        logger.info(f"Generated bot response: {reply}")

        return reply
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
