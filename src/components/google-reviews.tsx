'use client';

import { Star, CheckCircle, Quote, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { getGoogleReviews, type GmbReview } from '@/lib/gmb-api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface GoogleReviewsProps {
  locationName: string;
  className?: string;
}

export default function GoogleReviews({ locationName, className }: GoogleReviewsProps) {
  const [reviews, setReviews] = useState<GmbReview[]>([]);
  // 'loading' | 'unavailable' | 'ready'
  // The widget renders nothing at all in the 'unavailable' state instead of a
  // visible "temporarily unavailable" message — see P1-08. Real GMB OAuth
  // credentials are still required from the business owner to ever reach 'ready'.
  const [status, setStatus] = useState<'loading' | 'unavailable' | 'ready'>('loading');

  useEffect(() => {
    let cancelled = false;
    getGoogleReviews('local-hub')
      .then((data) => {
        if (cancelled) return;
        if (data.length > 0) {
          setReviews(data);
          setStatus('ready');
        } else {
          setStatus('unavailable');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fail silently: no live GMB integration is configured yet, so instead of a
  // permanently visible "temporarily unavailable" banner on every page, the
  // entire section is simply omitted until real reviews are available.
  if (status !== 'ready' || reviews.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-12 md:py-16 relative overflow-hidden bg-background", className)}>
      {/* Atmospheric Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.02)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Centered Clinical Staging */}
        <div className="max-w-4xl mx-auto text-center mb-12 space-y-6 animate-reveal-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            <Award className="w-3 h-3" /> Patient Testimonials
          </div>
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            What Patients Say in <span className="text-primary">{locationName}</span>
          </h2>
        </div>

        {reviews.length > 0 && <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review, index) => (
              <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                <div className={cn(
                  "h-full p-2 animate-reveal-up fill-mode-both",
                  index % 3 === 0 && "stagger-1",
                  index % 3 === 1 && "stagger-2",
                  index % 3 === 2 && "stagger-3"
                )}>
                  <Card className="group glassmorphic border-primary/5 hover:neon-primary-border healthcare-motion transform hover:-translate-y-1.5 flex flex-col shadow-sm relative overflow-hidden h-full rounded-[2.5rem]">
                    {/* Atmospheric Liquid Glow Effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    
                    <Quote className="absolute top-6 right-8 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors duration-700 pointer-events-none" />
                    
                    <CardHeader className="flex flex-row items-center gap-4 p-8 pb-4 relative z-10">
                      <div className="relative group/avatar">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000 opacity-0 group-hover:opacity-100" />
                        <Avatar className="w-14 h-14 border-2 border-primary/10 group-hover:border-primary/30 transition-all duration-500 relative z-10">
                          <AvatarImage src={review.profilePhotoUrl} className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          <AvatarFallback className="bg-primary/5 text-primary font-black">{review.reviewerName[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm tracking-tight text-foreground">{review.reviewerName}</h4>
                        <div className="flex text-yellow-500">
                          {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                        </div>
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] block">{review.createTime}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-10 pt-2 flex-grow relative z-10">
                      <p className="text-sm md:text-base text-muted-foreground italic leading-relaxed font-medium">
                        "{review.comment}"
                      </p>
                      {review.isVerified && (
                        <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified Clinical Experience
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <div className="flex justify-center gap-4 mt-12 animate-reveal-up stagger-4">
            <CarouselPrevious className="relative left-0 top-0 translate-y-0 h-12 w-12 rounded-xl glassmorphic border-primary/10 hover:bg-primary hover:text-white transition-all duration-500 shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </CarouselPrevious>
            <CarouselNext className="relative right-0 top-0 translate-y-0 h-12 w-12 rounded-xl glassmorphic border-primary/10 hover:bg-primary hover:text-white transition-all duration-500 shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </CarouselNext>
          </div>
        </Carousel>}

        <div className="mt-16 text-center animate-reveal-up stagger-4 opacity-0 [animation-fill-mode:forwards]">
          <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.4em]">
            Clinical Network Review Registry (2026)
          </p>
          <div className="h-px w-20 bg-primary/10 mx-auto mt-4" />
        </div>
      </div>
    </section>
  );
}
