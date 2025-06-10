import asyncio
import logging
import os

import requests
import re
from llama_cpp import Llama

from logging_config import setup_logging, log_error_with_traceback

MODEL_PATH = os.environ.get("MODEL_PATH", "./mistral-7b-instruct-v0.1.Q4_K_M.gguf")

# Initialize the LLM
llm = Llama(model_path=MODEL_PATH, n_ctx=2048, n_threads=6, n_gpu_layers=32,  # Set to 0 if you want CPU-only
    use_mlock=True, embedding=False, verbose=False)

# Store conversation history
conversation_history = []

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)

def get_system_prompt():
    return (
        "You are a friendly and engaging chatting partner. "
        "The user is speaking, and their audio is being transcribed and fed to you. "
        "Your responses will be sent to a text-to-speech API to be played back to the user. "
        "Please punctuate your responses properly and consider the conversational context to keep the dialogue flowing smoothly."
        "Strictly keep the responses under 200 tokens, Ask for continuation if required at the end of the response."
    )

def format_prompt(convo):
    prompt = ""
    for turn in convo[:-1]:
        prompt += f"[INST] {turn['user']} [/INST] {turn['bot']}\n"
    prompt += f"[INST] {convo[-1]['user']} [/INST]"
    return prompt

def split_on_sentence_boundary(text):
    # This will split and keep the delimiter
    return re.findall(r'[^.!?]*[.!?]', text) + ([text.rsplit(maxsplit=1)[-1]] if text and text[-1] not in '.!?' else [])


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
        prompt = f"{get_system_prompt()}\n{prompt}"

        full_reply = ""
        is_finished = False
        buffer = ""
        
        # --- Start of the Auto-Continuation Loop ---
        while not is_finished:
            # 1. Format the prompt with the full conversation history.
            #    format_prompt() creates the prompt up to the final "[/INST]"
            base_prompt = f"{get_system_prompt()}\n{format_prompt(conversation_history)}"
            
            # 2. Append the text we've already generated for this turn.
            #    This makes the model continue from where it left off.
            prompt_with_continuation = base_prompt + full_reply

            # 3. Generate the next chunk of the response.
            output = llm(
                prompt_with_continuation,
                temperature=0.7,
                top_p=0.9,
                top_k=50,
                repeat_penalty=1.2,
                max_tokens=200, # This is our chunk size
                stop=["[INST]", "</s>"],
                echo=False
            )

            # 4. Extract the new text chunk and the reason for stopping.
            chunk = output["choices"][0]["text"]
            finish_reason = output["choices"][0]["finish_reason"]

            # 5. Append the new chunk to our full reply.
            full_reply += chunk
            
            logger.info(f"Generated chunk: '{chunk[:70]}...', Finish reason: {finish_reason}")

            # 6. Check if the model finished naturally. If not, the loop will continue.
            if finish_reason == 'stop':
                is_finished = True
            elif finish_reason == 'length':
                logger.info("Response truncated by length, continuing generation...")
        # --- End of the Auto-Continuation Loop ---

        # Save the complete bot reply to the conversation history
        conversation_history[-1]["bot"] = full_reply.strip()
        logger.info(f"Final assembled bot response: {full_reply}")

        return full_reply.strip()
    except requests.exceptions.RequestException as e:
        log_error_with_traceback(logger, f"API request failed: {str(e)}")
        return f"Error: {e}"
    except Exception as e:
        log_error_with_traceback(logger, f"Unexpected error: {str(e)}")
        return f"Error: {e}"

def stream_bot_response(user_message):
    """Generator that yields each LLM chunk as soon as it's generated."""
    global conversation_history
    try:
        user_message = user_message.strip()
        logger.info(f"Received user message: {user_message}")
        conversation_history.append({"user": user_message, "bot": ""})
        logger.debug(f"Updated conversation history: {conversation_history}")
        full_reply = ""
        is_finished = False
        buffer = ""
        while not is_finished:
            base_prompt = f"{get_system_prompt()}\n{format_prompt(conversation_history)}"
            prompt_with_continuation = base_prompt + full_reply
            output = llm(
                prompt_with_continuation,
                temperature=0.7,
                top_p=0.9,
                top_k=50,
                repeat_penalty=1.2,
                max_tokens=200, # This is our chunk size
                stop=["[INST]", "</s>"],
                echo=False
            )
            chunk = buffer + output["choices"][0]["text"]
            finish_reason = output["choices"][0]["finish_reason"]
            full_reply += chunk
            logger.info(f"Generated chunk: '{chunk[:70]}...', Finish reason: {finish_reason}")
            # Yield the chunk and whether it's the final chunk
            is_final = finish_reason == 'stop'
            if not is_final:
                sentences = split_on_sentence_boundary(chunk)
                buffer = sentences[-1]
                chunk.replace(buffer, "")

            yield {"text": chunk, "is_final": is_final}
            if is_final:
                is_finished = True
            elif finish_reason == 'length':
                logger.info("Response truncated by length, continuing generation...")
        conversation_history[-1]["bot"] = full_reply.strip()
        logger.info(f"Final assembled bot response: {full_reply}")
    except requests.exceptions.RequestException as e:
        log_error_with_traceback(logger, f"API request failed: {str(e)}")
        yield {"text": f"Error: {e}", "is_final": True}
    except Exception as e:
        log_error_with_traceback(logger, f"Unexpected error: {str(e)}")
        yield {"text": f"Error: {e}", "is_final": True}

async def main():
    global conversation_history
    print("Chatbot initialized. Type 'quit' to exit, 'clear' to clear history, or 'api' for API mode")

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() == 'quit':
            break
        elif user_input.lower() == 'clear':
            conversation_history = []
            print("Conversation history cleared.")
            continue
        elif user_input.lower() == 'print':
            for text in conversation_history:
                print(text)
            continue

        if not user_input:
            print("Please enter a message.")
            continue

        response = ask_bot_api(user_input)

        print(f"Bot: {response}")


if __name__ == "__main__":
    asyncio.run(main())  # main()
