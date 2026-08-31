'use client';

import React, { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getLocalizedFaqs } from "@/lib/placeholder-data";
import { GeoPath } from "@/lib/types";
import { ChevronDown, HelpCircle, Sparkles, MessageCircleQuestion, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import SchemaMarkup from "./seo/schema-markup";
import { motion } from "framer-motion";

interface Faq {
  id: string;
  question: string;
  answer: string;
}

interface LocalizedFaqSectionProps {
  geo: GeoPath | null;
  className?: string;
  title?: string;
  description?: string;
  faqs?: Faq[];
}

export default function LocalizedFaqSection({ geo, className, title, description, faqs: propFaqs }: LocalizedFaqSectionProps) {
  const faqs = useMemo(() => propFaqs || getLocalizedFaqs(geo), [geo, propFaqs]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const cityName = geo?.city?.name || 'Mumbai';
  const displayTitle = title || `Frequently Asked Questions`;
  const displayDescription = description || `Clinical insights and answers regarding our in-home physiotherapy protocols and equipment.`;

  return (
    <section className={cn("py-18 md:py-28 lg:py-32 bg-[#02050e] relative overflow-hidden text-white", className)}>
      <SchemaMarkup data={faqSchema} />
      
      {/* ── Precision Telemetry Mesh Grid ── */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.15) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* ── Fluid Widescreen Container (Zero Side Margins) ── */}
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-14 space-y-4 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glassmorphic border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <MessageCircleQuestion className="w-3.5 h-3.5 text-cyan-400" />
            <span>Clinical Knowledge Base</span>
          </div>

          <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] text-white">
            Frequently Asked <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(56,189,248,0.35)]">
              Questions
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto font-light">
            {displayDescription}
          </p>
        </motion.div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="rounded-2xl border border-white/10 px-6 md:px-8 bg-[#070c1a]/95 backdrop-blur-2xl transition-all duration-300 hover:border-cyan-400/40 group overflow-hidden shadow-lg"
              >
                <AccordionTrigger className="font-headline text-left hover:no-underline font-bold text-base sm:text-lg md:text-xl py-6 text-white transition-colors group-data-[state=open]:text-cyan-300 [&>svg]:hidden">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{faq.question}</span>
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-data-[state=open]:bg-cyan-500 group-data-[state=open]:text-slate-950 transition-all duration-300">
                      <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-300 text-sm sm:text-base leading-relaxed pb-6">
                  <div className="border-l-2 border-cyan-500/40 pl-5">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom Support Link */}
        <div className="mt-14 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Still have specific clinical questions?
            </p>
            <a
              href="tel:+919136447006"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-black text-base transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Connect with a Clinical Care Coordinator: +91 91364 47006</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
