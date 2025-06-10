# main.py
import json
import base64
import uvicorn
from io import BytesIO
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import logging
import datetime
import traceback
from logging_config import setup_logging, log_error_with_traceback

from llm_model import ask_bot_api, stream_bot_response
from stt_model import transcribe_audio
from tts_model import generate_audio

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI()
clients = {}


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    try:
        logger.info(f"New connection from client {client_id}")
        await websocket.accept()
        clients[client_id] = []
        while True:
            audio_data = await websocket.receive_bytes()
            logger.info(f"Received audio data from client {client_id}")

            audio_text = process_audio(audio_data)
            logger.info(f"Transcribed text: {audio_text}")

            # Stream LLM and audio chunks
            full_llm_response = ""
            for chunk in stream_bot_response(audio_text):
                llm_chunk = chunk["text"]
                is_final = chunk["is_final"]
                full_llm_response += llm_chunk
                if llm_chunk.strip():
                    try:
                        audio_bytes = generate_audio(llm_chunk)
                        logger.info(f"Generated audio chunk for client {client_id}")
                        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                        response = {
                            "type": "audio_chunk",
                            "data": audio_base64,
                            "user_text": audio_text if full_llm_response == llm_chunk else None,
                            "bot_text": llm_chunk,
                            "is_final": is_final
                        }
                        await websocket.send_text(json.dumps(response))
                        logger.info(f"Sent audio chunk to client {client_id}")
                    except Exception as e:
                        log_error_with_traceback(logger, f"Audio generation error: {str(e)}")
                        error_response = {
                            "type": "error",
                            "message": f"Audio generation error: {str(e)}"
                        }
                        await websocket.send_text(json.dumps(error_response))
                if is_final:
                    break

    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        log_error_with_traceback(logger, f"Error with client {client_id}: {str(e)}")
        error_response = {
            "type": "error",
            "message": str(e)
        }
        await websocket.send_text(json.dumps(error_response))

    finally:
        if client_id in clients:
            del clients[client_id]
            logger.info(f"Cleaned up client {client_id} session")


def process_audio(audio_data):
    audio_text = transcribe_audio(audio_data)

    return audio_text

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
