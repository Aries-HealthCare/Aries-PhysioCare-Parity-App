"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Star, MapPin, Award, Phone, MessageCircle, ChevronRight,
    Clock, CheckCircle2, Languages, Calendar, Shield, Share2,
    Heart, Info, GraduationCap, Briefcase, ThumbsUp, HeartPulse, LocateFixed
} from 'lucide-react';
import BookAppointmentButton from '@/components/book-appointment-button';
import { TherapistCard } from '@/types/therapist';
import { cn } from '@/lib/utils';

interface TherapistProfileTemplateProps {
    therapist: TherapistCard;
}

export default function TherapistProfileTemplate({ therapist }: TherapistProfileTemplateProps) {
    const whatsappText = `Hi! I want to book a session with ${therapist.name}. Please share available slots.`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-black/95">
            {/* Elegant Header / Hero Section */}
            <div className="relative pt-12 pb-24 md:pt-20 md:pb-32 bg-primary overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/profile/bg.jpg"
                        alt="Profile Background"
                        fill
                        className="object-cover opacity-20 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <nav className="flex items-center gap-2 text-white/60 text-xs mb-8 md:mb-12" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/therapist" className="hover:text-white transition-colors">Our Specialists</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-white font-semibold">{therapist.name}</span>
                    </nav>

                    <div className="grid lg:grid-cols-12 gap-10 items-end">
                        <div className="lg:col-span-8 flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-left">
                            {(() => {
                                const isLogo = !therapist.imageUrl || therapist.imageUrl.includes('aries-emblem') || therapist.imageUrl.includes('BrandLogo') || therapist.imageUrl.includes('default-avatar') || therapist.imageUrl.includes('unsplash') || therapist.imageUrl.includes('placehold');
                                const displayImg = isLogo ? '/images/aries-emblem.png' : therapist.imageUrl;
                                return (
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-tr from-accent to-white/20 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                        <div className={cn("relative w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl", isLogo ? "bg-gradient-to-br from-[#3b0d5c] via-[#1f0730] to-[#0d0214] flex items-center justify-center p-6" : "")}>
                                            <Image
                                                src={displayImg}
                                                alt={therapist.name}
                                                fill
                                                className={cn(isLogo ? "object-contain p-6 drop-shadow-[0_10px_20px_rgba(234,179,8,0.3)]" : "object-cover object-top")}
                                                priority
                                            />
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="space-y-4 md:pb-2">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                                        {therapist.specialization}
                                    </Badge>
                                    {therapist.isVerified && (
                                        <Badge className="bg-accent text-white border-none flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Verified
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                                    {therapist.name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-white/80">
                                    <div className="flex items-center gap-2 font-medium">
                                        <GraduationCap className="w-5 h-5 text-accent" />
                                        {therapist.qualification}
                                    </div>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Briefcase className="w-5 h-5 text-accent" />
                                        {therapist.experience} Experience
                                    </div>
                                    <div className="flex items-center gap-2 font-medium">
                                        <MapPin className="w-5 h-5 text-accent" />
                                        {therapist.city}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col items-center lg:items-end gap-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-fit">
                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-400 text-primary font-black px-3 py-1.5 rounded-lg text-xl flex items-center gap-1">
                                        {therapist.rating} <Star className="w-5 h-5 fill-primary" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-white font-bold text-sm tracking-wide">EXCELLENT</div>
                                        <div className="text-white/60 text-xs uppercase tracking-widest">{therapist.reviewCount} Verified Reviews</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 md:px-6 -mt-12 md:-mt-16 pb-20 relative z-20">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Secondary Navigation (Mobile Sticky) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Profile Navigation Links */}
                        <div className="bg-card rounded-2xl border shadow-sm p-1.5 flex flex-wrap gap-1 sticky top-28 z-30 overflow-x-auto whitespace-nowrap">
                            {['About', 'Services', 'Specialties', 'Locations', 'Education', 'Feedback'].map((label) => (
                                <a
                                    key={label}
                                    href={`#${label.toLowerCase()}`}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-secondary/50 text-muted-foreground hover:text-primary active:bg-primary active:text-white"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>

                        {/* Bio Section */}
                        <section id="about" className="bg-card rounded-3xl border shadow-sm p-8 md:p-10 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Info className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight font-headline">About & Clinical Expertise</h2>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-lg">
                                {therapist.bio || `Dr. ${therapist.name} is a dedicated ${therapist.specialization} specialist with ${therapist.experience} of experience, focusing on patient-centered recovery and evidence-based clinical practices.`}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                {[
                                    { label: 'Status', value: therapist.isAvailable ? 'Available' : 'Busy', icon: Clock, color: 'text-green-500' },
                                    { label: 'Language', value: therapist.languages[0] || 'English', icon: Languages, color: 'text-blue-500' },
                                    { label: 'Reviews', value: `${therapist.reviewCount}+`, icon: ThumbsUp, color: 'text-yellow-500' },
                                    { label: 'Response', value: '< 2 Hours', icon: CheckCircle2, color: 'text-primary' },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            <item.icon className={`w-3 h-3 ${item.color}`} /> {item.label}
                                        </div>
                                        <div className="font-bold text-sm tracking-tight">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Services Grid */}
                        <section id="services" className="bg-card rounded-3xl border shadow-sm p-8 md:p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <HeartPulse className="w-5 h-5 text-accent" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight font-headline">Conditions Treated & Services</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {therapist.services.map((service, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-accent/10 hover:bg-white dark:hover:bg-white/5 transition-all">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span className="font-bold text-[15px]">{service}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Service Areas (Locations) */}
                        <section id="locations" className="bg-card rounded-3xl border shadow-sm p-8 md:p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight font-headline">Areas Covered in {therapist.city}</h2>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium">
                                Dr. {therapist.name} provides doorstep home visit sessions in the following localities:
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {therapist.areas.map((area, i) => (
                                    <div key={i} className="px-4 py-2 rounded-xl bg-secondary/50 border hover:border-primary/30 transition-all font-bold text-sm flex items-center gap-2">
                                        <LocateFixed className="w-3.5 h-3.5 text-primary" />
                                        {area}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education Section */}
                        <section id="education" className="bg-card rounded-3xl border shadow-sm p-8 md:p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight font-headline">Education & Qualifications</h2>
                            </div>
                            <div className="space-y-4">
                                {therapist.education.map((edu, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-secondary/20 border border-transparent">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        <div className="font-bold text-[15px]">{edu}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Feedback / Reviews Section */}
                        <section id="feedback" className="bg-card rounded-3xl border shadow-sm p-8 md:p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-yellow-600" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight font-headline">Patient Feedback</h2>
                            </div>
                            <div className="space-y-6">
                                {therapist.feedback.map((f, i) => (
                                    <div key={i} className="space-y-3 p-6 rounded-2xl bg-secondary/10 border italic relative">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(f.rating)].map((_, i) => (
                                                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">"{f.comment}"</p>
                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold not-italic">
                                                {f.user.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold not-italic">{f.user}</span>
                                            <span className="text-[10px] text-muted-foreground not-italic">• Verified Patient</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right: Booking Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-28 space-y-6">
                            <Card className="rounded-3xl border shadow-xl shadow-primary/5 overflow-hidden glassmorphic">
                                <div className="bg-primary p-6 text-white text-center">
                                    <div className="text-xs font-black uppercase tracking-widest text-accent mb-2">Instant Booking</div>
                                    <div className="text-2xl font-headline font-black">Reserve a Slot</div>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex flex-col gap-4">
                                        <BookAppointmentButton
                                            therapistId={therapist.id}
                                            className="w-full h-14 rounded-2xl text-lg font-black tracking-wide shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all duration-300"
                                        >
                                            Book Home Visit Now
                                        </BookAppointmentButton>

                                        <div className="relative py-2 flex items-center">
                                            <div className="flex-grow border-t border-border"></div>
                                            <span className="flex-shrink mx-4 text-xs font-bold text-muted-foreground uppercase opacity-50">Or</span>
                                            <div className="flex-grow border-t border-border"></div>
                                        </div>

                                        <Button asChild size="lg" variant="outline" className="w-full h-14 rounded-2xl font-black text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/5 transition-all">
                                            <a href={`https://wa.me/918591981880?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                                                <MessageCircle className="w-6 h-6 fill-[#25D366] text-white" /> WhatsApp Specialist
                                            </a>
                                        </Button>

                                        <Button asChild size="lg" variant="ghost" className="w-full h-12 rounded-2xl font-bold text-muted-foreground hover:text-primary transition-all">
                                            <a href="tel:+919136447006" className="flex items-center justify-center gap-2">
                                                <Phone className="w-4 h-4" /> Call Helpdesk
                                            </a>
                                        </Button>
                                    </div>

                                    <div className="pt-4 border-t space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                                <Shield className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Safe & Authentic</p>
                                                <p className="text-[12px] text-muted-foreground leading-snug">All therapists follow strict Aries hygiene & safety protocols.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <Award className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Hospital Grade Care</p>
                                                <p className="text-[12px] text-muted-foreground leading-snug">Clinical excellence at the convenience of your home.</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border shadow-sm p-6 space-y-4">
                                <h3 className="font-headline font-bold flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-primary" /> Share Profile
                                </h3>
                                <p className="text-xs text-muted-foreground">Recommend Dr. {therapist.name} to a friend or family member who needs care.</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 rounded-xl h-10 font-bold" onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({ title: therapist.name, url: shareUrl });
                                        } else {
                                            navigator.clipboard.writeText(shareUrl);
                                        }
                                    }}>
                                        Copy Link
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

