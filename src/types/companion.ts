export type HeadStyle = 'classic' | 'hollow' | 'robot' | 'cute' | 'anime';
export type HatType = 'none' | 'tophat' | 'cap' | 'wizard' | 'catears' | 'halo' | 'crown' | 'beanie';
export type GlassesType = 'none' | 'nerd' | 'shades' | 'vr' | 'monocle';
export type WearableType = 'none' | 'cape' | 'bowtie' | 'scarf' | 'wings' | 'headphones';
export type HandheldType = 'none' | 'wand' | 'coffee' | 'sword' | 'balloon' | 'pencil';

export interface StickAppearance {
  color: string;
  strokeWidth: number;
  glow: boolean;
  glowColor?: string;
  headStyle: HeadStyle;
  hat: HatType;
  glasses: GlassesType;
  wearable: WearableType;
  handheld: HandheldType;
  scale: number;
}

export type MoodType =
  | 'happy'
  | 'talking'
  | 'thinking'
  | 'curious'
  | 'playful'
  | 'zen'
  | 'sassy'
  | 'sleeping'
  | 'dancing'
  | 'flipping'
  | 'surprised';

export type ActionType =
  | 'idle'
  | 'dance'
  | 'flip'
  | 'sit'
  | 'wave'
  | 'sleep'
  | 'walk'
  | 'float';

export interface EvolutionEvent {
  id: string;
  timestamp: number;
  title: string;
  deltaDesc: string;
  trigger: string;
  trait: 'curiosity' | 'wit' | 'zen' | 'mischief' | 'loyalty';
}

export interface PersonalityTraits {
  curiosity: number; // 0 - 100
  wit: number;       // 0 - 100
  zen: number;       // 0 - 100
  mischief: number;  // 0 - 100
  loyalty: number;   // 0 - 100
  level: number;     // 1 - 10
  experience: number;// XP towards next level
  archetype: string;
  totalInteractions: number;
  voiceCommandsRun: number;
  evolutionHistory: EvolutionEvent[];
}

export interface CompanionState {
  name: string;
  appearance: StickAppearance;
  traits: PersonalityTraits;
  mood: MoodType;
  action: ActionType;
  speechText: string;
  isSpeaking: boolean;
  isListening: boolean;
  lastUserQuery: string;
  soundEnabled: boolean;
  voicePitch: number;
  voiceRate: number;
  voiceName: string;
  wakeWordEnabled: boolean;
  isFloatingOverlay: boolean;
  overlayPosition: { x: number; y: number };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'companion' | 'system';
  text: string;
  timestamp: number;
  mood?: MoodType;
  action?: ActionType;
}
