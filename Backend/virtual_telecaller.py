import os
import time
import uuid
import pyaudio
import wave
import tempfile
import pygame
from google import genai
from elevenlabs import ElevenLabs
from groq import Groq

class VirtualTelecaller:
    def __init__(self, gemini_api_key, document_path, eleven_api_key, groq_api_key):
        """
        Initialize the virtual telecaller with voice interaction.

        Args:
            gemini_api_key: Google Gemini API key
            document_path: Path to the document containing context information
            eleven_api_key: ElevenLabs API key for text-to-speech
            groq_api_key: Groq API key for speech-to-text
        """
        # Initialize Google Gemini client
        self.client = genai.Client(api_key=gemini_api_key)
        self.model = 'gemini-2.0-flash'

        # Initialize ElevenLabs client for TTS
        self.eleven_client = ElevenLabs(api_key=eleven_api_key)
        self.voice_id = "JBFqnCBsd6RMkjVDRZzb"  # Default voice ID
        self.tts_model = "eleven_multilingual_v2"
        
        # Initialize Groq client for STT
        self.groq_client = Groq(api_key=groq_api_key)
        
        # Initialize pygame mixer for audio playback
        pygame.mixer.init()
        
        # Create output directories if they don't exist
        self.output_dir = "call_recordings"
        os.makedirs(self.output_dir, exist_ok=True)

        # Load context from document
        self.context = self.load_document(document_path)

        # Initialize conversation history
        self.conversation_history = []
        
        # Keep track of the call's audio segments
        self.call_id = str(uuid.uuid4())[:8]
        self.audio_segments = []
        
        # Audio recording parameters
        self.sample_rate = 16000
        self.channels = 1
        self.chunk = 1024
        self.audio_format = pyaudio.paInt16

    def load_document(self, document_path):
        """Load and parse the document containing context information."""
        try:
            with open(document_path, 'r') as file:
                return file.read()
        except Exception as e:
            print(f"Error loading document: {e}")
            return ""

    def process_user_input(self, user_input):
        """
        Process user input and generate a response.

        Args:
            user_input: Transcribed text from user's speech

        Returns:
            response_text: Generated response to be converted to speech
        """
        # Add user input to conversation history
        self.conversation_history.append(f"Customer: {user_input}")
        newline = '\n'
        # Prepare prompt as a simple string
        prompt = f"""You are a professional telecaller speaking with a customer on the phone.
Use the following information to answer customer questions:

CONTEXT INFORMATION:
{self.context}

CONVERSATION GUIDELINES:
1. Speak naturally as if you're on a phone call
2. Keep responses concise and conversational
3. If you don't know something, be honest and offer to find out
4. Be helpful, polite, and professional
5. Do not mention that you're an AI
6. Address the customer's questions directly
7. Use natural speech patterns with short pauses and occasional verbal fillers

PREVIOUS CONVERSATION:
{newline.join(self.conversation_history[-5:])}

CUSTOMER'S LATEST MESSAGE: "{user_input}"

Your response (speak as if on a phone call):"""

        try:
            # Generate response using Gemini with the simplified structure
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
            )

            response_text = response.text

            # Add response to conversation history
            self.conversation_history.append(f"Agent: {response_text}")

            return response_text

        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm sorry, I'm having trouble processing that. Could you please repeat?"

    def record_audio(self, duration=5):
        """
        Record audio from microphone for specified duration.
        
        Args:
            duration: Recording duration in seconds
            
        Returns:
            Path to temporary audio file
        """
        p = pyaudio.PyAudio()
        print(f"\nListening for {duration} seconds...")
        
        stream = p.open(
            format=self.audio_format,
            channels=self.channels,
            rate=self.sample_rate,
            input=True,
            frames_per_buffer=self.chunk
        )
        
        frames = []
        for _ in range(0, int(self.sample_rate / self.chunk * duration)):
            data = stream.read(self.chunk)
            frames.append(data)
            
        print("Listening finished.")
        stream.stop_stream()
        stream.close()
        p.terminate()
        
        # Save to a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_filename = temp_file.name
        
        wf = wave.open(temp_filename, 'wb')
        wf.setnchannels(self.channels)
        wf.setsampwidth(p.get_sample_size(self.audio_format))
        wf.setframerate(self.sample_rate)
        wf.writeframes(b''.join(frames))
        wf.close()
        
        return temp_filename

    def transcribe_audio(self, audio_file):
        """
        Transcribe audio file using Groq Whisper API.
        
        Args:
            audio_file: Path to audio file
            
        Returns:
            Transcribed text
        """
        try:
            print("Transcribing audio...")
            with open(audio_file, "rb") as file:
                transcription = self.groq_client.audio.transcriptions.create(
                    file=(audio_file, file.read()),
                    model="whisper-large-v3",
                    response_format="verbose_json",
                )
            
            print("Transcription complete.")
            return transcription.text
            
        except Exception as e:
            print(f"Error during transcription: {e}")
            return None

    def speech_to_text(self):
        """
        Record audio and convert to text.
        
        Returns:
            Transcribed text from user's speech
        """
        # Record audio
        audio_file = self.record_audio(duration=5)
        
        # Transcribe audio
        transcription = self.transcribe_audio(audio_file)
        
        # Clean up temporary file
        os.unlink(audio_file)
        
        if transcription:
            return transcription
        else:
            return "I couldn't understand that"

    def text_to_speech(self, text, voice_id=None):
        """
        Convert text to speech using ElevenLabs, save the audio file, and play it.
        
        Args:
            text: Text to convert to speech
            voice_id: Optional voice ID to use (defaults to class default if not provided)
            
        Returns:
            path to saved audio file
        """
        try:
            # Generate a unique filename for this segment
            segment_id = len(self.audio_segments) + 1
            filename = f"{self.output_dir}/call_{self.call_id}_segment_{segment_id}.mp3"
            
            print("Converting text to speech...")
            # Generate audio stream using provided voice_id or default
            audio_stream = self.eleven_client.text_to_speech.convert_as_stream(
                voice_id=voice_id or self.voice_id,  # Use provided voice_id if available
                output_format="mp3_44100_128",
                text=text,
                model_id=self.tts_model,
            )
            
            # Save audio to file
            with open(filename, 'wb') as f:
                for chunk in audio_stream:
                    if chunk:
                        f.write(chunk)
            
            # Add to segments list
            self.audio_segments.append(filename)
            print(f"Speech saved to {filename}")
            
            return filename
        
        except Exception as e:
            print(f"Error in text-to-speech conversion: {e}")
            return None
    
    def play_audio(self, audio_file):
        """
        Play the generated audio file.
        
        Args:
            audio_file: Path to the audio file to play
        """
        try:
            print("Playing audio response...")
            pygame.mixer.music.load(audio_file)
            pygame.mixer.music.play()
            
            # Wait for the audio to finish playing
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
                
            print("Audio playback complete")
        
        except Exception as e:
            print(f"Error playing audio: {e}")

    def handle_call(self):
        """
        Handle the entire call flow using voice interaction.
        """
        # Initial greeting
        greeting = "Hello! Thank you for calling. How may I help you today?"
        print("\nTelecaller:", greeting)
        self.text_to_speech(greeting)
        self.conversation_history.append(f"Agent: {greeting}")

        # Main conversation loop
        while True:
            # Get user speech input and convert to text
            user_speech = self.speech_to_text()
            print("\nUser:", user_speech)

            # Check for call end conditions
            if "goodbye" in user_speech.lower() or "bye" in user_speech.lower() or "end call" in user_speech.lower():
                final_response = "Thank you for calling. Have a great day!"
                print("\nTelecaller:", final_response)
                self.text_to_speech(final_response)
                break

            # Process user input and generate response
            response = self.process_user_input(user_speech)
            print("\nTelecaller:", response)

            # Convert response to speech and play it
            self.text_to_speech(response)

            # Brief pause between turns
            time.sleep(0.5)