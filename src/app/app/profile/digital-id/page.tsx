'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Copy,
  MapPin,
  Printer,
  RotateCw,
  Share2,
  ShieldCheck,
  Stethoscope,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DynamicAppLogo } from '@/components/ui/dynamic-app-logo';
import { useProviderAuth } from '@/services/provider-auth-context';
import { resolveProfileImage } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { buildDigitalIdPattern } from '@/lib/wave2-helpers';

export default function DigitalIdPage() {
  const { user, dutyStatus } = useProviderAuth();
  const { toast } = useToast();
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const name =
    user?.fullName ||
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Verified Clinician';
  const photo = resolveProfileImage(user?.profilePhoto || user?.profileImageUrl || user?.profileImage);
  const axId = user?.axId || user?.ariesId || user?.therapistId || 'AX-PENDING';
  const role = user?.professionalInfo?.professionalRole || user?.designation || 'Physiotherapist';
  const qualification = user?.professionalInfo?.qualification || user?.qualification || 'BPT / MPT';
  const license = user?.licenseNumber || 'Verification on file';
  const city = user?.city || user?.areaOfServiceInfo?.city || 'India';
  const isVerified =
    user?.isVerified === true ||
    ['approved', 'active'].includes(String(user?.status || user?.onboardingStatus || '').toLowerCase());
  const memberSince = user?.memberSince || user?.createdAt;
  const memberYear = memberSince ? new Date(memberSince).getFullYear() : new Date().getFullYear();
  const validUntil = `12 / ${Number.isFinite(memberYear) ? memberYear + 2 : new Date().getFullYear() + 2}`;

  const qrMatrix = useMemo(() => buildDigitalIdPattern(`${axId}:${user?._id || ''}`), [axId, user?._id]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(axId);
      setCopied(true);
      toast({ title: 'Aries ID copied', description: `${axId} copied to clipboard.` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy unavailable', description: 'Please copy your ID manually.', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    const shareText = `${name} (${role}) — Verified AriesXpert Clinician ID: ${axId} · License: ${license}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'AriesXpert Digital Credential', text: shareText });
        return;
      } catch {
        /* fallback to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      toast({ title: 'Credential details copied', description: 'Ready to share with patients or clinics.' });
    } catch {
      toast({ title: 'Unable to share', description: shareText });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 8,
      y: (x / (rect.width / 2)) * 8,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Digital Clinician ID</h1>
              <p className="text-xs text-muted-foreground">
                Official AriesXpert doorstep identification card for patient verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFlipped((v) => !v)}
            className="h-10 rounded-2xl text-xs font-bold gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{flipped ? 'Show Front' : 'Show QR Back'}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-10 rounded-2xl text-xs font-bold gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleShare}
            className="h-10 rounded-2xl text-xs font-bold gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Credential Card */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            onClick={() => setFlipped((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlipped((v) => !v);
              }
            }}
            aria-label={flipped ? 'Show front of Digital ID card' : 'Show verification QR code on back of card'}
            className="w-full max-w-md cursor-pointer select-none transition-transform duration-200"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            {!flipped ? (
              <div className="rounded-[2rem] border-2 border-primary/35 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
                <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-teal-400/20 blur-3xl" />
                <div className="flex items-center justify-between relative z-10">
                  <DynamicAppLogo size={32} showText />
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {isVerified ? 'Verified Partner' : 'Under Verification'}
                  </span>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-teal-400/50 shadow-lg shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-500/25 border-2 border-teal-400/50 flex items-center justify-center text-3xl font-outfit font-black text-teal-200 shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-teal-300">
                      Clinical Specialist
                    </p>
                    <h2 className="font-outfit text-xl sm:text-2xl font-black truncate">{name}</h2>
                    <p className="text-xs text-slate-300 truncate">{role}</p>
                    <p className="text-[11px] text-teal-200/90 font-medium truncate">{qualification}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/15 text-xs relative z-10">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Aries ID</p>
                    <p className="font-mono font-bold text-teal-300 mt-0.5 truncate">{axId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Council License</p>
                    <p className="font-mono font-bold text-white mt-0.5 truncate">{license}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Territory</p>
                    <p className="font-bold text-white mt-0.5 truncate">{city}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Valid Until</p>
                    <p className="font-mono font-bold text-white mt-0.5">{validUntil}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-slate-300 relative z-10">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${dutyStatus ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}
                    />
                    {dutyStatus ? 'Active On Duty' : 'Off Duty'}
                  </span>
                  <span className="text-teal-300 font-semibold">Tap card to flip for QR →</span>
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border-2 border-primary/35 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-6 sm:p-7 shadow-2xl space-y-5 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-teal-300">
                    Credential Verification
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{axId}</span>
                </div>

                <div className="mx-auto w-48 h-48 bg-white rounded-2xl p-3 shadow-inner flex items-center justify-center">
                  <svg
                    viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                    className="w-full h-full"
                    role="img"
                    aria-label={`Verification pattern for ${axId}`}
                  >
                    {qrMatrix.map((row, r) =>
                      row.map((cell, c) =>
                        cell ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" /> : null
                      )
                    )}
                  </svg>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-outfit font-bold">{name}</p>
                  <p className="text-[11px] text-slate-300">
                    Present this card at patient doorsteps for real-time AriesXpert clinician verification.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 text-[11px] text-teal-300 font-semibold">
                  Tap card to flip back to front
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Credential Metadata & Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-outfit font-extrabold flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" />
              <span>Credential Summary</span>
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                <dt className="text-muted-foreground">Aries ID</dt>
                <dd className="flex items-center gap-1.5 font-mono font-bold">
                  <span>{axId}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded-lg hover:bg-muted text-primary"
                    aria-label="Copy Aries ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                <dt className="text-muted-foreground">Specialization</dt>
                <dd className="font-bold text-right">{user?.specialization || role}</dd>
              </div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                <dt className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> City
                </dt>
                <dd className="font-bold">{city}</dd>
              </div>
              {user?.phone && (
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                  <dt className="text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Registered Mobile
                  </dt>
                  <dd className="font-mono font-bold">{user.phone}</dd>
                </div>
              )}
              {user?.email && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </dt>
                  <dd className="font-medium truncate max-w-[200px]">{user.email}</dd>
                </div>
              )}
            </dl>

            <div className="pt-2 flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full rounded-2xl text-xs font-bold h-10">
                <Link href="/app/profile/edit">Update Portrait or Credentials</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full rounded-2xl text-xs font-bold h-9">
                <Link href="/app/documents">View Uploaded KYC Documents</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
