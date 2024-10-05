from gtts import gTTS
import io


def generate_audio(text):
    tts = gTTS(text=text, lang='en')
    tts.save("audio.mp3")
    with open("audio.mp3", 'rb') as f:
        audio_bytes = io.BytesIO(f.read())
    return audio_bytes.read()

if __name__ == "__main__":
    generate_audio("Hi, How are you?")
