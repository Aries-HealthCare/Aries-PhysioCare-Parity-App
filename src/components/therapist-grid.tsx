'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Star,
    MapPin,
    Award,
    ChevronRight,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    ArrowRight,
    Activity,
    Stethoscope,
    HeartPulse,
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BookAppointmentButton from '@/components/book-appointment-button';
import { type TherapistCard as TherapistCardData } from '@/hooks/use-therapists';
import { useTherapists } from '@/hooks/use-therapists';
import { cn } from '@/lib/utils';

interface TherapistCardProps {
    therapist: TherapistCardData;
    compact?: boolean;
    onBook?: (therapist: TherapistCardData) => void;
    isBooking?: boolean;
}

function formatExperience(exp: any): string {
    if (typeof exp === 'number' && exp > 0) return `${exp}+ Yrs`;
    if (typeof exp === 'string') {
        const trimmed = exp.trim();
        if (trimmed && !trimmed.startsWith('0') && !trimmed.toLowerCase().includes('0 year')) {
            return trimmed.replace('Years', 'Yrs').replace('Year', 'Yr');
        }
    }
    return '6+ Yrs';
}

function getSpecialtyIcon(spec: string = '') {
    const s = spec.toLowerCase();
    if (s.includes('neuro') || s.includes('stroke')) return Activity;
    if (s.includes('ortho') || s.includes('spine') || s.includes('musculo')) return Stethoscope;
    if (s.includes('sport')) return Award;
    return HeartPulse;
}

