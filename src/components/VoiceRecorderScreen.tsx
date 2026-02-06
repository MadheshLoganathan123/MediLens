import { useState, useRef, useEffect } from 'react';
import { Mic, Square, ChevronLeft, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { apiFetch } from '../lib/apiClient';

interface VoiceRecorderScreenProps {
  onTranscriptComplete: (transcript: string) => void;
  onBack: () => void;
}

export function VoiceRecorderScreen({ onTranscriptComplete, onBack }: VoiceRecorderScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Setup audio level monitoring
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start monitoring audio levels
      monitorAudioLevel();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio level monitoring
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Process the recording
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255); // Normalize to 0-1

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      setError('No audio recorded. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to WAV for better compatibility with Whisper
      const wavBlob = await convertToWav(audioBlob);

      // Create form data
      const formData = new FormData();
      formData.append('file', wavBlob, 'recording.wav');

      // Send to backend for transcription
      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'Transcription failed');
      }

      const data = await response.json();
      
      if (data.success && data.transcript) {
        setTranscript(data.transcript);
      } else {
        throw new Error('No transcript received');
      }

    } catch (err: any) {
      console.error('Error processing recording:', err);
      setError(err.message || 'Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    // For now, return the original blob
    // In production, you might want to use a library like lamejs or ffmpeg.wasm
    // to convert to WAV format for better compatibility
    return webmBlob;
  };

  const handleContinue = () => {
    if (transcript) {
      onTranscriptComplete(transcript);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
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
        {/* Instructions */}
        {!isRecording && !transcript && !isProcessing && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to use voice input:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Tap the microphone button to start recording</li>
              <li>• Speak clearly and describe your symptoms</li>
              <li>• Tap the stop button when finished</li>
              <li>• Review and edit the transcript if needed</li>
            </ul>
          </div>
        )}

        {/* Recording Interface */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Microphone Button */}
          {!isProcessing && !transcript && (
            <div className="relative">
              {/* Audio level visualization */}
              {isRecording && (
                <div 
                  className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-pulse"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.5})`,
                    transition: 'transform 0.1s ease-out'
                  }}
                />
              )}
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 scale-110'
                    : 'bg-gradient-to-br from-orange-500 to-amber-500 hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <Square className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </button>
            </div>
          )}

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-lg font-semibold text-gray-700">Recording...</span>
              </div>
              <div className="text-3xl font-mono font-bold text-gray-900">
                {formatTime(recordingTime)}
              </div>
              <p className="text-sm text-gray-600">Tap the stop button when finished</p>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="text-center space-y-4">
              <Loader className="w-16 h-16 text-orange-500 animate-spin mx-auto" />
              <div>
                <p className="text-lg font-semibold text-gray-700">Processing your recording...</p>
                <p className="text-sm text-gray-600">This may take a few moments</p>
              </div>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && !isProcessing && (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Transcription Complete</span>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-100">
                <h3 className="font-semibold text-gray-900 mb-3">Your Symptoms:</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setTranscript('');
                    setRecordingTime(0);
                  }}
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
              <button
                onClick={() => setError(null)}
                className="mt-3 w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        {!transcript && !isProcessing && (
          <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <h4 className="font-semibold text-amber-900 mb-2">💡 Tips for best results:</h4>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>• Find a quiet environment</li>
              <li>• Speak at a normal pace</li>
              <li>• Describe symptoms in detail</li>
              <li>• Mention duration and severity</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
