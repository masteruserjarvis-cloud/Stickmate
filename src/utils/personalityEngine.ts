import {
  CompanionState,
  EvolutionEvent,
  PersonalityTraits,
  StickAppearance,
  ActionType,
  MoodType,
} from '../types/companion';

export const DEFAULT_APPEARANCE: StickAppearance = {
  color: '#38bdf8', // Neon Sky Cyan
  strokeWidth: 3.5,
  glow: true,
  glowColor: '#38bdf888',
  headStyle: 'classic',
  hat: 'cap',
  glasses: 'none',
  wearable: 'cape',
  handheld: 'none',
  scale: 1.0,
};

export const DEFAULT_TRAITS: PersonalityTraits = {
  curiosity: 50,
  wit: 55,
  zen: 40,
  mischief: 35,
  loyalty: 30,
  level: 1,
  experience: 25,
  archetype: 'Curious Novice',
  totalInteractions: 1,
  voiceCommandsRun: 0,
  evolutionHistory: [
    {
      id: 'init-1',
      timestamp: Date.now() - 3600000,
      title: 'First Awakening',
      deltaDesc: 'Awakened on your screen with baseline inquisitiveness.',
      trigger: 'Spawned as desktop overlay',
      trait: 'curiosity',
    },
  ],
};

export const COLOR_PRESETS = [
  { name: 'Sky Cyan', hex: '#38bdf8', glow: '#38bdf899' },
  { name: 'Neon Lime', hex: '#4ade80', glow: '#4ade8099' },
  { name: 'Cyber Magenta', hex: '#f43f5e', glow: '#f43f5e99' },
  { name: 'Electric Purple', hex: '#c084fc', glow: '#c084fc99' },
  { name: 'Solar Amber', hex: '#fbbf24', glow: '#fbbf2499' },
  { name: 'Chalk White', hex: '#f8fafc', glow: '#ffffff88' },
  { name: 'Pitch Black', hex: '#1e293b', glow: '#47556944' },
];

export function computeArchetype(traits: PersonalityTraits): string {
  const { curiosity, wit, zen, mischief, loyalty } = traits;

  if (wit >= 70 && mischief >= 65) return 'Sassy Prankster';
  if (curiosity >= 70 && wit >= 60) return 'Eccentric Polymath';
  if (zen >= 70 && loyalty >= 60) return 'Zen Philosopher';
  if (mischief >= 70 && curiosity >= 60) return 'Playful Rogue';
  if (loyalty >= 75) return 'Devoted Guardian';
  if (curiosity >= 75) return 'Deep Explorer';
  if (zen >= 75) return 'Calm Master';
  if (wit >= 75) return 'Quick-Witted Comic';
  if (traits.level >= 5) return 'Evolved Cosmic Companion';
  return 'Curious Companion';
}

