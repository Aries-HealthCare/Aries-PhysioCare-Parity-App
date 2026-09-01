import React from 'react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background Aurora Glow */}
      <div
        className="absolute w-[80vw] max-w-[500px] h-[80vw] max-h-[500px] rounded-full pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(13,148,136,0.4) 0%, rgba(124,58,237,0.2) 45%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulseGlow 2.5s ease-in-out infinite alternate',
        }}
      />

      {/* Center Spinner & Logo */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Animated Spinner Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/40">
            <span className="text-slate-950 font-black text-sm">A</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-extrabold text-white tracking-tight">
            Aries <span className="text-teal-400">Xpert</span>
          </p>
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
            Loading Specialist Portal...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.3; }
          100% { transform: scale(1.15); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}
