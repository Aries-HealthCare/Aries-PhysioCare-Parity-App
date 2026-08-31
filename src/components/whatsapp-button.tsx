'use client';

import Link from "next/link";
import { MessageCircle } from "lucide-react";

// Official WhatsApp Front Desk: +91 8591981880
const WHATSAPP_NUMBER = "918591981880";
const WHATSAPP_MESSAGE = "Hi! I want to book a physiotherapy session with Aries PhysioCare.";

export default function WhatsAppButton() {
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

    return (
        <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="whatsapp-floating-button"
            aria-label="Chat with us on WhatsApp"
            className="hidden md:flex fixed bottom-8 right-6 z-50 items-center gap-2 group"
        >
            {/* Tooltip text - shows on hover on desktop */}
            <span className="hidden md:flex items-center bg-[#128C7E] text-white text-sm font-semibold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg whitespace-nowrap">
                Chat on WhatsApp
            </span>

            {/* Main button */}
            <div className="relative w-14 h-14 rounded-full bg-[#25D366] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 hover:shadow-[#25D366]/50 hover:shadow-xl">
                {/* Pulse animation */}
                <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
                <MessageCircle className="w-7 h-7 text-white fill-white relative z-10" />
            </div>
        </Link>
    );
}
