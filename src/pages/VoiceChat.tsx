import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

const voiceIdMap = {
  "Aria": "9BWtsMINqrJLrRacOk9x",
  "Brian": "nPczCjzI2devNBz1zQrb",
  "Freya": "jsCqWAovK2LkecY7zXl4",
  "Lily": "pFZP5JQG7iQjIQuC4Bku",
  "Thomas": "GBv7mTt0atIp3Br8iCZE",
  "Harsh": "HobRzuqtLputbKAXOdTj",
  "Monica": "UYoWPkHjaRgjWccloxC5"
};

function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Aria");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);

  const voices = [
    "Aria",
    "Brian",
    "Freya",
    "Lily",
    "Thomas",
    "Harsh",
    "Monica"
  ];

  const startRecording = async () => {
    setIsRecording(true);
    setConversationEnded(false);
    setIsWaitingForResponse(false);
    setErrorMessage("");
    audioChunksRef.current = [];

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = context;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);

      detectVoiceActivity();
    } catch (error) {
      console.error('Could not start recording', error);
      setErrorMessage('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  const pauseVoiceDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    setIsVoiceDetected(false);
  };

  const resumeVoiceDetection = () => {
    if (!conversationEnded) {
      console.log('Resuming voice detection');
      
      if (!isRecording) {
        setIsRecording(true);
      }
      
      mediaRecorderRef.current = null;
      
      detectVoiceActivity();
    }
  };

  const detectVoiceActivity = () => {
    if (isWaitingForResponse) return;

    const analyser = analyserRef.current;
    if (!analyser) {
      console.error('Analyser is null in detectVoiceActivity');
      return;
    }
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;

      const threshold = 20;

      if (average > threshold) {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        setIsVoiceDetected(true);

        if (!mediaRecorderRef.current) {
          startMediaRecorder();
        }
      } else {
        if (!silenceTimeoutRef.current) {
          silenceTimeoutRef.current = setTimeout(() => {
            setIsVoiceDetected(false);
            silenceTimeoutRef.current = null;

            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stop();
            }
          }, 1000);
        }
      }

      if (!isWaitingForResponse) {
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      }
    };

    checkAudioLevel();
  };

  const startMediaRecorder = () => {
    if (!microphoneStreamRef.current) {
      console.error('No microphone stream available');
      startRecording();
      return;
    }

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.log('Stopping existing recorder:', e);
      }
      mediaRecorderRef.current = null;
    }

    const stream = microphoneStreamRef.current;
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

      setIsWaitingForResponse(true);
      pauseVoiceDetection();

      try {
        const formData = new FormData();
        formData.append('voice', audioBlob, 'voice_input.wav');
        formData.append('voice_id', voiceIdMap[selectedVoice]);

        const response = await axios.post('http://127.0.0.1:5000/process-voice', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: false
        });

        console.log('Server response:', response.data);

        if (response.data && response.data.response_audio) {
          const audioUrl = response.data.response_audio.startsWith('http')
            ? response.data.response_audio
            : `http://127.0.0.1:5000${response.data.response_audio}`;

          console.log('Playing audio from URL:', audioUrl);

          const audio = new Audio(audioUrl);

          audio.onended = () => {
            console.log('AUDIO ENDED EVENT TRIGGERED');
            console.log('Audio playback ended - isWaitingForResponse:', isWaitingForResponse);
            console.log('Audio playback ended - conversationEnded:', conversationEnded);
            
            if (!response.data.ended) {
              console.log('Setting isWaitingForResponse to false and resuming voice detection');
              setIsWaitingForResponse(false);
              resumeVoiceDetection();
              console.log('Voice detection resuming called');
            }
          };

          audio.onerror = (err) => {
            console.error('Audio playback error:', err);
            setErrorMessage(`Failed to play response audio: ${err.message || 'Unknown error'}`);
            if (!response.data.ended) {
              setIsWaitingForResponse(false);
              resumeVoiceDetection();
            }
          };

          audio.play()
            .then(() => console.log('Audio playback started'))
            .catch(err => {
              console.error('Failed to play audio:', err);
              setErrorMessage(`Failed to play audio: ${err.message}`);
              if (!response.data.ended) {
                setIsWaitingForResponse(false);
                resumeVoiceDetection();
              }
            });
        } else {
          console.error('Invalid response format:', response.data);
          setErrorMessage('Invalid response from server');
          setIsWaitingForResponse(false);
          resumeVoiceDetection();
        }

        if (response.data && response.data.ended) {
          setConversationEnded(true);
          stopRecording();
        }
      } catch (error) {
        console.error('API Error:', error);
        setErrorMessage(`Error: ${error.message || 'Failed to communicate with server'}`);
        setIsWaitingForResponse(false);
        resumeVoiceDetection();
      }

      audioChunksRef.current = [];
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">AI Voice Assistant</h1>
          <p className="text-gray-400">Speak naturally with AI using your voice</p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="w-64">
            <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-2">
              Select Voice
            </label>
            <div className="relative">
              <select
                id="voice-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isRecording || isWaitingForResponse}
              >
                {voices.map((voice) => (
                  <option key={voice} value={voice}>{voice}</option>
                ))}
              </select>
              <Volume2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={conversationEnded}
            className={`relative p-8 rounded-full transition-all duration-300 ${
              isRecording 
                ? 'bg-emerald-500 hover:bg-emerald-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            } ${conversationEnded ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`absolute inset-0 rounded-full ${
              isVoiceDetected ? 'animate-ping bg-emerald-500/50' : ''
            }`}></div>
            {isWaitingForResponse ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : isRecording ? (
              <Mic className="w-12 h-12 text-white" />
            ) : (
              <MicOff className="w-12 h-12 text-gray-300" />
            )}
          </button>

          <p className="text-gray-400 text-lg">
            {isWaitingForResponse
              ? 'Processing...'
              : isRecording
                ? isVoiceDetected
                  ? 'Listening to you...'
                  : 'Waiting for voice...'
                : 'Click the microphone to start'}
          </p>

          {isVoiceDetected && !isWaitingForResponse && (
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 24 + 12}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-center">{errorMessage}</p>
          </div>
        )}

        {conversationEnded && (
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <p className="text-gray-300 text-center">Conversation has ended.</p>
          </div>
        )}

        {isRecording && isWaitingForResponse && (
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => {
                setIsWaitingForResponse(false);
                resumeVoiceDetection();
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors"
            >
              Resume Listening
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-gray-500 text-sm">
        Powered by Advanced AI Technology
      </div>
    </div>
  );
}

export default VoiceChat;