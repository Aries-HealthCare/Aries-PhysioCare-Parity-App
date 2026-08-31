'use client';

import React from 'react';
import Image from 'next/image';

interface DynamicAppLogoProps {
  size?: number;
  className?: string;
  onBuddyTap?: () => void;
  showText?: boolean;
}

export function DynamicAppLogo({
  size = 44,
  className = '',
  onBuddyTap,
  showText = false,
}: DynamicAppLogoProps) {
  return (
    <div
      onClick={onBuddyTap}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      <div
        className="relative rounded-full p-[1.5px] transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        {/* Pulsing ambient glow matching Flutter dynamic_app_logo.dart */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-accent to-primary opacity-60 blur-[6px] animate-pulse pointer-events-none"
        />

        {/* Circular glass bezel */}
        <div className="relative w-full h-full rounded-full bg-card/90 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-sm">
          <Image
            src="/images/Arieslogo.png"
            alt="Aries PhysioCare"
            width={size}
            height={size}
            className="w-full h-full object-contain p-1 rounded-full"
            priority
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-outfit font-extrabold text-base sm:text-lg tracking-tight text-foreground">
            Aries<span className="text-primary font-black">Xpert</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            PhysioCare Network
          </span>
        </div>
      )}
    </div>
  );
}
