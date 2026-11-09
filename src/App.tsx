/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CompanionState,
  MoodType,
  ActionType,
  ChatMessage,
} from './types/companion';
import {
  DEFAULT_APPEARANCE,
  DEFAULT_TRAITS,
  applyEvolution,
  parseLocalVoiceCommand,
} from './utils/personalityEngine';
import { OverlayWidget } from './components/OverlayWidget';
import { CustomizationModal } from './components/CustomizationModal';
import { DesktopSimulator } from './components/DesktopSimulator';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import {
  Sparkles,
  Sliders,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  Compass,
} from 'lucide-react';

const STORAGE_KEY = 'stickmate_companion_state_v1';

export default function App() {
  // Check if we are running in detached overlay mode
  const [isDetachedMode, setIsDetachedMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('overlay') === 'detached') {
        setIsDetachedMode(true);
      }
    }
  }, []);

  // Companion State
  const [companion, setCompanion] = useState<CompanionState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            isSpeaking: false,
            isListening: false,
            action: 'idle',
            mood: 'happy',
          };
        } catch (e) {
          console.warn('Failed to parse saved companion state:', e);
        }
      }
    }

    return {
      name: 'Stickly',
      appearance: DEFAULT_APPEARANCE,
      traits: DEFAULT_TRAITS,
      mood: 'happy',
      action: 'idle',
      speechText: "Hey! I'm Stickly, your floating stick figure companion! Speak to me or try dragging me around.",
      isSpeaking: false,
      isListening: false,
      lastUserQuery: '',
      soundEnabled: true,
      voicePitch: 1.25,
      voiceRate: 1.05,
      voiceName: '',
      wakeWordEnabled: false,
      isFloatingOverlay: false,
      overlayPosition: { x: 80, y: 120 },
    };
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const companionRef = useRef(companion);
  companionRef.current = companion;

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      const toSave = {
        name: companion.name,
        appearance: companion.appearance,
        traits: companion.traits,
        soundEnabled: companion.soundEnabled,
        voicePitch: companion.voicePitch,
        voiceRate: companion.voiceRate,
        voiceName: companion.voiceName,
        wakeWordEnabled: companion.wakeWordEnabled,
        overlayPosition: companion.overlayPosition,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {}
  }, [companion]);

  // Speech Synthesis Hook
  const { speak, stop: stopSpeech, voices } = useSpeechSynthesis({
    pitch: companion.voicePitch,
    rate: companion.voiceRate,
    voiceName: companion.voiceName,
    enabled: companion.soundEnabled,
    onStart: () => {
      setCompanion((prev) => ({ ...prev, isSpeaking: true }));
    },
    onEnd: () => {
      setCompanion((prev) => ({ ...prev, isSpeaking: false, action: 'idle' }));
    },
  });

  // Action reset timeout ref
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAction = useCallback(
    (action: ActionType, mood: MoodType = 'happy', duration: number = 3200) => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }

      setCompanion((prev) => ({
        ...prev,
        action,
        mood,
      }));

      if (action !== 'idle' && action !== 'sleep' && action !== 'sit') {
        actionTimeoutRef.current = setTimeout(() => {
          setCompanion((prev) => ({
            ...prev,
            action: 'idle',
            mood: 'happy',
          }));
        }, duration);
      }
    },
    []
  );

  // Handle incoming message from user (Voice or Text)
  const handleUserMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim()) return;
      const cleanInput = userInput.trim();

      // Record in chat history
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: cleanInput,
        timestamp: Date.now(),
      };
      setChatHistory((prev) => [...prev.slice(-10), userMsg]);

      // Check local instant commands first for zero latency
      const localCmd = parseLocalVoiceCommand(cleanInput);
      if (localCmd && localCmd.isCommand) {
        if (localCmd.appearanceUpdate) {
          setCompanion((prev) => ({
            ...prev,
            appearance: {
              ...prev.appearance,
              ...localCmd.appearanceUpdate,
            },
          }));
        }

        if (localCmd.traitDeltas) {
          const evolved = applyEvolution(
            companionRef.current.traits,
            localCmd.traitDeltas,
            localCmd.triggerName || cleanInput,
            'Voice Command Execution'
          );
          setCompanion((prev) => ({ ...prev, traits: evolved }));
        }

        if (localCmd.action) {
          triggerAction(localCmd.action, localCmd.mood || 'happy');
        }

        if (localCmd.replyText) {
          setCompanion((prev) => ({
            ...prev,
            speechText: localCmd.replyText!,
            mood: localCmd.mood || prev.mood,
          }));
          speak(localCmd.replyText);
        }
        return;
      }

      // If not a local command, call Gemini server endpoint
      setIsProcessingAI(true);
      setCompanion((prev) => ({
        ...prev,
        mood: 'thinking',
        speechText: 'Hmm, let me think...',
      }));

      try {
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: cleanInput,
            companionName: companionRef.current.name,
            traits: companionRef.current.traits,
            mood: companionRef.current.mood,
            history: chatHistory.map((m) => ({ role: m.sender, text: m.text })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        // Apply personality evolution
        const evolved = applyEvolution(
          companionRef.current.traits,
          data.traitDeltas || { curiosity: 2, wit: 1 },
          cleanInput,
          data.evolutionNote || 'Conversational Chat'
        );

        setCompanion((prev) => ({
          ...prev,
          speechText: data.reply || "I'm right here with you!",
          mood: (data.mood as MoodType) || 'happy',
          traits: evolved,
        }));

        if (data.action && data.action !== 'idle') {
          triggerAction(data.action as ActionType, (data.mood as MoodType) || 'happy');
        }

        speak(data.reply);
      } catch (err) {
        console.warn('AI chat error, using graceful local fallback:', err);
        const fallbackReply = `I heard you! As your stick figure buddy, I'm always ready for action. Let's do a flip or dance!`;
        setCompanion((prev) => ({
          ...prev,
          speechText: fallbackReply,
          mood: 'happy',
        }));
        speak(fallbackReply);
      } finally {
        setIsProcessingAI(false);
      }
    },
    [chatHistory, speak, triggerAction]
  );

  // Voice Recognition Hook
  const {
    isListening,
    startListening,
    stopListening,
    toggleListening,
    isSupported: voiceSupported,
  } = useVoiceRecognition({
    onCommand: (spoken) => {
      handleUserMessage(spoken);
    },
    wakeWordEnabled: companion.wakeWordEnabled,
  });

  // Sync listening state with companion object
  useEffect(() => {
    setCompanion((prev) => ({ ...prev, isListening }));
  }, [isListening]);

  const handleUpdateCompanion = (updates: Partial<CompanionState>) => {
    if (updates.isListening !== undefined) {
      if (updates.isListening) {
        startListening();
      } else {
        stopListening();
      }
    }
    setCompanion((prev) => ({ ...prev, ...updates }));
  };

  const handleTestVoice = () => {
    speak(`Greetings! I'm ${companion.name}, your animated stick figure assistant! Ready to roll!`);
  };

  // If opened directly in detached overlay mode
  if (isDetachedMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3">
        <OverlayWidget
          companion={companion}
          onUpdateState={handleUpdateCompanion}
          onUserMessage={handleUserMessage}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onActionTrigger={triggerAction}
          isExternalWindow={true}
        />
        <CustomizationModal
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
          companion={companion}
          onUpdateState={handleUpdateCompanion}
          onTestVoice={handleTestVoice}
          onRunVoiceCommand={handleUserMessage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ================= 1. TOP BAR CONTRACT ================= */}
      {/* Exactly 3 zones: [Brand title, one line] — [4 nav links] — [1 primary action] */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
            style={{
              backgroundColor: `${companion.appearance.color}25`,
              color: companion.appearance.color,
              border: `1.5px solid ${companion.appearance.color}`,
            }}
          >
            웃
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100">
            StickMate AI
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <a href="#workspace" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
            Screen Workspace
          </a>
          <a href="#evolution" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
            Personality Lab
          </a>
          <a href="#voice-commands" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
            Voice Capabilities
          </a>
          <a href="#detach-info" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
            Overlay Widget
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-lg shadow-sky-400/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Companion</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 space-y-12">
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100 text-balance leading-tight">
              Autonomous Floating Stick Figure AI Companion
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
              Floats freely across your screen without confinement. Responds to natural voice commands in real-time, expresses itself through dynamic stick figure kinematics, and evolves its personality traits through every conversation.
            </p>
          </div>

          {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="text-slate-200 font-semibold">{companion.name}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="capitalize">{companion.traits.archetype}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Evolution Level {companion.traits.level}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{companion.traits.totalInteractions} Interactions</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400">Voice Recognition Active</span>
          </div>
        </section>

        {/* ================= INTERACTIVE WORKSPACE WITH FLOATING OVERLAY ================= */}
        <section id="workspace" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Live Screen Overlay Stage</h2>
              <p className="text-xs text-slate-400">
                Drag {companion.name} anywhere across windows, click quick actions, or speak voice commands.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateCompanion({ isListening: !companion.isListening })}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  companion.isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {companion.isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{companion.isListening ? 'Listening to Voice...' : 'Enable Voice Command'}</span>
              </button>

              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors border border-slate-700"
              >
                Wardrobe & Traits
              </button>
            </div>
          </div>

          {/* Desktop Simulator Frame */}
          <div className="relative">
            <DesktopSimulator
              companionName={companion.name}
              onTriggerAction={triggerAction}
            />

            {/* The Floating Overlay Widget */}
            <OverlayWidget
              companion={companion}
              onUpdateState={handleUpdateCompanion}
              onUserMessage={handleUserMessage}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onActionTrigger={triggerAction}
            />
          </div>
        </section>

        {/* ================= SECTION 2: PERSONALITY EVOLUTION LAB ================= */}
        <section id="evolution" className="space-y-6 pt-4 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Personality Trait Dynamics</h2>
            <p className="text-xs text-slate-400 mt-1">
              {companion.name}'s behavioral axes dynamically adjust based on how you speak and interact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Trait Card 1: Curiosity & Wit */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Intellect & Humor</span>
                <span className="text-xs font-mono text-sky-400 font-semibold">{companion.traits.archetype}</span>
              </div>

              {/* Curiosity Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Curiosity & Questions</span>
                  <span className="font-mono text-slate-400">{companion.traits.curiosity}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-sky-400 transition-all duration-500"
                    style={{ width: `${companion.traits.curiosity}%` }}
                  />
                </div>
              </div>

              {/* Wit Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Wit & Jokes</span>
                  <span className="font-mono text-slate-400">{companion.traits.wit}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${companion.traits.wit}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Asks deep questions during code reviews and tells spontaneous developer puns.
              </p>
            </div>

            {/* Trait Card 2: Zen & Mischief */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Temperament</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">Active Balance</span>
              </div>

              {/* Zen Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Zen & Mindfulness</span>
                  <span className="font-mono text-slate-400">{companion.traits.zen}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${companion.traits.zen}%` }}
                  />
                </div>
              </div>

              {/* Mischief Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Mischief & Antics</span>
                  <span className="font-mono text-slate-400">{companion.traits.mischief}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-rose-400 transition-all duration-500"
                    style={{ width: `${companion.traits.mischief}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Balances soothing breathing pauses with spontaneous acrobatic backflips and playful tease lines.
              </p>
            </div>

            {/* Trait Card 3: Loyalty & Level Progress */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bond & Progression</span>
                <span className="text-xs font-mono text-indigo-400 font-semibold">Lvl {companion.traits.level}</span>
              </div>

              {/* Loyalty Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Loyalty & Companion Bond</span>
                  <span className="font-mono text-slate-400">{companion.traits.loyalty}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-indigo-400 transition-all duration-500"
                    style={{ width: `${companion.traits.loyalty}%` }}
                  />
                </div>
              </div>

              {/* Interaction Count */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Interactions Logged</span>
                <span className="font-bold text-slate-200 font-mono">{companion.traits.totalInteractions}</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Remembers conversations across sessions and unlocks new stick accessories as bond deepens.
              </p>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: VOICE COMMANDS SHOWCASE ================= */}
        <section id="voice-commands" className="space-y-4 pt-4 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Voice Command Capabilities</h2>
            <p className="text-xs text-slate-400 mt-1">
              Instant physical reactions via Web Speech Recognition. Click any command to test trigger it:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Dance', cmd: 'Dance for me', icon: '💃' },
              { label: 'Backflip', cmd: 'Do a flip', icon: '🤸' },
              { label: 'Wave', cmd: 'Wave hello', icon: '👋' },
              { label: 'Sit Down', cmd: 'Sit down', icon: '🧘' },
              { label: 'Sleep', cmd: 'Take a nap', icon: '💤' },
              { label: 'Wizard Hat', cmd: 'Put on a wizard hat', icon: '🧙' },
              { label: 'Sunglasses', cmd: 'Put on sunglasses', icon: '🕶️' },
              { label: 'Cape', cmd: 'Put on a cape', icon: '🦸' },
              { label: 'Cyan Aura', cmd: 'Change color to cyan', icon: '💠' },
              { label: 'Neon Green', cmd: 'Change color to green', icon: '💚' },
              { label: 'Tell Joke', cmd: 'Tell me a funny joke', icon: '🎭' },
              { label: 'Motivate', cmd: 'Motivate me', icon: '💡' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleUserMessage(item.cmd)}
                className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-xs font-medium text-slate-200">{item.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">"{item.cmd}"</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 px-6 lg:px-12 py-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>StickMate AI · Autonomous Floating Stick Figure Overlay Widget</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Web Speech Voice API</span>
          <span>·</span>
          <span>Gemini 3.8 Flash</span>
          <span>·</span>
          <span>Picture-in-Picture Support</span>
        </div>
      </footer>

      {/* ================= CUSTOMIZATION & STUDIO MODAL ================= */}
      <CustomizationModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        companion={companion}
        onUpdateState={handleUpdateCompanion}
        onTestVoice={handleTestVoice}
        onRunVoiceCommand={handleUserMessage}
      />
    </div>
  );
}
