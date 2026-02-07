import { useState, useRef, useEffect } from 'react';
import { Activity, Square, ChevronLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface VoiceRecorderScreenProps {
  onTranscriptComplete: (transcript: string) => void;
  onBack: () => void;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceRecorderScreen({ onTranscriptComplete, onBack }: VoiceRecorderScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalText += transcriptPart + ' ';
        } else {
          interimText += transcriptPart;
        }
      }

      if (finalText) {
        setTranscript(prev => prev + finalText);
      }
      
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'An error occurred during speech recognition.';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
      }
      
      setError(errorMessage);
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);
      setInterimTranscript('');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    try {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      setRecordingTime(0);
      
      recognitionRef.current.start();
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const handleContinue = () => {
    if (transcript.trim()) {
      onTranscriptComplete(transcript.trim());
    }
  };

  const handleReset = () => {
    setTranscript('');
    setInterimTranscript('');
    setRecordingTime(0);
    setError(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayText = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-6 pt-10 pb-6 flex-shrink-0">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white hover:text-orange-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-white text-3xl font-bold mb-2">Voice Input</h1>
        <p className="text-orange-100">Speak your symptoms clearly</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Browser Support Error */}
        {!isSupported && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Not Supported</h4>
                <p className="text-red-700 text-sm">
                  Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for voice input.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {isSupported && !isRecording && !transcript && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to use voice input:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Tap the microphone button to start</li>
              <li>• Speak clearly and describe your symptoms</li>
              <li>• Your words will appear in real-time below</li>
              <li>• Tap stop when finished</li>
              <li>• Review and continue to next step</li>
            </ul>
          </div>
        )}

        {/* Recording Interface */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Microphone Button */}
          {isSupported && (
            <div className="relative">
              {/* Pulsing animation when recording */}
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-pulse" />
                </>
              )}
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isSupported}
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 scale-110'
                    : 'bg-gradient-to-br from-orange-500 to-amber-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isRecording ? (
                  <Square className="w-12 h-12 text-white" />
                ) : (
                  <Activity className="w-12 h-12 text-white" />
                )}
              </button>
            </div>
          )}

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-lg font-semibold text-gray-700">Listening...</span>
              </div>
              <div className="text-3xl font-mono font-bold text-gray-900">
                {formatTime(recordingTime)}
              </div>
              <p className="text-sm text-gray-600">Speak now - your words appear below</p>
            </div>
          )}

          {/* Real-time Transcript Display */}
          {(isRecording || transcript) && (
            <div className="w-full space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-100 min-h-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {isRecording ? 'Speaking...' : 'Your Symptoms:'}
                  </h3>
                  {isRecording && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-red-600 font-medium">LIVE</span>
                    </div>
                  )}
                </div>
                
                {displayText ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-gray-400 italic">{interimTranscript}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">Start speaking to see your words here...</p>
                )}
              </div>

              {/* Action Buttons */}
              {!isRecording && transcript && (
                <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Recording Complete</span>
                </div>
              )}

              {!isRecording && transcript && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Record Again
                  </button>
                  <button
                    onClick={handleContinue}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
              {isSupported && (
                <button
                  onClick={() => {
                    setError(null);
                    handleReset();
                  }}
                  className="mt-3 w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        {isSupported && !transcript && (
          <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <h4 className="font-semibold text-amber-900 mb-2">💡 Tips for best results:</h4>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>• Find a quiet environment</li>
              <li>• Speak at a normal pace</li>
              <li>• Describe symptoms in detail</li>
              <li>• Mention duration and severity</li>
              <li>• Allow microphone access when prompted</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
