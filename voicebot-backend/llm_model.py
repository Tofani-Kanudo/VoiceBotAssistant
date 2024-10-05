from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch

model_name = "microsoft/DialoGPT-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
chat_history_ids = None

async def generate_response(conversation_history: str, temperature: float = 0.8, top_p: float = 0.9,
                            top_k: int = 50, repetition_penalty: float = 1.2, max_length: int = 500) -> str:
    global chat_history_ids
    new_user_input_ids = tokenizer.encode(conversation_history + tokenizer.eos_token, return_tensors='pt')

    # Append user input to the chat history
    chat_history_ids = torch.cat([chat_history_ids, new_user_input_ids], dim=-1) if 'chat_history_ids' in locals() else new_user_input_ids
    bot_input_ids = chat_history_ids

    # Generate a response using the specified temperature
    chat_history_ids = model.generate(
        bot_input_ids,
        max_length=max_length,  # Maximum length of the response
        temperature=temperature,  # Randomness of the output
        top_p=top_p,  # Nucleus sampling
        top_k=top_k,  # Top-k sampling
        repetition_penalty=repetition_penalty,  # Penalty for repetition
        pad_token_id=tokenizer.eos_token_id,  # Padding token
        eos_token_id=tokenizer.eos_token_id  # End-of-sequence token
    )

    # Get the response and decode it
    bot_response = tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)
    return bot_response
