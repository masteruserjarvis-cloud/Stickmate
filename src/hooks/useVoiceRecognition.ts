import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceRecognitionProps {
  onCommand: (transcript: string) => void;
  wakeWordEnabled?: boolean;
  wakeWords?: string[];
}

export function useVoiceRecognition({
  onCommand,
  wakeWordEnabled = false,
  wakeWords = ['stick', 'stickmate', 'stickly', 'hey stick'],
}: UseVoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldKeepListeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalPhrase = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalPhrase += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setTranscript(finalPhrase || currentInterim);

        if (finalPhrase.trim()) {
          const cleanPhrase = finalPhrase.trim();

          if (wakeWordEnabled) {
            const lower = cleanPhrase.toLowerCase();
            const matchedWake = wakeWords.some((w) => lower.includes(w));
            if (matchedWake) {
              // Extract command after wake word if present
              onCommand(cleanPhrase);
            }
          } else {
            onCommand(cleanPhrase);
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e.error);
        if (e.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow mic access or use text input.');
        } else if (e.error !== 'no-speech') {
          setError(`Voice input notice: ${e.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        if (shouldKeepListeningRef.current) {
          try {
            recognition.start();
          } catch (err) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [onCommand, wakeWordEnabled, wakeWords]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript('');
    shouldKeepListeningRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already running or starting
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
    error,
  };
}
