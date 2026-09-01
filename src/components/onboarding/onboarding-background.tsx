'use client';

import React from 'react';
import { MotionValue } from 'framer-motion';

interface OnboardingBackgroundProps {
  progress: MotionValue<number>;
  slideCount: number;
}

// Constellation star positions (normalized 0-1)
const CONSTELLATION_STARS = [
  { x: 12, y: 18 }, { x: 25, y: 8  }, { x: 38, y: 22 }, { x: 52, y: 12 },
  { x: 65, y: 28 }, { x: 78, y: 15 }, { x: 88, y: 35 }, { x: 15, y: 55 },
  { x: 30, y: 45 }, { x: 48, y: 60 }, { x: 62, y: 48 }, { x: 75, y: 62 },
  { x: 90, y: 52 }, { x: 22, y: 75 }, { x: 42, y: 80 }, { x: 58, y: 72 },
  { x: 72, y: 85 }, { x: 85, y: 78 }, { x: 8,  y: 88 }, { x: 95, y: 90 },
];

// Constellation line connections
const CONSTELLATION_LINES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
  [13, 14], [14, 15], [15, 16], [16, 17],
  [2, 8], [4, 10], [11, 16],
];

// Slide nebula colors
const SLIDE_NEBULA: Record<number, { color1: string; color2: string }> = {
  0: { color1: 'rgba(13,148,136,0.22)',  color2: 'rgba(88,28,235,0.18)'  },
  1: { color1: 'rgba(2,132,199,0.22)',   color2: 'rgba(88,28,235,0.18)'  },
  2: { color1: 'rgba(124,58,237,0.25)',  color2: 'rgba(190,24,93,0.16)'  },
  3: { color1: 'rgba(245,158,11,0.2)',   color2: 'rgba(190,24,93,0.18)'  },
};

export function OnboardingBackground({ progress, slideCount }: OnboardingBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base deep space */}
      <div className="absolute inset-0 bg-[#030408]" />

      {/* ── Nebula blobs (CSS) ── */}
      <div className="absolute pointer-events-none" style={{
        width: '80vw', height: '80vw', borderRadius: '50%',
        top: '-15%', left: '-20%',
        background: 'radial-gradient(circle, rgba(88,28,235,0.25) 0%, transparent 65%)',
        filter: 'blur(90px)',
        animation: 'obNebula1 22s ease-in-out infinite alternate',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: '65vw', height: '65vw', borderRadius: '50%',
        bottom: '-10%', right: '-15%',
        background: 'radial-gradient(circle, rgba(190,24,93,0.2) 0%, transparent 65%)',
        filter: 'blur(100px)',
        animation: 'obNebula2 28s ease-in-out infinite alternate',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: '50vw', height: '50vw', borderRadius: '50%',
        top: '35%', right: '10%',
        background: 'radial-gradient(circle, rgba(67,20,180,0.18) 0%, transparent 65%)',
        filter: 'blur(80px)',
        animation: 'obNebula3 34s ease-in-out infinite alternate',
      }} />

      {/* ── CSS Star Field ── */}
      {/* Small distant stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={`sm-${i}`}
          className="absolute rounded-full pointer-events-none bg-white"
          style={{
            width: 1, height: 1,
            left: `${(i * 1.7) % 100}%`,
            top:  `${(i * 2.3 + 7) % 100}%`,
            opacity: 0.4 + (i % 5) * 0.1,
            animation: `starTwinkle ${3 + (i % 5)}s ease-in-out ${(i * 0.3) % 3}s infinite`,
          }}
        />
      ))}
      {/* Medium stars */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={`md-${i}`}
          className="absolute rounded-full pointer-events-none bg-white"
          style={{
            width: 1.5, height: 1.5,
            left: `${(i * 4.1 + 2) % 100}%`,
            top:  `${(i * 3.7 + 5) % 100}%`,
            opacity: 0.55 + (i % 4) * 0.1,
            boxShadow: `0 0 3px 1px rgba(255,255,255,0.4)`,
            animation: `starTwinkle ${4 + (i % 4)}s ease-in-out ${(i * 0.5) % 4}s infinite`,
          }}
        />
      ))}
      {/* Large bright stars */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={`lg-${i}`}
          className="absolute rounded-full pointer-events-none bg-white"
          style={{
            width: 2.5, height: 2.5,
            left: `${(i * 9.7 + 5) % 100}%`,
            top:  `${(i * 8.3 + 10) % 100}%`,
            opacity: 0.75,
            boxShadow: `0 0 6px 2px rgba(255,255,255,0.5)`,
            animation: `starTwinkle ${5 + (i % 3)}s ease-in-out ${i * 0.6}s infinite`,
          }}
        />
      ))}

      {/* ── Constellation SVG ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.35 }}
      >
        {/* Connection lines */}
        {CONSTELLATION_LINES.map(([a, b], i) => {
          const s = CONSTELLATION_STARS[a];
          const e = CONSTELLATION_STARS[b];
          const len = Math.sqrt(Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)) * 12;
          return (
            <line
              key={i}
              x1={`${s.x}%`} y1={`${s.y}%`}
              x2={`${e.x}%`} y2={`${e.y}%`}
              stroke="rgba(200,180,255,0.5)"
              strokeWidth="0.5"
              strokeDasharray={len}
              strokeDashoffset={len}
              style={{
                animation: `drawLine 2s ease-out ${0.1 + i * 0.08}s forwards`,
              }}
            />
          );
        })}
        {/* Star nodes */}
        {CONSTELLATION_STARS.map((star, i) => (
          <circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.2}
            fill="rgba(220,210,255,0.8)"
            style={{
              filter: 'drop-shadow(0 0 3px rgba(180,160,255,0.8))',
              animation: `starNodePulse ${4 + (i % 3)}s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </svg>

      {/* ── CSS Shooting star ── */}
      <div className="absolute pointer-events-none" style={{
        width: 100, height: 1,
        top: '15%', left: '-15%',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.9), transparent)',
        borderRadius: 1,
        animation: 'obShoot 8s ease-in 3s infinite',
        transform: 'rotate(-15deg)',
      }} />

      {/* Edge gradient fades */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#030408] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#030408] to-transparent pointer-events-none" />

      <style>{`
        @keyframes obNebula1 {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(5vw,-4vh) scale(1.12); }
          100% { transform: translate(-4vw,6vh) scale(0.94); }
        }
        @keyframes obNebula2 {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(-7vw,5vh) scale(1.08); }
          100% { transform: translate(4vw,-6vh) scale(1.04); }
        }
        @keyframes obNebula3 {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(4vw,-7vh) scale(1.15); }
          100% { transform: translate(-5vw,4vh) scale(0.92); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
        @keyframes starNodePulse {
          0%, 100% { opacity: 0.6; r: 1.2; }
          50%       { opacity: 1;   r: 1.8; }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes obShoot {
          0%   { transform: translateX(0) rotate(-15deg); opacity: 0; }
          4%   { opacity: 0.9; }
          22%  { transform: translateX(130vw) rotate(-15deg); opacity: 0; }
          100% { transform: translateX(130vw) rotate(-15deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
