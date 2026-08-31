"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Award, MapPin, ChevronRight, Shield, CheckCircle2 } from 'lucide-react';
import { useTherapists } from '@/hooks/use-therapists';
import BookAppointmentButton from '@/components/book-appointment-button';
import { Skeleton } from '@/components/ui/skeleton';

interface TherapistCarouselProps {
    title?: string;
    description?: string;
    specialization?: string;
    state?: string;
    city?: string;
    area?: string;
    limit?: number;
    className?: string;
}

export default function TherapistCarousel({
    title,
    description,
    specialization,
    state,
    city,
    area,
    limit = 10,
    className = ""
}: TherapistCarouselProps) {
    const { therapists, isLoading } = useTherapists({
        specialization,
        state,
        city,
        area,
        limit,
    });

    if (isLoading) {
        return (
            <div className={`container mx-auto px-4 py-12 ${className}`}>
                <div className="flex flex-col gap-4 mb-8">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-[400px] w-full rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!therapists || therapists.length === 0) {
        return null;
    }

    return (
        <section className={`py-12 md:py-20 bg-background ${className}`}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-3">
                        {title && <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>}
                        {description && <p className="text-muted-foreground text-lg max-w-2xl">{description}</p>}
                    </div>
                    {(title || description) && (
                        <Link href="/therapist" className="text-primary font-bold flex items-center gap-1 group hover:gap-2 transition-all">
                            View All Specialists <ChevronRight className="w-5 h-5" />
                        </Link>
                    )}
                </div>

                <div className="relative group px-12">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {therapists.map((t) => (
                                <CarouselItem key={t.id || t.slug} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-6">
                                    <Card className="overflow-hidden group/card hover:shadow-2xl transition-all duration-500 border-border/40 glassmorphic h-full flex flex-col">
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            <Image
                                                src={t.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                                                alt={t.name}
                                                fill
                                                className="object-cover group-hover/card:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                {t.isAvailable && (
                                                    <Badge className="bg-green-500/90 text-white backdrop-blur-sm border-0 font-bold text-[10px] py-0 px-2 uppercase tracking-tighter">
                                                        Available
                                                    </Badge>
                                                )}
                                                {t.isVerified && (
                                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white text-[11px] font-bold">
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                <span>{t.rating || 4.8}</span>
                                                <span className="opacity-60 font-medium">({t.reviewCount || 40}+)</span>
                                            </div>
                                        </div>
                                        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                            <div>
                                                <h3 className="text-lg font-bold group-hover/card:text-primary transition-colors line-clamp-1">{t.name}</h3>
                                                <p className="text-xs font-bold text-primary/80 mb-1 line-clamp-1">{t.qualification}</p>
                                                <p className="text-xs text-muted-foreground font-medium line-clamp-1">{t.specialization}</p>
                                            </div>

                                            <div className="space-y-2 text-[13px] text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Award className="w-3.5 h-3.5 text-primary" /> {t.experience}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-primary" /> {t.city}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2 mt-auto">
                                                <Link href={`/therapist/${t.slug}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full font-bold text-xs h-9">
                                                        Profile
                                                    </Button>
                                                </Link>
                                                <BookAppointmentButton size="sm" className="flex-1 font-bold text-xs h-9">
                                                    Book
                                                </BookAppointmentButton>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute -left-4 top-1/2 h-10 w-10 border-2 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100" />
                        <CarouselNext className="absolute -right-4 top-1/2 h-10 w-10 border-2 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
