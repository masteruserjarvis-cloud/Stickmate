import React, { useState } from 'react';
import {
  Code,
  FileText,
  Music,
  Compass,
  Monitor,
  Terminal,
  Folder,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DesktopSimulatorProps {
  onTriggerAction: (action: any, mood: any) => void;
  companionName: string;
}

export const DesktopSimulator: React.FC<DesktopSimulatorProps> = ({
  onTriggerAction,
  companionName,
}) => {
  const [activeWindow, setActiveWindow] = useState<'editor' | 'notes' | 'music' | 'browser'>('editor');
  const [wallpaper, setWallpaper] = useState<'midnight' | 'aurora' | 'cyber' | 'graph'>('aurora');

  const wallpapers = {
    midnight: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950',
    aurora: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950',
    cyber: 'bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950',
    graph: 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950',
  };

  return (
    <div className={`relative w-full h-[640px] rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col ${wallpapers[wallpaper]}`}>
      {/* Desktop Top Bar (Mock OS Status Bar) */}
      <div className="h-8 px-4 bg-slate-950/70 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Virtual Screen Workspace</span>
          </div>
          <span className="text-slate-600">·</span>
          <span>Floating Overlay Active</span>
        </div>

        {/* Wallpaper Picker */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Backdrop:</span>
          {(['aurora', 'midnight', 'cyber', 'graph'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWallpaper(w)}
              className={`px-2 py-0.5 rounded text-[10px] capitalize transition-colors ${
                wallpaper === w ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Body with Simulated Windows */}
      <div className="flex-1 p-6 relative overflow-hidden flex flex-col md:flex-row gap-6">
        {/* Main Workspace Window */}
        <div className="flex-1 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl flex flex-col overflow-hidden max-w-2xl">
          {/* Window Header */}
          <div className="h-9 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">workspace_companion.tsx</span>
            </div>

            {/* Window Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveWindow('editor')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeWindow === 'editor' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Code Editor
              </button>
              <button
                onClick={() => setActiveWindow('notes')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeWindow === 'notes' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Daily Notes
              </button>
              <button
                onClick={() => setActiveWindow('music')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeWindow === 'music' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Focus Music
              </button>
            </div>
          </div>

          {/* Window Content */}
          <div className="flex-1 p-5 font-mono text-xs overflow-y-auto leading-relaxed">
            {activeWindow === 'editor' && (
              <div className="space-y-2 text-slate-300">
                <div className="text-slate-500">// Autonomous stick figure AI overlay companion</div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-sky-300">companion</span> = <span className="text-yellow-300">new</span> <span className="text-emerald-400">StickCompanion</span>&#40;&#123;
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">name:</span> <span className="text-emerald-300">"{companionName}"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">body:</span> <span className="text-emerald-300">"stick_figure_skeletal"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">overlayMode:</span> <span className="text-amber-300">true</span>, <span className="text-slate-500">// Floats freely above your workflow</span>
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">voiceRecognition:</span> <span className="text-amber-300">true</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">personalityEvolution:</span> <span className="text-purple-300">"adaptive_gemini"</span>
                </div>
                <div>&#125;&#41;;</div>
                <div className="pt-2 text-slate-500">// Drag {companionName} over code lines or say "dance" to celebrate bugfixes!</div>
                <div>
                  <span className="text-sky-400">await</span> companion.<span className="text-yellow-400">listenForVoiceCommands</span>&#40;&#41;;
                </div>
              </div>
            )}

            {activeWindow === 'notes' && (
              <div className="space-y-3 font-sans text-xs text-slate-300">
                <h4 className="text-sm font-semibold text-slate-100">Productivity & Sprint Checklist</h4>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded accent-sky-500" />
                    <span className="line-through text-slate-500">Deploy floating stick figure assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded accent-sky-500" />
                    <span className="line-through text-slate-500">Calibrate voice commands & Web Speech synthesis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded accent-sky-500" />
                    <span>Ask {companionName} for inspiration or a witty joke</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded accent-sky-500" />
                    <span>Watch traits evolve toward Zen or Sassy prankster</span>
                  </div>
                </div>
              </div>
            )}

            {activeWindow === 'music' && (
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">
                    🎧
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100 text-sm">Lofi Beats for Deep Coding</div>
                    <div className="text-slate-400 text-xs">Chillhop Studio · 24/7 Stream</div>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Tip: Speak to {companionName} saying "Dance" while music plays to trigger a synchronized stick figure groove!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Desktop Widget: Activity Radar */}
        <div className="hidden lg:flex flex-col gap-4 w-72">
          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-xl">
            <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Floating Widget Capabilities
            </div>
            <ul className="text-[11px] text-slate-400 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong className="text-slate-200">System Overlay:</strong> Click the detach icon to float in a real OS-level window over any desktop app.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong className="text-slate-200">Voice Control:</strong> Say "dance", "flip", "wave", "wear top hat", or "change color to green".</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong className="text-slate-200">Evolving Persona:</strong> Wit, curiosity, and zen dynamically shift through your conversations.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop Taskbar */}
      <div className="h-10 px-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer">
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
            <span>Desktop</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-500 text-[11px]">
            <span>Click & drag {companionName} anywhere on screen</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono">100% Online · Voice Ready</span>
        </div>
      </div>
    </div>
  );
};