export function TherapistCard({ therapist, compact, onBook, isBooking }: TherapistCardProps) {
    const t = therapist;
    const profileHref = `/therapist/${t.slug || t.id}`;

    const isLogo =
        !t.imageUrl ||
        t.imageUrl.includes('aries-emblem') ||
        t.imageUrl.includes('BrandLogo') ||
        t.imageUrl.includes('default-avatar') ||
        t.imageUrl.includes('unsplash') ||
        t.imageUrl.includes('placehold') ||
        t.imageUrl.includes('673752dcb05308c0ae620a24') ||
        t.imageUrl.toLowerCase().includes('wallpaper') ||
        t.imageUrl.toLowerCase().includes('screenshot');

    const displayImg = isLogo ? '/images/aries-emblem.png' : t.imageUrl;
    const experienceText = formatExperience(t.experience);
    const SpecIcon = getSpecialtyIcon(t.specialization);

    if (compact) {
        return (
            <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-3 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/40">
                <div className="relative w-16 h-20 rounded-xl overflow-hidden ring-1 ring-primary/20 shrink-0 bg-secondary/30 flex items-center justify-center">
                    <Image
                        src={displayImg}
                        alt={`Passport portrait of ${t.name}`}
                        fill
                        className={cn(isLogo ? "object-contain p-2" : "object-cover object-top")}
                    />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-headline font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {t.name}
                    </h4>
                    <p className="text-[11px] text-primary font-semibold truncate">{t.qualification}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{experienceText}</span>
                        <span>•</span>
                        <span>{t.city}</span>
                    </div>
                </div>
                <div className="shrink-0">
                    <Button asChild size="sm" className="h-8 text-xs font-bold rounded-lg">
                        <Link href={profileHref}>View</Link>
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="group relative h-full flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/20 dark:border-white/10 bg-gradient-to-b from-card via-card/95 to-card/90 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-950/95 backdrop-blur-2xl shadow-xl transition-all duration-500 hover:-translate-y-2.5 hover:border-primary/50 hover:shadow-[0_25px_60px_-15px_rgba(0,122,255,0.25)]">
            {/* Top ambient radial glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-gradient-to-br from-primary/20 via-blue-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* ── Top Header Strip: Verification & Rating ── */}
            <div className="p-4 pb-2 flex items-center justify-between z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/25 text-primary text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span>Clinical Directorate</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 shadow-sm">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-black">{t.rating || 4.9}</span>
                    <span className="text-[9px] text-muted-foreground font-medium hidden sm:inline">(100+)</span>
                </div>
            </div>

            {/* ── Passport-Sized Portrait Display ── */}
            <div className="px-4 pt-2 pb-2 flex flex-col items-center relative z-10">
                <Link href={profileHref} className="relative block group/avatar cursor-pointer" prefetch={false}>
                    {/* Passport Credential Frame */}
                    <div className="relative w-32 h-40 sm:w-36 sm:h-44 p-[3px] rounded-2xl bg-gradient-to-br from-primary/50 via-accent/30 to-primary/20 shadow-2xl ring-1 ring-white/20 transition-all duration-500 group-hover:ring-primary/60 group-hover:shadow-primary/20 flex items-center justify-center">
                        <div className="relative w-full h-full rounded-[13px] overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center">
                            <Image
                                src={displayImg}
                                alt={`Passport portrait of ${t.name}`}
                                fill
                                sizes="(max-width: 768px) 144px, 160px"
                                className={cn(
                                    isLogo
                                        ? "object-contain p-6 group-hover:scale-110 drop-shadow-[0_10px_20px_rgba(234,179,8,0.3)]"
                                        : "object-cover object-top group-hover:scale-105",
                                    "transition-transform duration-700 ease-out"
                                )}
                                loading="lazy"
                            />

                            {!isLogo && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                            )}

                            {/* Verified Shield Badge on Bottom-Right */}
                            <div className="absolute bottom-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-background">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Availability Status Ribbon */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Available for Home Visits</span>
                </div>
            </div>

            {/* ── Doctor & Clinical Details ── */}
            <CardContent className="px-5 py-2 flex-grow space-y-2.5 text-center relative z-10">
                <div>
                    <Link href={profileHref} prefetch={false}>
                        <h3 className="font-headline text-lg sm:text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                            {t.name}
                        </h3>
                    </Link>
                    <p className="text-xs font-bold text-primary/90 mt-0.5 tracking-wide">
                        {t.qualification || 'BPT, MPT'}
                    </p>
                </div>

                {/* Specialization Badge */}
                <div className="flex justify-center">
                    <Badge
                        variant="secondary"
                        className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-secondary/80 text-foreground border border-border/60 rounded-full flex items-center gap-1.5 shadow-sm"
                    >
                        <SpecIcon className="w-3 h-3 text-primary" />
                        <span>{t.specialization || 'Physiotherapy Specialist'}</span>
                    </Badge>
                </div>

                {/* Credentials Metric Micro-Grid */}
                <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-secondary/30">
                        <Award className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>{experienceText} Exp</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-secondary/30">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[90px]">{t.city || 'Mumbai'}</span>
                    </div>
                </div>
            </CardContent>

            {/* ── Action Buttons Footer ── */}
            <CardFooter className="p-4 pt-1 flex flex-col gap-2 relative z-10">
                {onBook ? (
                    <Button
                        size="sm"
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 active:scale-[0.98]"
                        onClick={() => onBook(t)}
                        disabled={isBooking}
                    >
                        {isBooking ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Booking…</> : 'Instant Booking'}
                    </Button>
                ) : (
                    <BookAppointmentButton
                        therapistId={t.id}
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 active:scale-[0.98]"
                    >
                        Instant Booking
                    </BookAppointmentButton>
                )}

                <Link
                    href={profileHref}
                    className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 py-0.5"
                    prefetch={false}
                >
                    <span>View Full Clinical Profile</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform" />
                </Link>
            </CardFooter>
        </Card>
    );
}

// ─── Grid with live fetch ──────────────────────────────────────────────────────

interface TherapistGridProps {
    city?: string;
    state?: string;
    area?: string;
    specialization?: string;
    limit?: number;
    title?: string;
    subtitle?: string;
    compact?: boolean;
    fallback?: TherapistCardData[];
}

export default function TherapistGrid({
    city,
    state,
    area,
    specialization,
    limit = 6,
    title,
    subtitle,
    compact = false,
    fallback,
}: TherapistGridProps) {
    const { therapists: liveTherapists, isLoading } = useTherapists({
        city,
        state,
        area,
        specialization,
        limit,
    });

    const displayList = (liveTherapists && liveTherapists.length > 0)
        ? liveTherapists
        : (fallback ?? []);

    if (displayList.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className="space-y-8">
            {(title || subtitle) && (
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    {title && <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>}
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            )}

            {isLoading && displayList.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: limit }).map((_, i) => (
                        <div key={i} className="h-96 rounded-[28px] bg-secondary/30 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className={cn(
                    'grid gap-6',
                    compact
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                )}>
                    {displayList.map(t => (
                        <TherapistCard key={t.id || t.slug} therapist={t} compact={compact} />
                    ))}
                </div>
            )}
        </div>
    );
}
