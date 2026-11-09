import React, { useEffect, useState, useRef } from 'react';
import {
  StickAppearance,
  MoodType,
  ActionType,
} from '../types/companion';

interface StickFigureProps {
  appearance: StickAppearance;
  mood: MoodType;
  action: ActionType;
  isSpeaking: boolean;
  isListening: boolean;
  onInteract?: () => void;
  className?: string;
  isDragging?: boolean;
}

export const StickFigure: React.FC<StickFigureProps> = ({
  appearance,
  mood,
  action,
  isSpeaking,
  isListening,
  onInteract,
  className = '',
  isDragging = false,
}) => {
  const [animTime, setAnimTime] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation frame loop for smooth procedural motion
  useEffect(() => {
    let frameId: number;
    let start = performance.now();

    const loop = (now: number) => {
      setAnimTime((now - start) / 1000);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Subtle eye tracking towards mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 3;
      const dx = (e.clientX - centerX) / (window.innerWidth || 1);
      const dy = (e.clientY - centerY) / (window.innerHeight || 1);
      setEyeOffset({
        x: Math.max(-3, Math.min(3, dx * 6)),
        y: Math.max(-2.5, Math.min(2.5, dy * 5)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const {
    color = '#38bdf8',
    strokeWidth = 3.5,
    glow = true,
    glowColor = '#38bdf888',
    hat = 'cap',
    glasses = 'none',
    wearable = 'cape',
    handheld = 'none',
    scale = 1.0,
  } = appearance;

  // Procedural kinematics offsets
  const t = animTime;

  // Breathing sway
  const breathe = Math.sin(t * 2.8) * 2;
  const bob = action === 'float' ? Math.sin(t * 3.5) * 8 : Math.sin(t * 2.5) * 1.5;

  // Action states calculations
  let rotBody = 0;
  let headY = 46 + breathe * 0.4 + bob;
  let neckY = headY + 16;
  let spineBottomY = neckY + 48;
  let hipX = 100;
  let hipY = spineBottomY;

  // Arm angles
  let leftArmShoulderX = 100;
  let leftArmShoulderY = neckY + 4;
  let rightArmShoulderX = 100;
  let rightArmShoulderY = neckY + 4;

  let leftElbowX = 78;
  let leftElbowY = leftArmShoulderY + 22;
  let leftHandX = 64;
  let leftHandY = leftElbowY + 22;

  let rightElbowX = 122;
  let rightElbowY = rightArmShoulderY + 22;
  let rightHandX = 136;
  let rightHandY = rightElbowY + 22;

  // Leg angles
  let leftKneeX = 86;
  let leftKneeY = hipY + 30;
  let leftFootX = 78;
  let leftFootY = leftKneeY + 32;

  let rightKneeX = 114;
  let rightKneeY = hipY + 30;
  let rightFootX = 122;
  let rightFootY = rightKneeY + 32;

  // Actions modifications
  if (action === 'wave') {
    // Right arm waving energetically
    const waveSin = Math.sin(t * 8);
    rightElbowX = 126;
    rightElbowY = rightArmShoulderY - 14;
    rightHandX = 142 + waveSin * 10;
    rightHandY = rightArmShoulderY - 32 + Math.cos(t * 8) * 4;
  } else if (action === 'dance') {
    // Disco pumping dance
    const danceSin = Math.sin(t * 6);
    const danceCos = Math.cos(t * 6);
    rotBody = danceSin * 5;

    leftElbowX = 70 + danceSin * 12;
    leftElbowY = leftArmShoulderY - 10 + danceCos * 8;
    leftHandX = 60 + danceSin * 16;
    leftHandY = leftArmShoulderY - 32;

    rightElbowX = 130 - danceSin * 12;
    rightElbowY = rightArmShoulderY - 10 - danceCos * 8;
    rightHandX = 140 - danceSin * 16;
    rightHandY = rightArmShoulderY - 32;

    leftKneeX = 84 + danceSin * 6;
    leftFootX = 76 + danceSin * 10;
    rightKneeX = 116 - danceSin * 6;
    rightFootX = 124 - danceSin * 10;
  } else if (action === 'sit') {
    // Sitting on ledge/window
    hipY = 120;
    leftKneeX = 76;
    leftKneeY = hipY + 6;
    leftFootX = 76;
    leftFootY = leftKneeY + 34;

    rightKneeX = 124;
    rightKneeY = hipY + 6;
    rightFootX = 124;
    rightFootY = rightKneeY + 34;

    leftElbowX = 82;
    leftElbowY = hipY - 8;
    leftHandX = 84;
    leftHandY = hipY + 4;

    rightElbowX = 118;
    rightElbowY = hipY - 8;
    rightHandX = 116;
    rightHandY = hipY + 4;
  } else if (action === 'sleep') {
    // Head slumped slightly, arms resting
    headY += 6;
    leftElbowX = 88;
    leftElbowY = hipY - 12;
    leftHandX = 96;
    leftHandY = hipY - 4;
    rightElbowX = 112;
    rightElbowY = hipY - 12;
    rightHandX = 104;
    rightHandY = hipY - 4;
  } else if (action === 'walk') {
    // Walking stride
    const walkSin = Math.sin(t * 7);
    leftKneeX = 86 - walkSin * 14;
    leftFootX = 80 - walkSin * 20;
    leftFootY = hipY + 60 - Math.abs(walkSin) * 8;

    rightKneeX = 114 + walkSin * 14;
    rightFootX = 120 + walkSin * 20;
    rightFootY = hipY + 60 - Math.abs(walkSin) * 8;

    // Counter arm swing
    leftHandX = 64 + walkSin * 18;
    rightHandX = 136 - walkSin * 18;
  } else if (action === 'float') {
    // Hovering with dangling legs
    const floatWobble = Math.sin(t * 3);
    leftKneeX = 88 + floatWobble * 4;
    leftFootX = 84 + floatWobble * 8;
    leftFootY = hipY + 54;
    rightKneeX = 112 - floatWobble * 4;
    rightFootX = 116 - floatWobble * 8;
    rightFootY = hipY + 54;

    leftElbowX = 72;
    leftHandX = 58;
    leftHandY = leftArmShoulderY + 8;
    rightElbowX = 128;
    rightHandX = 142;
    rightHandY = rightArmShoulderY + 8;
  } else if (isSpeaking) {
    // Expressive speaking gestures
    const speakSin = Math.sin(t * 6);
    rightElbowX = 122 + speakSin * 6;
    rightHandX = 138 + speakSin * 12;
    rightHandY = rightArmShoulderY + 6 - Math.abs(speakSin) * 14;
  }

  // Backflip rotation logic
  const isFlipping = action === 'flip';

  // Drag physics stretch
  if (isDragging) {
    leftFootY += 12;
    rightFootY += 12;
    leftHandY += 6;
    rightHandY += 6;
  }

  // Mouth animation
  const mouthTalkHeight = isSpeaking ? 3 + Math.abs(Math.sin(t * 12)) * 5 : 0;
  const mouthSmileY = mood === 'sassy' ? 1 : mood === 'happy' || mood === 'dancing' ? 3 : 1;

  return (
    <div
      ref={containerRef}
      onClick={onInteract}
      className={`relative inline-block select-none cursor-pointer group ${className}`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center bottom',
      }}
    >
      {/* Listening Aura Ring */}
      {isListening && (
        <div
          className="absolute inset-0 rounded-full animate-ping pointer-events-none opacity-40"
          style={{
            border: `2px solid ${color}`,
            transform: 'scale(0.85)',
          }}
        />
      )}

      {/* Sleep Zzz Floating Emitters */}
      {(action === 'sleep' || mood === 'sleeping') && (
        <div className="absolute -top-6 right-6 pointer-events-none font-bold text-xs animate-bounce opacity-80" style={{ color }}>
          <span className="inline-block animate-pulse">z</span>
          <span className="inline-block animate-pulse text-sm ml-1" style={{ animationDelay: '0.3s' }}>Z</span>
          <span className="inline-block animate-pulse text-base ml-1" style={{ animationDelay: '0.6s' }}>Z</span>
        </div>
      )}

      {/* Floating Sparkles when Dancing or Excited */}
      {(action === 'dance' || mood === 'curious' || isFlipping) && (
        <div className="absolute -top-3 left-6 pointer-events-none text-xs animate-spin opacity-75" style={{ animationDuration: '4s', color }}>
          ✦
        </div>
      )}

      <svg
        viewBox="0 0 200 240"
        className={`w-48 h-60 overflow-visible transition-transform ${
          isFlipping ? 'animate-[spin_0.75s_cubic-bezier(0.4,0,0.2,1)_infinite]' : ''
        }`}
        style={{
          filter: glow
            ? `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor})`
            : 'none',
        }}
      >
        <defs>
          <linearGradient id="stickCapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="stickBladeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* --- WEARABLE: CAPE (Drawn behind body) --- */}
        {wearable === 'cape' && (
          <path
            d={`M ${100 - 12} ${neckY + 4} Q ${80 - Math.sin(t * 4) * 16} ${neckY + 36} ${
              72 - Math.sin(t * 4) * 22
            } ${hipY + 38} L ${100 + 12} ${neckY + 4} Z`}
            fill="url(#stickCapeGrad)"
            opacity="0.85"
            stroke="#b91c1c"
            strokeWidth="1.5"
          />
        )}

        {/* --- WEARABLE: WINGS (Drawn behind body) --- */}
        {wearable === 'wings' && (
          <g opacity="0.85" stroke={color} strokeWidth="2" fill="none">
            {/* Left Wing */}
            <path
              d={`M 96 ${neckY + 8} Q ${40 - Math.sin(t * 5) * 8} ${neckY - 16} ${
                36 - Math.sin(t * 5) * 6
              } ${neckY + 12} Q 60 ${neckY + 28} 96 ${neckY + 20}`}
              fill={`${color}22`}
            />
            {/* Right Wing */}
            <path
              d={`M 104 ${neckY + 8} Q ${160 + Math.sin(t * 5) * 8} ${neckY - 16} ${
                164 + Math.sin(t * 5) * 6
              } ${neckY + 12} Q 140 ${neckY + 28} 104 ${neckY + 20}`}
              fill={`${color}22`}
            />
          </g>
        )}

        <g transform={`rotate(${rotBody} 100 ${hipY})`}>
          {/* --- LEGS --- */}
          <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Left Leg */}
            <line x1={hipX - 3} y1={hipY} x2={leftKneeX} y2={leftKneeY} />
            <line x1={leftKneeX} y1={leftKneeY} x2={leftFootX} y2={leftFootY} />
            {/* Left Foot hook */}
            <line x1={leftFootX} y1={leftFootY} x2={leftFootX - 7} y2={leftFootY} />

            {/* Right Leg */}
            <line x1={hipX + 3} y1={hipY} x2={rightKneeX} y2={rightKneeY} />
            <line x1={rightKneeX} y1={rightKneeY} x2={rightFootX} y2={rightFootY} />
            {/* Right Foot hook */}
            <line x1={rightFootX} y1={rightFootY} x2={rightFootX + 7} y2={rightFootY} />
          </g>

          {/* --- TORSO & SPINE --- */}
          <line
            x1="100"
            y1={neckY}
            x2={hipX}
            y2={hipY}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* --- WEARABLE: BOWTIE / SCARF --- */}
          {wearable === 'bowtie' && (
            <g transform={`translate(100, ${neckY + 3})`}>
              <polygon points="-8,-4 0,-1 -8,2" fill="#ef4444" />
              <polygon points="8,-4 0,-1 8,2" fill="#ef4444" />
              <circle cx="0" cy="-1" r="2.5" fill="#facc15" />
            </g>
          )}

          {wearable === 'scarf' && (
            <g>
              <ellipse cx="100" cy={neckY + 2} rx="12" ry="5" fill="#f59e0b" />
              <path
                d={`M 104 ${neckY + 4} Q 108 ${neckY + 20} ${108 + Math.sin(t * 3) * 6} ${neckY + 34}`}
                stroke="#f59e0b"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* --- ARMS --- */}
          <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Left Arm */}
            <line x1={leftArmShoulderX - 4} y1={leftArmShoulderY} x2={leftElbowX} y2={leftElbowY} />
            <line x1={leftElbowX} y1={leftElbowY} x2={leftHandX} y2={leftHandY} />

            {/* Right Arm */}
            <line x1={rightArmShoulderX + 4} y1={rightArmShoulderY} x2={rightElbowX} y2={rightElbowY} />
            <line x1={rightElbowX} y1={rightElbowY} x2={rightHandX} y2={rightHandY} />
          </g>

          {/* --- HANDHELD ACCESSORY --- */}
          {handheld === 'wand' && (
            <g transform={`translate(${rightHandX}, ${rightHandY}) rotate(-35)`}>
              <line x1="0" y1="0" x2="0" y2="-24" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
              {/* Star top */}
              <polygon points="0,-30 -3,-24 3,-24" fill="#fbbf24" />
              <circle cx="0" cy="-26" r="3" fill="#fef08a" />
            </g>
          )}

          {handheld === 'coffee' && (
            <g transform={`translate(${rightHandX + 2}, ${rightHandY - 4})`}>
              <rect x="-4" y="-7" width="9" height="11" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
              <path d="M 5 -4 C 7 -4 7 0 5 1" stroke="#475569" strokeWidth="1" fill="none" />
              {/* Steam */}
              <path
                d={`M -1 -9 Q 1 ${-14 + Math.sin(t * 4) * 2} -2 -18`}
                stroke="#cbd5e1"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {handheld === 'sword' && (
            <g transform={`translate(${rightHandX}, ${rightHandY}) rotate(25)`}>
              <line x1="0" y1="0" x2="0" y2="7" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="0" y1="-2" x2="0" y2="-32" stroke="url(#stickBladeGrad)" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}

          {handheld === 'balloon' && (
            <g transform={`translate(${leftHandX}, ${leftHandY})`}>
              <path
                d={`M 0 0 Q ${-4 + Math.sin(t * 3) * 6} -20 0 -40`}
                stroke="#94a3b8"
                strokeWidth="1"
                fill="none"
              />
              <circle cx={Math.sin(t * 3) * 4} cy="-48" r="11" fill="#f43f5e" />
              <polygon points={`-2,-37 2,-37 0,-35`} fill="#f43f5e" />
            </g>
          )}

          {handheld === 'pencil' && (
            <g transform={`translate(${rightHandX}, ${rightHandY}) rotate(45)`}>
              <rect x="-2" y="-22" width="5" height="26" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <polygon points="-2,-22 3,-22 0.5,-28" fill="#fde68a" />
              <polygon points="-0.5,-26 1.5,-26 0.5,-28" fill="#1e293b" />
            </g>
          )}

          {/* --- HEAD --- */}
          <g transform={`translate(100, ${headY})`}>
            {/* Head circle */}
            <circle
              cx="0"
              cy="0"
              r="17"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="#0f172a"
            />

            {/* Eye tracking positions */}
            const eyeLX = -5.5 + eyeOffset.x;
            const eyeRX = 5.5 + eyeOffset.x;
            const eyeY = -1.5 + eyeOffset.y;

            {/* --- EYES --- */}
            {isBlinking ? (
              // Closed blinking eyes
              <g stroke={color} strokeWidth="2" strokeLinecap="round">
                <line x1="-8" y1="-1" x2="-3" y2="-1" />
                <line x1="3" y1="-1" x2="8" y2="-1" />
              </g>
            ) : action === 'sleep' || mood === 'sleeping' ? (
              // Sleeping curved arcs
              <g stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none">
                <path d="M -8 -1 Q -5.5 2 -3 -1" />
                <path d="M 3 -1 Q 5.5 2 8 -1" />
              </g>
            ) : mood === 'happy' || mood === 'dancing' ? (
              // Joyful squinting arcs
              <g stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none">
                <path d="M -8 -0.5 Q -5.5 -3.5 -3 -0.5" />
                <path d="M 3 -0.5 Q 5.5 -3.5 8 -0.5" />
              </g>
            ) : mood === 'curious' || mood === 'surprised' ? (
              // Wide surprised eyes
              <g stroke={color} strokeWidth="1.8" fill={color}>
                <circle cx={-5.5 + eyeOffset.x} cy={-1.5 + eyeOffset.y} r="3" fill="#ffffff" stroke={color} />
                <circle cx={-5.5 + eyeOffset.x} cy={-1.5 + eyeOffset.y} r="1.5" fill={color} />
                <circle cx={5.5 + eyeOffset.x} cy={-1.5 + eyeOffset.y} r="3" fill="#ffffff" stroke={color} />
                <circle cx={5.5 + eyeOffset.x} cy={-1.5 + eyeOffset.y} r="1.5" fill={color} />
              </g>
            ) : mood === 'sassy' ? (
              // One raised eyebrow and wink
              <g stroke={color} strokeWidth="1.8">
                {/* Left eye wink */}
                <line x1="-8" y1="-1" x2="-3" y2="-1" strokeLinecap="round" />
                {/* Right eye open with high eyebrow */}
                <circle cx={5.5 + eyeOffset.x} cy={-1.5 + eyeOffset.y} r="2.2" fill={color} />
                <line x1="3" y1="-5.5" x2="8" y2="-4" strokeLinecap="round" strokeWidth="1.8" />
              </g>
            ) : (
              // Standard intelligent oval pupils
              <g fill={color}>
                <ellipse cx={-5.5 + eyeOffset.x} cy={-1.5 + eyeOffset.y} rx="2" ry="2.6" />
                <ellipse cx={5.5 + eyeOffset.x} cy={-1.5 + eyeOffset.y} rx="2" ry="2.6" />
              </g>
            )}

            {/* --- MOUTH --- */}
            {isSpeaking ? (
              <ellipse
                cx="0"
                cy="6.5"
                rx={3.5 + Math.sin(t * 14) * 1}
                ry={mouthTalkHeight}
                fill={color}
              />
            ) : mood === 'surprised' ? (
              <circle cx="0" cy="6.5" r="3" stroke={color} strokeWidth="1.8" fill="none" />
            ) : mood === 'sassy' ? (
              // Sassy smirk
              <path
                d="M -3 6.5 Q 0 8 5 5.5"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              // Gentle smile
              <path
                d={`M -4.5 5.5 Q 0 ${5.5 + mouthSmileY} 4.5 5.5`}
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* --- EYEWEAR ACCESSORIES --- */}
            {glasses === 'nerd' && (
              <g stroke="#ffffff" strokeWidth="1.5" fill="none">
                <circle cx="-5.5" cy="-1.5" r="4.5" />
                <circle cx="5.5" cy="-1.5" r="4.5" />
                <line x1="-1" y1="-1.5" x2="1" y2="-1.5" />
                <line x1="-10" y1="-1.5" x2="-14" y2="-3" />
                <line x1="10" y1="-1.5" x2="14" y2="-3" />
              </g>
            )}

            {glasses === 'shades' && (
              <g fill="#0f172a" stroke="#ffffff" strokeWidth="1">
                <polygon points="-11,-4 0,-4 -1,2 -9,2" />
                <polygon points="11,-4 0,-4 1,2 9,2" />
                <line x1="-12" y1="-4" x2="-15" y2="-5" stroke="#ffffff" strokeWidth="1.2" />
                <line x1="12" y1="-4" x2="15" y2="-5" stroke="#ffffff" strokeWidth="1.2" />
              </g>
            )}

            {glasses === 'vr' && (
              <g>
                <rect x="-13" y="-5" width="26" height="8" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="-9" y1="-1" x2="9" y2="-1" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}

            {glasses === 'monocle' && (
              <g>
                <circle cx="5.5" cy="-1.5" r="5" stroke="#facc15" strokeWidth="1.5" fill="none" />
                <path d="M 8 2 Q 11 12 10 18" stroke="#facc15" strokeWidth="1" fill="none" />
              </g>
            )}

            {/* --- HEADWEAR ACCESSORIES --- */}
            {hat === 'tophat' && (
              <g transform="translate(0, -17) rotate(-5)">
                <ellipse cx="0" cy="0" rx="19" ry="3.5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <rect x="-11" y="-22" width="22" height="22" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                {/* Hat ribbon */}
                <rect x="-11" y="-6" width="22" height="5" fill="#f43f5e" />
              </g>
            )}

            {hat === 'cap' && (
              <g transform="translate(0, -14) rotate(-4)">
                <path d="M -16 0 C -16 -12 16 -12 16 0 Z" fill="#2563eb" />
                <path d="M -2 0 L 22 2 L 18 -2 Z" fill="#1d4ed8" />
                <circle cx="0" cy="-10" r="1.5" fill="#ffffff" />
              </g>
            )}

            {hat === 'wizard' && (
              <g transform="translate(0, -17) rotate(-4)">
                <ellipse cx="0" cy="1" rx="19" ry="3.5" fill="#4338ca" />
                <polygon points="-13,1 13,1 5,-32" fill="#6366f1" />
                {/* Gold star */}
                <circle cx="3" cy="-15" r="2.5" fill="#fbbf24" />
              </g>
            )}

            {hat === 'catears' && (
              <g transform="translate(0, -15)">
                {/* Left Ear */}
                <polygon points="-15,0 -9,-14 -3,0" fill="#0f172a" stroke={color} strokeWidth="1.5" />
                <polygon points="-13,-1 -9,-10 -5,-1" fill="#f43f5e" />
                {/* Right Ear */}
                <polygon points="3,0 9,-14 15,0" fill="#0f172a" stroke={color} strokeWidth="1.5" />
                <polygon points="5,-1 9,-10 13,-1" fill="#f43f5e" />
              </g>
            )}

            {hat === 'halo' && (
              <g transform={`translate(0, ${-26 + Math.sin(t * 3) * 2})`}>
                <ellipse
                  cx="0"
                  cy="0"
                  rx="15"
                  ry="4.5"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  fill="none"
                  filter="drop-shadow(0 0 6px #fde047)"
                />
              </g>
            )}

            {hat === 'crown' && (
              <g transform="translate(0, -17)">
                <polygon points="-12,0 12,0 12,-11 6,-5 0,-13 -6,-5 -12,-11" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                <circle cx="-12" cy="-11" r="1.5" fill="#ef4444" />
                <circle cx="0" cy="-13" r="1.5" fill="#3b82f6" />
                <circle cx="12" cy="-11" r="1.5" fill="#10b981" />
              </g>
            )}

            {hat === 'beanie' && (
              <g transform="translate(0, -14)">
                <path d="M -15 0 C -15 -14 15 -14 15 0 Z" fill="#e11d48" />
                <rect x="-16" y="-2" width="32" height="6" rx="2" fill="#be123c" />
                <circle cx="0" cy="-14" r="3.5" fill="#fbbf24" />
              </g>
            )}

            {wearable === 'headphones' && (
              <g transform="translate(0, 0)">
                <path d="M -17 0 C -17 -22 17 -22 17 0" stroke="#475569" strokeWidth="3" fill="none" />
                <rect x="-21" y="-5" width="5" height="11" rx="2" fill="#38bdf8" />
                <rect x="16" y="-5" width="5" height="11" rx="2" fill="#38bdf8" />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
