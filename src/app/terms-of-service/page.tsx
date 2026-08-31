import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, FileText, Scale, AlertTriangle, CheckCircle2, Phone, Mail, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getBreadcrumbSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = {
    title: 'Terms of Service | Aries PhysioCare',
    description: 'Read the Terms of Service of Aries PhysioCare (Aries HealthCare International Pvt Ltd). Understand your rights and obligations when using our home physiotherapy services.',
    alternates: {
        canonical: 'https://www.ariesphysiocare.com/terms-of-service',
    },
    robots: {
        index: true,
        follow: true,
    },
};

const LAST_UPDATED = 'March 1, 2026';
const ORG_NAME = 'Aries HealthCare International Pvt Ltd';
const BRAND_NAME = 'Aries PhysioCare';

const sections = [
    {
        id: 'acceptance',
        icon: CheckCircle2,
        title: '1. Acceptance of Terms',
        content: `By accessing or using the Aries PhysioCare website (ariesphysiocare.com) or any of our services, you confirm that you are at least 18 years of age, have read and understood these Terms, and agree to be bound by them. If you are accessing our services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.

If you do not agree to these Terms of Service, please discontinue use of our website and services immediately.`,
    },
    {
        id: 'services',
        icon: FileText,
        title: '2. Description of Services',
        content: `${BRAND_NAME} (a brand of ${ORG_NAME}) provides home physiotherapy and related healthcare services in India. Our services include but are not limited to:

• Home visit physiotherapy sessions conducted by certified therapists
• In-clinic physiotherapy at Aries Expert Centers
• Free tele-consultation assessments
• AI-powered health analysis tools (advisory only)
• Online appointment booking and management
• Health information and educational blog content

All clinical services are performed by qualified physiotherapists registered with the Indian Association of Physiotherapists (IAP) or equivalent professional bodies.`,
    },
    {
        id: 'booking',
        icon: FileText,
        title: '3. Appointment Booking & Cancellation',
        content: `3.1 **Booking:** Appointments can be booked via our website, phone (+91 9136447006), or WhatsApp (+91 9372681410). Booking confirmation is subject to therapist availability in your area.

3.2 **Cancellation Policy:** We request a minimum of 4 hours' notice for appointment cancellations. Late cancellations (less than 4 hours before the appointment) may incur a cancellation fee.

3.3 **Therapist Availability:** While we make every effort to provide your preferred therapist, we reserve the right to arrange an equally qualified alternate therapist if your preferred therapist is unavailable.

3.4 **Service Area:** Services are subject to availability in your specific location. We will confirm service availability when you book.`,
    },
    {
        id: 'medical-disclaimer',
        icon: AlertTriangle,
        title: '4. Medical Disclaimer',
        content: `4.1 **Not a Substitute for Emergency Care:** Our services are not intended to replace emergency medical care. If you are experiencing a medical emergency, please call emergency services (102 / 108) immediately.

4.2 **Clinical Decision:** All clinical decisions, including diagnosis and treatment plans, are made by our qualified physiotherapists based on their professional assessment. We do not guarantee specific outcomes.

4.3 **AI Analysis Tool:** The AI Body Analysis feature on our platform is an informational tool only and does not constitute medical advice or diagnosis. Always consult a qualified healthcare professional for medical concerns.

4.4 **Patient Responsibility:** You are responsible for providing accurate and complete health information to your therapist. Withholding relevant medical history may affect the safety and effectiveness of your treatment.`,
    },
    {
        id: 'payment',
        icon: Scale,
        title: '5. Payment Terms',
        content: `5.1 **Pricing:** Service pricing is communicated at the time of booking. We reserve the right to update prices with reasonable notice.

5.2 **Payment Methods:** We accept payments via cash (for home visits), UPI, net banking, debit/credit cards, and other methods as available through our payment platform.

5.3 **Session Packages:** If you purchase a package of sessions, unused sessions are transferable but non-refundable after the first session has been used.

5.4 **Refunds:** Refund requests for pre-paid packages will be evaluated on a case-by-case basis. Contact help@ariesphysiocare.com for refund queries.`,
    },
    {
        id: 'user-conduct',
        icon: Shield,
        title: '6. User Conduct',
        content: `When using our services, you agree NOT to:

• Provide false or misleading personal or medical information
• Harass, abuse, or threaten our therapists, staff, or other users
• Use our website or services for any unlawful purpose
• Attempt to gain unauthorized access to any part of our systems
• Reproduce, distribute, or commercially exploit any content from our website without written permission
• Upload or transmit any malicious code or harmful content

We reserve the right to terminate your access to our services if you violate any of these conditions.`,
    },
    {
        id: 'intellectual-property',
        icon: FileText,
        title: '7. Intellectual Property',
        content: `All content on the Aries PhysioCare website — including text, images, logos, videos, and software — is the property of ${ORG_NAME} or its licensors and is protected by applicable copyright and intellectual property laws.

You are granted a limited, non-exclusive, non-transferable license to access and use our website for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or lease any part of our services or content without our prior written consent.`,
    },
    {
        id: 'limitation',
        icon: AlertTriangle,
        title: '8. Limitation of Liability',
        content: `To the maximum extent permitted by applicable law, ${ORG_NAME} and its directors, officers, therapists, employees, and affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from:

• Use or inability to use our services
• Any treatment outcomes or medical decisions
• Technical errors or unavailability of our website or platform
• Unauthorized access to or alteration of your data (beyond our control)

Our total liability to you for any claims arising from your use of our services shall not exceed the amount paid by you for the specific service giving rise to the claim.`,
    },
    {
        id: 'privacy',
        icon: Shield,
        title: '9. Privacy',
        content: `Your use of our services is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information.`,
    },
    {
        id: 'governing-law',
        icon: Scale,
        title: '10. Governing Law & Dispute Resolution',
        content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.

We encourage resolution of any disputes through good-faith negotiation before resorting to formal legal proceedings. Please contact help@ariesphysiocare.com with any concerns.`,
    },
    {
        id: 'changes',
        icon: FileText,
        title: '11. Changes to Terms',
        content: `We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised "Last Updated" date. Continued use of our services after any change constitutes acceptance of the modified Terms. We encourage you to review this page periodically.`,
    },
    {
        id: 'contact',
        icon: Phone,
        title: '12. Contact Information',
        content: `If you have questions about these Terms of Service, please contact us at:

Company: ${ORG_NAME}
Brand: ${BRAND_NAME}
Email: help@ariesphysiocare.com
Phone: +91 9136447006
WhatsApp: +91 9372681410
Address: Andheri West, Mumbai, Maharashtra — 400053, India`,
    },
];

export default function TermsOfServicePage() {
    const jsonLd = getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms of Service', url: '/terms-of-service' },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="min-h-screen">
                {/* Hero */}
                <section className="pt-24 pb-12 md:pt-28 md:pb-16 bg-primary">
                    <div className="container mx-auto px-4 md:px-6">
                        <nav className="flex items-center gap-2 text-white/60 text-xs mb-6" aria-label="Breadcrumb">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-white font-semibold">Terms of Service</span>
                        </nav>
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Scale className="w-6 h-6 text-accent" />
                                </div>
                                <span className="text-white/70 text-sm font-medium">Last Updated: {LAST_UPDATED}</span>
                            </div>
                            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-4">
                                Terms of Service
                            </h1>
                            <p className="text-white/80 text-lg leading-relaxed">
                                Please read these Terms of Service carefully before using Aries PhysioCare's website or services. These terms govern your use of our platform and healthcare services.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Table of Contents */}
                <section className="py-8 bg-secondary/20 border-b">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Table of Contents</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {sections.map(section => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                                    >
                                        {section.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12 md:py-16 bg-background">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-4xl mx-auto">
                            {/* Introduction */}
                            <div className="mb-8 p-6 rounded-2xl bg-secondary/20 border">
                                <p className="text-muted-foreground leading-relaxed">
                                    These Terms of Service ('Terms') constitute a legally binding agreement between you and <strong>{ORG_NAME}</strong> ('Company', 'we', 'us', or 'our'), operating under the <strong>{BRAND_NAME}</strong> brand. By accessing our website or using our services, you agree to be bound by these Terms.
                                </p>
                            </div>

                            {/* Critical Alert */}
                            <Card className="mb-8 border-amber-500/30 bg-amber-50/10">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-amber-600 dark:text-amber-400 mb-1">Important Note on Medical Services</p>
                                            <p className="text-sm text-muted-foreground">
                                                Aries PhysioCare provides qualified physiotherapy services, not emergency medical care.
                                                In case of a medical emergency, please call 102 or 108 immediately.
                                                All clinical services are subject to professional assessment by our qualified therapists.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Main Sections */}
                            <div className="space-y-8">
                                {sections.map(section => (
                                    <div key={section.id} id={section.id} className="scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <section.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-headline text-xl md:text-2xl font-bold">{section.title}</h2>
                                        </div>
                                        <div className="pl-0 md:pl-14">
                                            <div className="p-5 rounded-xl bg-secondary/10 border border-border/50">
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact */}
                            <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20">
                                <h2 className="font-headline text-2xl font-bold mb-2">Have Questions?</h2>
                                <p className="text-muted-foreground mb-6">
                                    If you have questions or concerns about these Terms, we're happy to help.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                        <a href="mailto:help@ariesphysiocare.com" className="text-primary font-semibold underline">help@ariesphysiocare.com</a>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                        <a href="tel:+919136447006" className="text-primary font-semibold">+91 9136447006</a>
                                    </div>
                                </div>
                            </div>

                            {/* Internal links */}
                            <div className="mt-8 flex flex-wrap gap-3 justify-center">
                                <Link href="/privacy-policy" className="text-sm font-semibold text-primary underline">Privacy Policy</Link>
                                <span className="text-muted-foreground">•</span>
                                <Link href="/about" className="text-sm font-semibold text-primary underline">About Aries PhysioCare</Link>
                                <span className="text-muted-foreground">•</span>
                                <Link href="/contact" className="text-sm font-semibold text-primary underline">Contact Us</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
