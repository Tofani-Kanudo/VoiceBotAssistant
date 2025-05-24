# VoiceBot Assistant Backend

A real-time voice-based conversational AI system that uses WebSocket for bidirectional communication, featuring speech-to-text, text-to-speech, and natural language processing capabilities.

## Features

- Real-time WebSocket communication
- Speech-to-Text conversion using OpenAI's Whisper model
- Text-to-Speech conversion using Google's gTTS
- Natural Language Processing using Microsoft's DialoGPT
- Asynchronous processing for better performance

## Prerequisites

- Python 3.8 or higher
- FFmpeg installed on your system
- Sufficient disk space for model downloads

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voicebot-backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Project Structure

```
voicebot-backend/
├── main.py           # FastAPI application and WebSocket endpoint
├── llm_model.py      # DialoGPT model for conversation generation
├── stt_model.py      # Whisper model for speech-to-text conversion
├── tts_model.py      # gTTS for text-to-speech conversion
├── requirements.txt  # Project dependencies
└── README.md         # This file
```

## Usage

1. Start the server:
```bash
python main.py
```

The server will start on `http://localhost:8000`

2. Connect to the WebSocket endpoint:
```
ws://localhost:8000/ws/{client_id}
```

## API Endpoints

### WebSocket Endpoint
- **URL**: `/ws/{client_id}`
- **Method**: WebSocket
- **Description**: Handles real-time bidirectional communication for voice chat
- **Input**: Audio data in bytes
- **Output**: JSON response containing:
  - `type`: Response type ("audio" or "error")
  - `data`: Base64 encoded audio data (for type="audio")
  - `message`: Status message

## Models Used

1. **Speech-to-Text**: OpenAI's Whisper (tiny.en)
   - Converts audio input to text
   - Optimized for English language

2. **Language Model**: Microsoft's DialoGPT-medium
   - Generates conversational responses
   - Maintains conversation context

3. **Text-to-Speech**: Google's gTTS
   - Converts text responses to speech
   - Supports multiple languages

## Error Handling

The application includes comprehensive error handling:
- WebSocket connection errors
- Audio processing errors
- Model inference errors
- Invalid input handling

## Performance Considerations

- The application uses asynchronous processing for better performance
- Models are loaded once at startup to minimize latency
- Audio processing is optimized for real-time communication

## Security

- WebSocket connections are managed per client ID
- Client history is cleared on disconnect
- Input validation and sanitization are implemented

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Specify your license here]

## Support

For support, please [specify contact information or support channels] 