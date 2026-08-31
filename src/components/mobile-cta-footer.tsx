'use client';

import { Button } from '@/components/ui/button';
import { useRequestCallback } from '@/components/request-callback-provider';
import { CalendarPlus, Video } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import BookAppointmentButton from './book-appointment-button';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export default function MobileCtaFooter() {
  const pathname = usePathname();

  const isHidden = useMemo(() => {
    // Hide on booking page and consultation pages to avoid distraction
    if (!pathname) return false;
    return pathname.startsWith('/book-appointment') || pathname.startsWith('/free-tele-consultation/session');
  }, [pathname]);

  if (isHidden) {
    return null;
  }

  const whatsAppNumber = "918591981880"; // Official Aries PhysioCare WhatsApp Desk
  const prefilledMessage = "Hi, I'm looking for home physiotherapy services from Aries PhysioCare. Please share available slots.";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glassmorphic border-t border-t-primary/30 shadow-[0_-4px_16px_rgba(0,128,128,0.1)] rounded-t-2xl p-2 pb-safe-offset-4 bg-background/80">
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-3 gap-2">
          <Button asChild variant="outline" className="flex flex-col h-16 items-center justify-center gap-1 text-xs border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-400">
            <Link href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(prefilledMessage)}`} target="_blank">
              <WhatsAppIcon className="h-5 w-5 mb-1" />
              <span>WhatsApp</span>
            </Link>
          </Button>

          <BookAppointmentButton
            className="flex flex-col h-16 items-center justify-center gap-1 text-xs font-bold neon-accent-border"
          >
            <CalendarPlus className="h-5 w-5 mb-1" />
            <span>Book Home</span>
          </BookAppointmentButton>

          <Button asChild variant="outline" className="flex flex-col h-16 items-center justify-center gap-1 text-xs border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="/free-tele-consultation">
              <Video className="h-5 w-5 mb-1 animate-pulse" />
              <span>Free Consult</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
