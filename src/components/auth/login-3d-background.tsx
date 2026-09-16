'use client';

export function Login3DBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  );
}
