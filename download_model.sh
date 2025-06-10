#!/bin/bash

MODEL_DIR="voicebot-backend"
MODEL_FILE="mistral-7b-instruct-v0.1.Q4_K_M.gguf"
MODEL_PATH="$MODEL_DIR/$MODEL_FILE"
MODEL_URL="https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q4_K_M.gguf"

if [ -f "$MODEL_PATH" ]; then
    echo "Model file already exists at $MODEL_PATH."
else
    echo "Downloading model file to $MODEL_PATH..."
    mkdir -p "$MODEL_DIR"
    curl -L -o "$MODEL_PATH" "$MODEL_URL"
    echo "Download complete."
fi 