from gtts import gTTS
import io
import logging
from logging_config import setup_logging, log_error_with_traceback

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)

def generate_audio(text):
    try:
        logger.info(f"Generating audio for text: {text}")
        audio_bytes = io.BytesIO()
        tts = gTTS(text=text, lang='en')
        tts.write_to_fp(audio_bytes)
        audio_bytes.seek(0)  # Reset pointer to beginning of stream
        logger.info("Audio generation complete")
        return audio_bytes.read()
    except Exception as e:
        log_error_with_traceback(logger, f"Error during audio generation: {str(e)}")
        raise

if __name__ == "__main__":
    generate_audio("Hi, How are you?")
