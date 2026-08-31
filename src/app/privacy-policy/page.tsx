import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Shield, Lock, Eye, Database, Globe, Phone, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getBreadcrumbSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = {
    title: 'Privacy Policy | Aries PhysioCare',
    description: 'Read the Privacy Policy of Aries PhysioCare (Aries HealthCare International Pvt Ltd). Know how we collect, use, and protect your personal health information.',
    alternates: {
        canonical: 'https://www.ariesphysiocare.com/privacy-policy',
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
        id: 'information-collected',
        icon: Database,
        title: '1. Information We Collect',
        content: [
            {
                subtitle: 'Personal Information',
                text: 'When you book an appointment, register an account, or contact us, we collect: Full name, Phone number, Email address, Physical address (for home visit scheduling), Date of birth and gender (for clinical records), Medical history and health conditions (provided voluntarily for better care).',
            },
            {
                subtitle: 'Usage Information',
                text: 'We automatically collect certain information about how you interact with our website including: IP address, Browser type and version, Pages visited and time spent, Referring URLs, Device information.',
            },
            {
                subtitle: 'Communication Data',
                text: 'If you contact us via phone, WhatsApp, email, or our website forms, we may retain records of those communications to improve our service and respond effectively to your queries.',
            },
        ],
    },
    {
        id: 'how-we-use',
        icon: Eye,
        title: '2. How We Use Your Information',
        content: [
            {
                subtitle: 'Service Delivery',
                text: 'We use your information to: Schedule and confirm home physiotherapy appointments, Match you with the appropriate specialist therapist, Maintain clinical health records, Send appointment reminders and follow-up communications.',
            },
            {
                subtitle: 'Business Operations',
                text: 'We may use your information to: Improve our services and website, Analyze usage patterns, Respond to inquiries and support requests, Send relevant health tips and service updates (with your consent).',
            },
            {
                subtitle: 'Legal Obligations',
                text: 'We may process your information when required to comply with applicable laws, regulations, or legal proceedings, including healthcare regulations under Indian law.',
            },
        ],
    },
    {
        id: 'data-sharing',
        icon: Globe,
        title: '3. Information Sharing & Disclosure',
        content: [
            {
                subtitle: 'Therapist Sharing',
                text: 'Your relevant appointment details and health information are shared with the assigned Aries PhysioCare therapist only to the extent necessary for providing your treatment. All therapists are bound by confidentiality obligations.',
            },
            {
                subtitle: 'Service Providers',
                text: 'We may share information with trusted third-party service providers who assist us in operating our website, conducting business, and serving you — including cloud storage, communication platforms, and payment processors. These parties are contractually bound to keep your information confidential.',
            },
            {
                subtitle: 'No Unauthorized Sale',
                text: 'We do NOT sell, trade, or rent your personal information to third parties for marketing purposes. Your health data is never shared with insurance companies, pharmaceutical companies, or advertisers without your explicit consent.',
            },
            {
                subtitle: 'Legal Requirements',
                text: 'We may disclose your information when required by law, court order, governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of Aries PhysioCare, our users, or the public.',
            },
        ],
    },
    {
        id: 'health-data',
        icon: Shield,
        title: '4. Health & Medical Data',
        content: [
            {
                subtitle: 'Sensitive Data Protection',
                text: 'We understand that health and medical information is highly sensitive. All health-related data you provide is treated with the highest level of confidentiality in accordance with applicable Indian healthcare and data protection regulations.',
            },
            {
                subtitle: 'Clinical Records',
                text: 'Clinical records created during your treatment are maintained for the period required by Indian medical regulations. You have the right to request access to your clinical records at any time by contacting us.',
            },
        ],
    },
    {
        id: 'data-security',
        icon: Lock,
        title: '5. Data Security',
        content: [
            {
                subtitle: 'Security Measures',
                text: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and access controls.',
            },
            {
                subtitle: 'Breach Notification',
                text: 'In the event of a data breach that may affect your rights, we will notify you and the relevant regulatory authority as required by applicable law.',
            },
        ],
    },
    {
        id: 'cookies',
        icon: Globe,
        title: '6. Cookies & Tracking Technologies',
        content: [
            {
                subtitle: 'Cookies We Use',
                text: 'Our website uses cookies to enhance user experience. These include: Essential cookies (necessary for website functionality), Analytics cookies (to understand how visitors interact with our site), Preference cookies (to remember your settings).',
            },
            {
                subtitle: 'Your Cookie Choices',
                text: 'You may configure your browser to refuse all or some cookies. Please note that disabling certain cookies may affect the functionality of our website.',
            },
        ],
    },
    {
        id: 'your-rights',
        icon: Shield,
        title: '7. Your Rights',
        content: [
            {
                subtitle: 'Access & Correction',
                text: 'You have the right to access the personal information we hold about you and request correction of any inaccurate information. Contact us at help@ariesphysiocare.com to exercise this right.',
            },
            {
                subtitle: 'Data Deletion',
                text: 'You may request deletion of your personal information, subject to our legal obligations to retain certain records (e.g., clinical records as mandated by health regulations).',
            },
            {
                subtitle: 'Communication Preferences',
                text: 'You may opt out of marketing communications at any time by clicking "unsubscribe" in any email or by contacting us directly.',
            },
        ],
    },
    {
        id: 'third-party',
        icon: Globe,
        title: '8. Third-Party Links',
        content: [
            {
                subtitle: 'External Sites',
                text: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party site you visit.',
            },
        ],
    },
    {
        id: 'children',
        icon: Shield,
        title: '9. Children\'s Privacy',
        content: [
            {
                subtitle: 'Age Restriction',
                text: 'Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If a parent or guardian believes their child has provided us with personal information, please contact us immediately at help@ariesphysiocare.com.',
            },
        ],
    },
    {
        id: 'changes',
        icon: Eye,
        title: '10. Changes to This Policy',
        content: [
            {
                subtitle: 'Policy Updates',
                text: 'We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last revised" date at the top of this page. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.',
            },
        ],
    },
];

