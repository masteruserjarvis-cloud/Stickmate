import React, { useState } from 'react';
import {
  CompanionState,
  StickAppearance,
  PersonalityTraits,
  HatType,
  GlassesType,
  WearableType,
  HandheldType,
  HeadStyle,
  ActionType,
} from '../types/companion';
import {
  COLOR_PRESETS,
  computeArchetype,
  computeLevel,
} from '../utils/personalityEngine';
import {
  X,
  Palette,
  Brain,
  Volume2,
  Mic,
  Sparkles,
  Award,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companion: CompanionState;
  onUpdateState: (updates: Partial<CompanionState>) => void;
  onTestVoice: () => void;
  onRunVoiceCommand: (cmd: string) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  companion,
  onUpdateState,
  onTestVoice,
  onRunVoiceCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'personality' | 'voice' | 'commands'>('appearance');

  if (!isOpen) return null;

  const { appearance, traits } = companion;
  const { level, progress, nextLevelXp } = computeLevel(traits.experience);

  const updateAppearance = (updates: Partial<StickAppearance>) => {
    onUpdateState({
      appearance: {
        ...appearance,
        ...updates,
      },
    });
  };

  const updateTrait = (key: keyof PersonalityTraits, value: number) => {
    const updatedTraits = {
      ...traits,
      [key]: value,
    };
    updatedTraits.archetype = computeArchetype(updatedTraits);
    onUpdateState({ traits: updatedTraits });
  };

  const HATS: { id: HatType; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '∅' },
    { id: 'cap', label: 'Baseball Cap', icon: '🧢' },
    { id: 'tophat', label: 'Top Hat', icon: '🎩' },
    { id: 'wizard', label: 'Wizard Hat', icon: '🧙' },
    { id: 'catears', label: 'Cat Ears', icon: '🐱' },
    { id: 'crown', label: 'Royal Crown', icon: '👑' },
    { id: 'halo', label: 'Angel Halo', icon: '😇' },
    { id: 'beanie', label: 'Cozy Beanie', icon: '🧶' },
  ];

  const GLASSES: { id: GlassesType; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '∅' },
    { id: 'shades', label: 'Cool Shades', icon: '🕶️' },
    { id: 'nerd', label: 'Nerd Glasses', icon: '👓' },
    { id: 'vr', label: 'Cyber VR Visor', icon: '🥽' },
    { id: 'monocle', label: 'Monocle', icon: '🧐' },
  ];

  const WEARABLES: { id: WearableType; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '∅' },
    { id: 'cape', label: 'Hero Cape', icon: '🦸' },
    { id: 'bowtie', label: 'Red Bowtie', icon: '🎀' },
    { id: 'scarf', label: 'Winter Scarf', icon: '🧣' },
    { id: 'wings', label: 'Soaring Wings', icon: '🪽' },
    { id: 'headphones', label: 'Headphones', icon: '🎧' },
  ];

  const HANDHELDS: { id: HandheldType; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '∅' },
    { id: 'wand', label: 'Magic Wand', icon: '🪄' },
    { id: 'coffee', label: 'Coffee Mug', icon: '☕' },
    { id: 'sword', label: 'Energy Blade', icon: '⚔️' },
    { id: 'balloon', label: 'Red Balloon', icon: '🎈' },
    { id: 'pencil', label: 'Creator Pencil', icon: '✏️' },
  ];

  const SAMPLE_VOICE_COMMANDS = [
    { phrase: 'Dance for me', desc: 'Triggers dynamic disco dance keyframe' },
    { phrase: 'Do a backflip', desc: 'Performs 360° acrobatic spin' },
    { phrase: 'Wave hello', desc: 'Greets you with animated waving hand' },
    { phrase: 'Sit down and relax', desc: 'Sits comfortably on the screen ledge' },
    { phrase: 'Take a nap', desc: 'Power downs stick limbs with Zzz particles' },
    { phrase: 'Patrol my screen', desc: 'Starts walking stride across the workspace' },
    { phrase: 'Put on a wizard hat', desc: 'Equips magic sorcerer hat' },
    { phrase: 'Put on sunglasses', desc: 'Wears pixel cool shades' },
    { phrase: 'Change color to neon green', desc: 'Swaps stick glow to matrix green' },
    { phrase: 'Tell me a funny joke', desc: 'Gemini crafts in-character witty humor' },
    { phrase: 'Motivate me today', desc: 'Gemini gives an uplifting stick quote' },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-inner"
              style={{
                backgroundColor: `${appearance.color}22`,
                border: `1.5px solid ${appearance.color}`,
              }}
            >
              ✨
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>{companion.name} Studio</span>
                <span className="text-xs font-normal text-slate-400">· Level {level} {traits.archetype}</span>
              </h2>
              <p className="text-xs text-slate-400">Customize appearance, audio voice, and tune evolving personality traits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'appearance'
                ? 'border-sky-400 text-sky-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('personality')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'personality'
                ? 'border-sky-400 text-sky-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            Personality Evolution
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'voice'
                ? 'border-sky-400 text-sky-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Voice & Audio
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'commands'
                ? 'border-sky-400 text-sky-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            Voice Commands
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= TAB 1: APPEARANCE ================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Companion Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Companion Name</label>
                <input
                  type="text"
                  value={companion.name}
                  onChange={(e) => onUpdateState({ name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Color Themes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Color Aura & Glow</label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() =>
                        updateAppearance({
                          color: preset.hex,
                          glowColor: preset.glow,
                        })
                      }
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                        appearance.color === preset.hex
                          ? 'border-white ring-2 ring-white/20 bg-slate-800'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{
                          backgroundColor: preset.hex,
                          boxShadow: `0 0 8px ${preset.hex}`,
                        }}
                      />
                      <span className="text-slate-300">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke & Glow Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>Line Thickness</span>
                    <span>{appearance.strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    step="0.5"
                    value={appearance.strokeWidth}
                    onChange={(e) => updateAppearance({ strokeWidth: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>Figure Size Scale</span>
                    <span>{appearance.scale}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={appearance.scale}
                    onChange={(e) => updateAppearance({ scale: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400"
                  />
                </div>
              </div>

              {/* Headwear Hats */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Headwear & Hats</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HATS.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => updateAppearance({ hat: h.id })}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                        appearance.hat === h.id
                          ? 'border-sky-400 bg-sky-500/10 text-sky-300'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base">{h.icon}</span>
                      <span className="truncate">{h.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Eyewear */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Eyewear</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GLASSES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => updateAppearance({ glasses: g.id })}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                        appearance.glasses === g.id
                          ? 'border-sky-400 bg-sky-500/10 text-sky-300'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base">{g.icon}</span>
                      <span className="truncate">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wearables & Outfits */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Outfits & Back Wearables</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WEARABLES.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => updateAppearance({ wearable: w.id })}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                        appearance.wearable === w.id
                          ? 'border-sky-400 bg-sky-500/10 text-sky-300'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base">{w.icon}</span>
                      <span className="truncate">{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Handheld items */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Handheld Items</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HANDHELDS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateAppearance({ handheld: item.id })}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                        appearance.handheld === item.id
                          ? 'border-sky-400 bg-sky-500/10 text-sky-300'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: PERSONALITY EVOLUTION ================= */}
          {activeTab === 'personality' && (
            <div className="space-y-6">
              {/* Level & Archetype Banner */}
              <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xl font-bold text-sky-300">
                    {level}
                  </div>
                  <div>
                    <div className="text-xs text-sky-400 font-medium">Evolution Level {level}</div>
                    <div className="text-base font-bold text-slate-100">{traits.archetype}</div>
                    <div className="text-xs text-slate-400">Total Interactions: {traits.totalInteractions}</div>
                  </div>
                </div>

                <div className="w-full sm:w-48 flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>XP Progress</span>
                    <span>{traits.experience} / {nextLevelXp} XP</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-indigo-400 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Trait Calibration Sliders */}
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
                  Core Personality Axes (Evolving Through Interactions)
                </h3>
                <div className="space-y-3 bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                  {/* Curiosity */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-sky-300 font-medium">🧠 Curiosity & Inquisitiveness</span>
                      <span className="text-slate-400 font-mono">{traits.curiosity}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={traits.curiosity}
                      onChange={(e) => updateTrait('curiosity', parseInt(e.target.value))}
                      className="w-full accent-sky-400"
                    />
                  </div>

                  {/* Wit */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-amber-300 font-medium">🎭 Wit & Humor</span>
                      <span className="text-slate-400 font-mono">{traits.wit}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={traits.wit}
                      onChange={(e) => updateTrait('wit', parseInt(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  {/* Zen */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-300 font-medium">🍃 Zen & Calm</span>
                      <span className="text-slate-400 font-mono">{traits.zen}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={traits.zen}
                      onChange={(e) => updateTrait('zen', parseInt(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  {/* Mischief */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-rose-300 font-medium">⚡ Mischief & Spunk</span>
                      <span className="text-slate-400 font-mono">{traits.mischief}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={traits.mischief}
                      onChange={(e) => updateTrait('mischief', parseInt(e.target.value))}
                      className="w-full accent-rose-400"
                    />
                  </div>

                  {/* Loyalty */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-indigo-300 font-medium">❤️ Loyalty & Friendship</span>
                      <span className="text-slate-400 font-mono">{traits.loyalty}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={traits.loyalty}
                      onChange={(e) => updateTrait('loyalty', parseInt(e.target.value))}
                      className="w-full accent-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* Evolution Event History Log */}
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Recent Evolution Milestones
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {traits.evolutionHistory.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3 text-center">No evolution events recorded yet.</div>
                  ) : (
                    traits.evolutionHistory.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{ev.title}</div>
                          <div className="text-slate-400 text-[11px]">{ev.trigger}</div>
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 font-mono text-[11px] whitespace-nowrap">
                          {ev.deltaDesc}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: VOICE & AUDIO ================= */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Sound Enabled */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                <div>
                  <div className="text-xs font-medium text-slate-200">Text-to-Speech Vocalization</div>
                  <div className="text-[11px] text-slate-400">Speak out responses aloud with synchronous mouth movement</div>
                </div>
                <button
                  onClick={() => onUpdateState({ soundEnabled: !companion.soundEnabled })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    companion.soundEnabled
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {companion.soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              {/* Voice Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>Voice Pitch</span>
                    <span>{companion.voicePitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.05"
                    value={companion.voicePitch}
                    onChange={(e) => onUpdateState({ voicePitch: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400"
                  />
                  <span className="text-[10px] text-slate-500">Higher pitch makes the stick figure sound cuter / animated.</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>Speaking Speed</span>
                    <span>{companion.voiceRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.05"
                    value={companion.voiceRate}
                    onChange={(e) => onUpdateState({ voiceRate: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400"
                  />
                  <span className="text-[10px] text-slate-500">Pacing for speech bubble delivery.</span>
                </div>
              </div>

              {/* Test Voice Button */}
              <div>
                <button
                  onClick={onTestVoice}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  Test Voice Preview
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 4: VOICE COMMANDS CHEAT SHEET ================= */}
          {activeTab === 'commands' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                You can speak any of these commands into your microphone, or click <span className="text-sky-400 font-semibold">Try</span> to simulate running it instantly:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {SAMPLE_VOICE_COMMANDS.map((cmd) => (
                  <div
                    key={cmd.phrase}
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">"{cmd.phrase}"</div>
                      <div className="text-[11px] text-slate-400">{cmd.desc}</div>
                    </div>
                    <button
                      onClick={() => {
                        onRunVoiceCommand(cmd.phrase);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium transition-colors"
                    >
                      Try
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
