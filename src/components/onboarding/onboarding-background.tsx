'use client';

import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface OnboardingBackgroundProps {
  progress: MotionValue<number>;
  slideCount: number;
}

const AURORA_SLIDE_COLORS = [
  { primary: '#0d9488', secondary: '#7c3aed', accent: '#059669' }, // 0: Teal & Violet
  { primary: '#0284c7', secondary: '#7c3aed', accent: '#38bdf8' }, // 1: Sky & Violet
  { primary: '#7c3aed', secondary: '#ec4899', accent: '#8b5cf6' }, // 2: Violet & Pink
  { primary: '#f59e0b', secondary: '#0d9488', accent: '#fbbf24' }, // 3: Amber & Teal
];

export function OnboardingBackground({ progress, slideCount }: OnboardingBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base deep dark background */}
      <div className="absolute inset-0 bg-[#030712]" />

      {/* Grid Pattern Overlay for Depth */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Aurora Gradient Blobs (CSS @keyframes) ── */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '100vw',
          height: '100vw',
          top: '-20%',
          left: '-25%',
          background: 'radial-gradient(circle, rgba(13,148,136,0.32) 0%, transparent 65%)',
          filter: 'blur(90px)',
          animation: 'obAurora1 20s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '85vw',
          height: '85vw',
          top: '25%',
          right: '-20%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 65%)',
          filter: 'blur(95px)',
          animation: 'obAurora2 25s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '70vw',
          height: '70vw',
          bottom: '-15%',
          left: '15%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.25) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'obAurora3 30s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '60vw',
          height: '60vw',
          top: '40%',
          left: '30%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)',
          filter: 'blur(85px)',
          animation: 'obAurora4 22s ease-in-out infinite alternate',
        }}
      />

      {/* ── Floating Micro-Particles ── */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            left: `${(i * 5.2 + 3) % 100}%`,
            top: `${(i * 4.9 + 8) % 100}%`,
            background: ['#0d9488', '#7c3aed', '#059669', '#f59e0b', '#0284c7'][i % 5],
            opacity: 0.35 + (i % 4) * 0.12,
            filter: 'blur(0.8px)',
            animation: `obFloat${(i % 4) + 1} ${7 + (i % 6)}s ease-in-out ${i * 0.35}s infinite`,
          }}
        />
      ))}

      {/* Edge Fades */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#030712] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />

      <style>{`
        @keyframes obAurora1 {
          0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
          50%  { transform: translate(6vw, -5vh) scale(1.15) rotate(6deg); }
          100% { transform: translate(-4vw, 7vh) scale(0.92) rotate(-5deg); }
        }
        @keyframes obAurora2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-7vw, 6vh) scale(1.12); }
          100% { transform: translate(5vw, -6vh) scale(1.05); }
        }
        @keyframes obAurora3 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(4vw, -8vh) scale(1.18); }
          100% { transform: translate(-6vw, 4vh) scale(0.9); }
        }
        @keyframes obAurora4 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-5vw, -4vh) scale(1.1); }
          100% { transform: translate(7vw, 6vh) scale(0.95); }
        }
        @keyframes obFloat1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes obFloat2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(16px) translateX(-12px); }
        }
        @keyframes obFloat3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(-24px) translateX(-8px); }
        }
        @keyframes obFloat4 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(18px) translateX(14px); }
        }
      `}</style>
    </div>
  );
}