export function computeLevel(experience: number): { level: number; progress: number; nextLevelXp: number } {
  // Level curve: Level 1 (0-100), Level 2 (100-250), Level 3 (250-450), Level 4 (450-700), etc.
  const levels = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3500];
  let level = 1;

  for (let i = 1; i < levels.length; i++) {
    if (experience >= levels[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelBase = levels[level - 1] || 0;
  const nextLevelGoal = levels[level] || levels[levels.length - 1] + 1000;
  const range = nextLevelGoal - currentLevelBase;
  const currentInLevel = Math.max(0, experience - currentLevelBase);
  const progress = Math.min(100, Math.round((currentInLevel / range) * 100));

  return { level, progress, nextLevelXp: nextLevelGoal };
}

export function applyEvolution(
  current: PersonalityTraits,
  deltas: Partial<{
    curiosity: number;
    wit: number;
    zen: number;
    mischief: number;
    loyalty: number;
  }>,
  trigger: string,
  reason: string
): PersonalityTraits {
  const clamp = (v: number) => Math.max(5, Math.min(100, Math.round(v)));

  const newCuriosity = clamp(current.curiosity + (deltas.curiosity || 0));
  const newWit = clamp(current.wit + (deltas.wit || 0));
  const newZen = clamp(current.zen + (deltas.zen || 0));
  const newMischief = clamp(current.mischief + (deltas.mischief || 0));
  const newLoyalty = clamp(current.loyalty + (deltas.loyalty || 0));

  // Determine highest changed trait
  let dominantTrait: 'curiosity' | 'wit' | 'zen' | 'mischief' | 'loyalty' = 'loyalty';
  let maxDelta = 0;
  for (const [t, d] of Object.entries(deltas)) {
    if (d && Math.abs(d) > maxDelta) {
      maxDelta = Math.abs(d);
      dominantTrait = t as any;
    }
  }

  const deltaTotal = Object.values(deltas).reduce((sum, v) => sum + Math.abs(v || 0), 0);
  const xpGained = Math.max(15, deltaTotal * 6);
  const newXp = current.experience + xpGained;
  const { level } = computeLevel(newXp);

  const deltaStrParts: string[] = [];
  if (deltas.curiosity) deltaStrParts.push(`Curiosity ${deltas.curiosity > 0 ? '+' : ''}${deltas.curiosity}`);
  if (deltas.wit) deltaStrParts.push(`Wit ${deltas.wit > 0 ? '+' : ''}${deltas.wit}`);
  if (deltas.zen) deltaStrParts.push(`Zen ${deltas.zen > 0 ? '+' : ''}${deltas.zen}`);
  if (deltas.mischief) deltaStrParts.push(`Mischief ${deltas.mischief > 0 ? '+' : ''}${deltas.mischief}`);
  if (deltas.loyalty) deltaStrParts.push(`Loyalty ${deltas.loyalty > 0 ? '+' : ''}${deltas.loyalty}`);

  const newEvent: EvolutionEvent = {
    id: `evo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    title: reason || 'Interaction Evolution',
    deltaDesc: deltaStrParts.join(', ') || '+XP from chat',
    trigger,
    trait: dominantTrait,
  };

  const updatedTraits: PersonalityTraits = {
    ...current,
    curiosity: newCuriosity,
    wit: newWit,
    zen: newZen,
    mischief: newMischief,
    loyalty: newLoyalty,
    experience: newXp,
    level,
    archetype: computeArchetype({
      ...current,
      curiosity: newCuriosity,
      wit: newWit,
      zen: newZen,
      mischief: newMischief,
      loyalty: newLoyalty,
      level,
    }),
    totalInteractions: current.totalInteractions + 1,
    evolutionHistory: [newEvent, ...current.evolutionHistory.slice(0, 19)],
  };

  return updatedTraits;
}

export function parseLocalVoiceCommand(
  text: string
): {
  isCommand: boolean;
  action?: ActionType;
  mood?: MoodType;
  appearanceUpdate?: Partial<StickAppearance>;
  traitDeltas?: Partial<PersonalityTraits>;
  replyText?: string;
  triggerName?: string;
} | null {
  const clean = text.toLowerCase().trim();

  // Dance
  if (clean.includes('dance') || clean.includes('groove') || clean.includes('boogie')) {
    return {
      isCommand: true,
      action: 'dance',
      mood: 'dancing',
      traitDeltas: { wit: 3, mischief: 2 },
      replyText: "Ayy, dropping a beat! Look at these moves!",
      triggerName: "Voice Command: Dance",
    };
  }

  // Flip / Acrobatics
  if (clean.includes('flip') || clean.includes('somersault') || clean.includes('backflip')) {
    return {
      isCommand: true,
      action: 'flip',
      mood: 'flipping',
      traitDeltas: { mischief: 4, wit: 1 },
      replyText: "Hold my coffee, stick acrobatics incoming!",
      triggerName: "Voice Command: Flip",
    };
  }

  // Wave / Hi
  if (
    clean.includes('wave') ||
    clean.includes('hello') ||
    clean.includes('say hi') ||
    clean.startsWith('hi ') ||
    clean === 'hi'
  ) {
    return {
      isCommand: true,
      action: 'wave',
      mood: 'happy',
      traitDeltas: { loyalty: 3, wit: 1 },
      replyText: "Hey there! Always happy to hang out with you on your screen!",
      triggerName: "Voice Command: Wave / Greeting",
    };
  }

  // Sit down / Rest
  if (clean.includes('sit') || clean.includes('chill') || clean.includes('rest') || clean.includes('take a seat')) {
    return {
      isCommand: true,
      action: 'sit',
      mood: 'zen',
      traitDeltas: { zen: 4, loyalty: 2 },
      replyText: "Sitting down right here on your screen border. Deep breath in...",
      triggerName: "Voice Command: Sit & Rest",
    };
  }

  // Sleep / Nap
  if (clean.includes('sleep') || clean.includes('nap') || clean.includes('goodnight') || clean.includes('rest your eyes')) {
    return {
      isCommand: true,
      action: 'sleep',
      mood: 'sleeping',
      traitDeltas: { zen: 5 },
      replyText: "Zzz... powering down my stick limbs for a catnap. Wake me when you need me!",
      triggerName: "Voice Command: Sleep",
    };
  }

  // Walk around
  if (clean.includes('walk') || clean.includes('patrol') || clean.includes('stroll')) {
    return {
      isCommand: true,
      action: 'walk',
      mood: 'playful',
      traitDeltas: { curiosity: 3, mischief: 2 },
      replyText: "Stretching my two-dimensional legs! Patrolling your desktop perimeter.",
      triggerName: "Voice Command: Walk",
    };
  }

  // Float / Hover
  if (clean.includes('float') || clean.includes('fly') || clean.includes('hover')) {
    return {
      isCommand: true,
      action: 'float',
      mood: 'zen',
      traitDeltas: { zen: 3, curiosity: 2 },
      replyText: "Anti-gravity engaged! Floating in free zero-g space.",
      triggerName: "Voice Command: Float",
    };
  }

  // Appearance - Hat commands
  if (clean.includes('wear') || clean.includes('put on') || clean.includes('change hat')) {
    if (clean.includes('top hat')) {
      return {
        isCommand: true,
        action: 'wave',
        mood: 'happy',
        appearanceUpdate: { hat: 'tophat' },
        traitDeltas: { wit: 2 },
        replyText: "Dapper! Nothing matches a stick figure like a classy top hat.",
        triggerName: "Wardrobe: Top Hat",
      };
    }
    if (clean.includes('wizard')) {
      return {
        isCommand: true,
        action: 'wave',
        mood: 'curious',
        appearanceUpdate: { hat: 'wizard' },
        traitDeltas: { curiosity: 3 },
        replyText: "By the ancient magic of code, I am now Gandalf the Stick!",
        triggerName: "Wardrobe: Wizard Hat",
      };
    }
    if (clean.includes('crown')) {
      return {
        isCommand: true,
        action: 'dance',
        mood: 'happy',
        appearanceUpdate: { hat: 'crown' },
        traitDeltas: { mischief: 2, wit: 2 },
        replyText: "All hail the sovereign stick companion of your screen!",
        triggerName: "Wardrobe: Crown",
      };
    }
    if (clean.includes('sunglasses') || clean.includes('shades')) {
      return {
        isCommand: true,
        action: 'wave',
        mood: 'sassy',
        appearanceUpdate: { glasses: 'shades' },
        traitDeltas: { mischief: 3, wit: 2 },
        replyText: "Instant +100 cool factor. Deal with it!",
        triggerName: "Wardrobe: Sunglasses",
      };
    }
    if (clean.includes('cape')) {
      return {
        isCommand: true,
        action: 'float',
        mood: 'proud' as any,
        appearanceUpdate: { wearable: 'cape' },
        traitDeltas: { loyalty: 3 },
        replyText: "Cape billowing in the digital breeze! Ready to save your day.",
        triggerName: "Wardrobe: Cape",
      };
    }
  }

  // Appearance - Color commands
  if (clean.includes('color') || clean.includes('turn into') || clean.includes('make you')) {
    if (clean.includes('cyan') || clean.includes('blue')) {
      return {
        isCommand: true,
        mood: 'happy',
        appearanceUpdate: { color: '#38bdf8', glowColor: '#38bdf899' },
        traitDeltas: { curiosity: 2 },
        replyText: "Swapped to vibrant Sky Cyan! Glowing clean.",
        triggerName: "Appearance: Sky Cyan",
      };
    }
    if (clean.includes('green') || clean.includes('lime')) {
      return {
        isCommand: true,
        mood: 'happy',
        appearanceUpdate: { color: '#4ade80', glowColor: '#4ade8099' },
        traitDeltas: { zen: 2 },
        replyText: "Matrix neon green activated! Pure hacker aesthetic.",
        triggerName: "Appearance: Neon Green",
      };
    }
    if (clean.includes('pink') || clean.includes('magenta') || clean.includes('red')) {
      return {
        isCommand: true,
        mood: 'playful',
        appearanceUpdate: { color: '#f43f5e', glowColor: '#f43f5e99' },
        traitDeltas: { mischief: 2 },
        replyText: "Cyberpunk Magenta locked in! Looking radiant.",
        triggerName: "Appearance: Cyber Magenta",
      };
    }
    if (clean.includes('purple')) {
      return {
        isCommand: true,
        mood: 'curious',
        appearanceUpdate: { color: '#c084fc', glowColor: '#c084fc99' },
        traitDeltas: { curiosity: 2 },
        replyText: "Electric violet glow! Mystical and futuristic.",
        triggerName: "Appearance: Electric Purple",
      };
    }
    if (clean.includes('yellow') || clean.includes('gold')) {
      return {
        isCommand: true,
        mood: 'happy',
        appearanceUpdate: { color: '#fbbf24', glowColor: '#fbbf2499' },
        traitDeltas: { wit: 2 },
        replyText: "Golden solar radiant energy! Brightening up the display.",
        triggerName: "Appearance: Solar Gold",
      };
    }
  }

  return null;
}
