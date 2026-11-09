import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechSynthesisProps {
  pitch?: number;
  rate?: number;
  voiceName?: string;
  enabled?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useSpeechSynthesis({
  pitch = 1.15,
  rate = 1.05,
  voiceName = '',
  enabled = true,
  onStart,
  onEnd,
}: UseSpeechSynthesisProps = {}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      onEnd?.();
    }
  }, [onEnd]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !synthRef.current || !text.trim()) return;

      // Cancel any ongoing speech
      synthRef.current.cancel();

      // Clean text for speech (strip emojis and asterisks)
      const cleanText = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = pitch;
      utterance.rate = rate;

      // Select preferred voice if specified, or pick pleasant English voice
      if (voices.length > 0) {
        if (voiceName) {
          const match = voices.find((v) => v.name.toLowerCase().includes(voiceName.toLowerCase()));
          if (match) utterance.voice = match;
        }
        if (!utterance.voice) {
          const defaultEn =
            voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
          if (defaultEn) utterance.voice = defaultEn;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        onEnd?.();
      };

      synthRef.current.speak(utterance);
    },
    [enabled, pitch, rate, voiceName, voices, onStart, onEnd]
  );

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
}
