# VoiceBot Assistant

A voice-based chatbot application with a React frontend and Python backend that provides speech-to-text and text-to-speech capabilities.

## Project Structure

```
VoiceBotAssistant/
├── voicebot-backend/     # Python FastAPI backend
└── voicebot-frontend/    # React frontend
```

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- FFmpeg (for audio processing)
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Sufficient disk space for the GGUF model file (several GBs)

## 1. Download the GGUF Model File

You need to download the `mistral-7b-instruct-v0.1.Q4_K_M.gguf` model file before running the backend. You can do this manually or by running the provided script:

### **Option 1: Manual Download**
1. Download the model from [TheBloke's HuggingFace page](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF).
2. Place the file at:
   ```
   voicebot-backend/mistral-7b-instruct-v0.1.Q4_K_M.gguf
   ```

### **Option 2: Scripted Download**
Run the following script to automatically download the model:
```sh
bash download_model.sh
```

## 2. Build and Run the Application with Docker Compose

From the project root directory, run:
```sh
docker-compose build
docker-compose up
```
- The backend will be available at [http://localhost:8000](http://localhost:8000)
- The frontend will be available at [http://localhost:3000](http://localhost:3000)

## 3. Model File Mounting
- The model file is mounted into the backend container using a Docker volume.
- If you change the model file location, update the `docker-compose.yml` accordingly.

## 4. Environment Variables
- The backend uses the `MODEL_PATH` environment variable to locate the GGUF model file. This is set automatically in `docker-compose.yml`.

## 5. Development
- For development, you can still run the backend and frontend locally, but ensure the model file path is correct in your environment.

## Backend Setup

1. Navigate to the backend directory:
   ```bash
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

4. Start the backend server:
   ```bash
   python main.py
   ```
   The backend server will start on `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd voicebot-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or if using yarn
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or if using yarn
   yarn start
   ```
   The frontend will start on `http://localhost:3000`

## Running the Application

1. Make sure both backend and frontend servers are running in separate terminal windows
2. Open your browser and navigate to `http://localhost:3000`
3. Allow microphone access when prompted
4. Start interacting with the voice bot!

## Features

- Speech-to-Text conversion
- Text-to-Speech synthesis
- Real-time voice interaction
- Modern Material-UI interface
- WebSocket communication for real-time updates

## Dependencies

### Backend Dependencies
- FastAPI
- TensorFlow
- TTS (Text-to-Speech)
- PyTorch
- Transformers
- And other ML/Audio processing libraries

### Frontend Dependencies
- React
- Material-UI
- WebSocket client
- Buffer for audio processing

## Troubleshooting

1. If you encounter audio-related issues:
   - Ensure FFmpeg is properly installed
   - Check microphone permissions in your browser
   - Verify audio input/output devices are working

2. If the backend fails to start:
   - Check if port 8000 is available
   - Ensure all Python dependencies are installed correctly
   - Verify Python version compatibility

3. If the frontend fails to start:
   - Check if port 3000 is available
   - Clear npm cache if needed: `npm cache clean --force`
   - Delete node_modules and reinstall dependencies

## License

This project is licensed under the MIT License. 