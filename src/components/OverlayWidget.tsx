import React, { useState, useRef, useEffect } from 'react';
import {
  CompanionState,
  MoodType,
  ActionType,
  StickAppearance,
  PersonalityTraits,
} from '../types/companion';
import { StickFigure } from './StickFigure';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ExternalLink,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  Smile,
  Zap,
  RotateCcw,
  Sliders,
  Move,
} from 'lucide-react';
import { computeLevel } from '../utils/personalityEngine';

interface OverlayWidgetProps {
  companion: CompanionState;
  onUpdateState: (updates: Partial<CompanionState>) => void;
  onUserMessage: (msg: string) => void;
  onOpenCustomizer: () => void;
  onActionTrigger: (action: ActionType, mood?: MoodType) => void;
  isExternalWindow?: boolean;
}

export const OverlayWidget: React.FC<OverlayWidgetProps> = ({
  companion,
  onUpdateState,
  onUserMessage,
  onOpenCustomizer,
  onActionTrigger,
  isExternalWindow = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPos: { x: number; y: number } } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      setPipSupported(true);
    }
  }, []);

  const { level, progress } = computeLevel(companion.traits.experience);

  // Mouse drag handlers for floating overlay
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExternalWindow) return;
    // Don't drag if clicking buttons, inputs, or interactive controls
    if ((e.target as HTMLElement).closest('button, input, textarea, a, .no-drag')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPos: { ...companion.overlayPosition },
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;
      onUpdateState({
        overlayPosition: {
          x: Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.startPos.x + dx)),
          y: Math.max(10, Math.min(window.innerHeight - 380, dragStartRef.current.startPos.y + dy)),
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleLaunchPiP = async () => {
    try {
      if ('documentPictureInPicture' in window) {
        // Chromium Document Picture-in-Picture: True floating window on screen
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 360,
          height: 520,
        });

        // Copy styles
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = pipWindow.document.createElement('style');
            style.textContent = cssRules;
            pipWindow.document.head.appendChild(style);
          } catch (e) {
            const link = pipWindow.document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media;
            link.href = (styleSheet as any).href;
            pipWindow.document.head.appendChild(link);
          }
        });

        // Set body styling
        pipWindow.document.body.className =
          'bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 m-0 overflow-hidden';
        pipWindow.document.title = `${companion.name} - Floating AI Companion`;

        // Create container and notify state
        const container = pipWindow.document.createElement('div');
        container.id = 'pip-root';
        pipWindow.document.body.appendChild(container);

        onUpdateState({ isFloatingOverlay: true });

        pipWindow.addEventListener('pagehide', () => {
          onUpdateState({ isFloatingOverlay: false });
        });
      } else {
        // Fallback popup window
        const popup = window.open(
          `${window.location.origin}${window.location.pathname}?overlay=detached`,
          'StickMateOverlay',
          'width=360,height=520,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
        );
        if (popup) {
          onUpdateState({ isFloatingOverlay: true });
        }
      }
    } catch (err) {
      console.error('Failed to open overlay window:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onUserMessage(inputText);
    setInputText('');
  };

  // If minimized to floating desk buddy badge
  if (isMinimized) {
    return (
      <div
        style={{
          left: isExternalWindow ? '16px' : `${companion.overlayPosition.x}px`,
          top: isExternalWindow ? '16px' : `${companion.overlayPosition.y}px`,
          position: isExternalWindow ? 'relative' : 'fixed',
          zIndex: 9999,
        }}
        className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2 rounded-2xl shadow-2xl cursor-pointer hover:border-slate-500 transition-all select-none"
        onClick={() => setIsMinimized(false)}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{
            backgroundColor: `${companion.appearance.color}22`,
            color: companion.appearance.color,
            border: `1.5px solid ${companion.appearance.color}`,
          }}
        >
          {companion.name.charAt(0)}
        </div>
        <div className="flex flex-col pr-2">
          <span className="text-xs font-semibold text-slate-200">{companion.name}</span>
          <span className="text-[10px] text-slate-400 capitalize">{companion.mood} · Lvl {level}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
          title="Expand"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        left: isExternalWindow ? '0px' : `${companion.overlayPosition.x}px`,
        top: isExternalWindow ? '0px' : `${companion.overlayPosition.y}px`,
        position: isExternalWindow ? 'relative' : 'fixed',
        zIndex: 9999,
      }}
      className={`w-72 sm:w-80 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-shadow duration-200 select-none ${
        isDragging ? 'shadow-cyan-500/20 ring-2 ring-cyan-500/50 cursor-grabbing' : 'shadow-black/70'
      }`}
    >
      {/* --- WIDGET TOP TITLEBAR (DRAGGABLE) --- */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-100">{companion.name}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded text-slate-300 font-mono"
              style={{ backgroundColor: `${companion.appearance.color}25` }}
            >
              Lvl {level}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 no-drag">
          {/* Customizer trigger */}
          <button
            onClick={onOpenCustomizer}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Appearance & Personality Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => onUpdateState({ soundEnabled: !companion.soundEnabled })}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title={companion.soundEnabled ? 'Mute Speech' : 'Unmute Speech'}
          >
            {companion.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Detach / Picture-in-Picture Floating Window */}
          {!isExternalWindow && (
            <button
              onClick={handleLaunchPiP}
              className="p-1 text-slate-400 hover:text-sky-300 rounded-md hover:bg-slate-800 transition-colors"
              title="Pop out into True Floating Desktop Overlay Window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Minimize */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* --- SPEECH THOUGHT BUBBLE --- */}
      <div className="p-3 pb-1 flex flex-col items-center">
        <div className="relative w-full max-w-[270px] bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 shadow-md">
          <p className="text-xs text-slate-200 leading-relaxed font-medium break-words">
            {companion.speechText || "Hi! I'm your floating stick companion. Talk to me or try voice commands!"}
          </p>

          {/* Speech bubble pointer arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-slate-800" />
        </div>
      </div>

      {/* --- STICK FIGURE BODY CANVAS --- */}
      <div className="flex flex-col items-center justify-center py-1 relative">
        <StickFigure
          appearance={companion.appearance}
          mood={companion.mood}
          action={companion.action}
          isSpeaking={companion.isSpeaking}
          isListening={companion.isListening}
          isDragging={isDragging}
          onInteract={() => {
            // Poke the stick figure!
            onActionTrigger('flip', 'surprised');
          }}
        />

        {/* Mood & Archetype indicator badge */}
        <div className="flex items-center gap-2 mt-[-10px] z-10 text-[11px] text-slate-400">
          <span className="capitalize text-slate-300 font-medium">{companion.mood}</span>
          <span>·</span>
          <span className="truncate max-w-[130px]">{companion.traits.archetype}</span>
        </div>
      </div>

      {/* --- QUICK ACTION CONTROLS / VOICE MIC BAR --- */}
      <div className="p-3 pt-1 border-t border-slate-800/80 bg-slate-950/60 flex flex-col gap-2 no-drag">
        {/* Quick action buttons row */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 scrollbar-none text-xs">
          <button
            onClick={() => onActionTrigger('dance', 'dancing')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>💃</span> Dance
          </button>
          <button
            onClick={() => onActionTrigger('flip', 'flipping')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>🤸</span> Flip
          </button>
          <button
            onClick={() => onActionTrigger('wave', 'happy')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>👋</span> Wave
          </button>
          <button
            onClick={() => onActionTrigger('sit', 'zen')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>🧘</span> Sit
          </button>
          <button
            onClick={() => onActionTrigger('sleep', 'sleeping')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>💤</span> Sleep
          </button>
        </div>

        {/* Input & Voice Command Row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          {/* Voice Microphone Toggle Button */}
          <button
            type="button"
            onClick={() => onUpdateState({ isListening: !companion.isListening })}
            className={`p-2 rounded-xl border transition-all ${
              companion.isListening
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title={companion.isListening ? 'Stop Voice Listening' : 'Start Voice Command Listening'}
          >
            {companion.isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Text input prompt */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={companion.isListening ? 'Listening for speech...' : 'Type or speak a command...'}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all pr-7"
            />
            {inputText.trim() && (
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-300 p-0.5"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Subtle XP progress bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: companion.appearance.color,
            }}
          />
        </div>
      </div>
    </div>
  );
};
