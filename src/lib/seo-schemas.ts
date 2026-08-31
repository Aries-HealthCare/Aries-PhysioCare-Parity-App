/**
 * SEO Schema Utilities for Aries PhysioCare
 * Generates JSON-LD structured data for various page types
 */

export const BASE_URL = 'https://www.ariesphysiocare.com';
export const ORG_PHONE = '+91-9136447006';
export const ORG_PHONE_DISPLAY = '+91 9136447006';
export const ORG_WHATSAPP = '+91-8591981880';
export const ORG_EMAIL = 'support@ariesphysiocare.com';
export const ORG_ADDRESS = {
    '@type': 'PostalAddress',
    streetAddress: 'Andheri West',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '400053',
    addressCountry: 'IN',
};

// ─────────────────────────────────────────────────
// Organization Schema (used on homepage + about page)
// ─────────────────────────────────────────────────
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'MedicalOrganization'],
        name: 'Aries PhysioCare',
        legalName: 'Aries HealthCare International Pvt Ltd',
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        telephone: ORG_PHONE,
        email: ORG_EMAIL,
        foundingDate: '2019',
        numberOfEmployees: { '@type': 'QuantitativeValue', value: 450 },
        address: ORG_ADDRESS,
        areaServed: { '@type': 'Country', name: 'India' },
        sameAs: [
            'https://facebook.com/ariesphysiocare',
            'https://instagram.com/ariesphysiocare',
            'https://twitter.com/ariesphysiocare',
            'https://linkedin.com/company/aries-physiocare',
            'https://youtube.com/@ariesphysiocare',
        ],
        contactPoint: [
            {
                '@type': 'ContactPoint',
                telephone: ORG_PHONE,
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi'],
                hoursAvailable: [
                    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '20:00' },
                    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: '09:00', closes: '18:00' },
                ],
            },
        ],
    };
}

// ─────────────────────────────────────────────────
// WebSite Schema (homepage)
// ─────────────────────────────────────────────────
export function getWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Aries PhysioCare India',
        url: BASE_URL,
        description: 'Expert home physiotherapy and healthcare services across India',
        potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/blogs?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
        },
    };
}

// ─────────────────────────────────────────────────
// LocalBusiness Schema (city/location pages)
// ─────────────────────────────────────────────────
export function getLocalBusinessSchema(params: {
    name: string;
    description: string;
    city: string;
    state: string;
    postalCode?: string;
    url: string;
    imageUrl?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'MedicalBusiness', 'HealthAndBeautyBusiness'],
        name: params.name,
        description: params.description,
        url: params.url,
        telephone: ORG_PHONE,
        email: ORG_EMAIL,
        image: params.imageUrl || `${BASE_URL}/og-image.jpg`,
        priceRange: '₹₹',
        address: {
            '@type': 'PostalAddress',
            addressLocality: params.city,
            addressRegion: params.state,
            postalCode: params.postalCode || '',
            addressCountry: 'IN',
        },
        geo: { '@type': 'GeoCoordinates' },
        openingHoursSpecification: [
            { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '20:00' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: '09:00', closes: '18:00' },
        ],
        hasMap: `https://www.google.com/maps/search/physiotherapy+${params.city}`,
        areaServed: {
            '@type': 'City',
            name: params.city,
        },
        parentOrganization: {
            '@type': 'Organization',
            name: 'Aries HealthCare International Pvt Ltd',
            url: BASE_URL,
        },
    };
}

// ─────────────────────────────────────────────────
// HealthcareService Schema (service pages)
// ─────────────────────────────────────────────────
export function getHealthcareServiceSchema(params: {
    name: string;
    description: string;
    url: string;
    imageUrl?: string;
    city?: string;
    state?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HealthcareService',
        name: params.name,
        description: params.description,
        url: params.url,
        image: params.imageUrl || `${BASE_URL}/og-image.jpg`,
        telephone: ORG_PHONE,
        provider: {
            '@type': 'MedicalOrganization',
            name: 'Aries PhysioCare',
            url: BASE_URL,
        },
        availableChannel: {
            '@type': 'ServiceChannel',
            serviceUrl: params.url,
            servicePhone: ORG_PHONE,
        },
        areaServed: params.city
            ? { '@type': 'City', name: params.city }
            : { '@type': 'Country', name: 'India' },
        serviceType: 'Physiotherapy',
    };
}

// ─────────────────────────────────────────────────
// Physician Schema (therapist/doctor pages)
// ─────────────────────────────────────────────────
export function getPhysicianSchema(params: {
    name: string;
    qualification: string;
    experience: string;
    specialization: string;
    areas: string[];
    slug: string;
    imageUrl?: string;
    rating?: number;
    reviewCount?: number;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': ['Person', 'Physician', 'MedicalBusiness'],
        name: params.name,
        jobTitle: `${params.qualification} - ${params.specialization}`,
        description: `${params.name} is a certified physiotherapist with ${params.experience} of experience, specializing in ${params.specialization}.`,
        url: `${BASE_URL}/therapist/${params.slug}`,
        image: params.imageUrl || `${BASE_URL}/og-image.jpg`,
        telephone: ORG_PHONE,
        worksFor: {
            '@type': 'MedicalOrganization',
            name: 'Aries PhysioCare',
            url: BASE_URL,
        },
        areaServed: params.areas.map(a => ({ '@type': 'Place', name: a })),
        medicalSpecialty: params.specialization,
        ...(params.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: params.rating,
                reviewCount: params.reviewCount || 50,
                bestRating: 5,
                worstRating: 1,
            },
        }),
    };
}

// ─────────────────────────────────────────────────
// MedicalClinic Schema (clinic pages)
// ─────────────────────────────────────────────────
export function getMedicalClinicSchema(params: {
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    slug: string;
    mapUrl?: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': ['MedicalClinic', 'LocalBusiness', 'HealthcareService'],
        name: params.name,
        description: params.description,
        url: `${BASE_URL}/clinic/${params.slug}`,
        telephone: params.phone || ORG_PHONE,
        email: ORG_EMAIL,
        address: {
            '@type': 'PostalAddress',
            streetAddress: params.address,
            addressLocality: params.city,
            addressRegion: params.state,
            addressCountry: 'IN',
        },
        hasMap: params.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(params.name + ' ' + params.city)}`,
        parentOrganization: {
            '@type': 'MedicalOrganization',
            name: 'Aries PhysioCare',
            url: BASE_URL,
        },
        openingHoursSpecification: [
            { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '20:00' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: '09:00', closes: '18:00' },
        ],
        ...(params.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: params.rating,
                reviewCount: params.reviewCount || 100,
                bestRating: 5,
                worstRating: 1,
            },
        }),
    };
}

// ─────────────────────────────────────────────────
// FAQ Schema
// ─────────────────────────────────────────────────
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

// ─────────────────────────────────────────────────
// BreadcrumbList Schema
// ─────────────────────────────────────────────────
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'WebPage',
                '@id': item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
                name: item.name,
                url: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
            },
        })),
    };
}

// ─────────────────────────────────────────────────
// Article/Blog Schema
// ─────────────────────────────────────────────────
export function getArticleSchema(params: {
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
    author?: string;
    datePublished?: string;
    dateModified?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: params.title,
        description: params.description,
        url: params.url,
        image: params.imageUrl || `${BASE_URL}/og-image.jpg`,
        author: {
            '@type': 'Organization',
            name: params.author || 'Aries PhysioCare Clinical Team',
            url: BASE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Aries PhysioCare',
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
        },
        datePublished: params.datePublished || new Date().toISOString(),
        dateModified: params.dateModified || new Date().toISOString(),
    };
}
