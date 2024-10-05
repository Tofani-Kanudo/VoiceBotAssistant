# main.py
import json
import base64
import uvicorn
from io import BytesIO
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from llm_model import generate_response
from stt_model import transcribe_audio
from tts_model import generate_audio

app = FastAPI()
clients = {}


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    clients[client_id] = []
    try:
        while True:
            audio_data = await websocket.receive_bytes()  # Receive audio data

            audio_text = process_audio(audio_data)

            llm_response = await generate_response(audio_text)
            print(f"LLM Response: {llm_response}")

            # Generate audio bytes from the LLM response
            audio_bytes = generate_audio(llm_response)

            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            # Create a structured response
            response = {
                "type": "audio",  # or "text" if needed in future
                "data": audio_base64,
                "message": "Bot response received."
            }

            # Send back the structured response
            await websocket.send_text(json.dumps(response))  # Send as text because it's now JSON

    except Exception as e:
        error_response = {
            "type": "error",
            "message": str(e)
        }
        await websocket.send_text(json.dumps(error_response))
        print(f"Error: {e}")

    finally:
        if client_id in clients:
            del clients[client_id]  # Remove client history on disconnect


def process_audio(audio_data):
    audio_text = transcribe_audio(audio_data)

    return audio_text

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