export default function PrivacyPolicyPage() {
    const jsonLd = getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy-policy' },
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
                            <span className="text-white font-semibold">Privacy Policy</span>
                        </nav>
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-accent" />
                                </div>
                                <span className="text-white/70 text-sm font-medium">Last Updated: {LAST_UPDATED}</span>
                            </div>
                            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-4">
                                Privacy Policy
                            </h1>
                            <p className="text-white/80 text-lg leading-relaxed">
                                At {BRAND_NAME}, we are committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and protect the information you provide to us.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12 md:py-16 bg-background">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-4xl mx-auto">
                            {/* Quick Summary */}
                            <Card className="glassmorphic mb-10 bg-primary/5 border-primary/20">
                                <CardContent className="p-6">
                                    <h2 className="font-headline text-xl font-bold mb-3">Quick Summary</h2>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {[
                                            { icon: Lock, title: 'Your Data is Secure', text: 'We use encryption and secure servers to protect all personal and health information.' },
                                            { icon: Shield, title: 'No Data Selling', text: 'We never sell your personal or health data to any third party for marketing purposes.' },
                                            { icon: Eye, title: 'You\'re in Control', text: 'You can access, correct, or request deletion of your data at any time by contacting us.' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <item.icon className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm mb-0.5">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">{item.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Introduction */}
                            <div className="mb-8 p-6 rounded-2xl bg-secondary/20 border">
                                <p className="text-muted-foreground leading-relaxed">
                                    This Privacy Policy applies to <strong>{ORG_NAME}</strong> ('Company', 'we', 'us', or 'our'), operating the <strong>{BRAND_NAME}</strong> brand and website at ariesphysiocare.com. By using our services, you agree to the collection and use of information as described in this policy. If you do not agree, please discontinue use of our services.
                                </p>
                            </div>

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
                                        <div className="space-y-4 pl-0 md:pl-14">
                                            {section.content.map((item, i) => (
                                                <div key={i} className="p-5 rounded-xl bg-secondary/10 border border-border/50">
                                                    <h3 className="font-bold text-base mb-2 text-primary">{item.subtitle}</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact */}
                            <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20">
                                <h2 className="font-headline text-2xl font-bold mb-4">Contact Us About Privacy</h2>
                                <p className="text-muted-foreground mb-6">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact us:
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
                                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span><strong>Address:</strong> {ORG_NAME}, Andheri West, Mumbai, Maharashtra — 400053, India</span>
                                    </div>
                                </div>
                            </div>

                            {/* Internal links */}
                            <div className="mt-8 flex flex-wrap gap-3 justify-center">
                                <Link href="/terms-of-service" className="text-sm font-semibold text-primary underline">Terms of Service</Link>
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
