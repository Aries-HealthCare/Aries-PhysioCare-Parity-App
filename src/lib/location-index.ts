/**
 * Location Index Builder
 * 
 * Builds a flat lookup map from all areas and sub-areas in locations.ts
 * so we can generate dedicated SEO landing pages for every locality.
 * 
 * URL Pattern: /physiotherapy-in-[area-slug]
 * e.g. /physiotherapy-in-andheri-west
 *      /physiotherapy-in-lokhandwala
 *      /physiotherapy-in-hinjewadi-phase-1
 */

import { IndianStates, IndianAreaType, IndianCityType, IndianStateType } from './locations';

export type LocationPageType = 'area' | 'subarea';

export interface LocationPageData {
    type: LocationPageType;
    pageSlug: string;            // e.g. "physiotherapy-in-andheri-west"
    locationSlug: string;        // e.g. "andheri-west"
    locationName: string;        // e.g. "Andheri West"
    cityName: string;            // e.g. "Mumbai"
    citySlug: string;
    stateName: string;           // e.g. "Maharashtra"
    stateSlug: string;
    areaName?: string;           // parent area name (for sub-areas)
    areaSlug?: string;           // parent area slug (for sub-areas)
    canonicalUrl: string;
    // Derived context
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    heroHeading: string;
    heroSubheading: string;
    nearbyAreas: { name: string; slug: string; pageSlug: string }[];
}

const BASE = 'https://www.ariesphysiocare.com';

// ─── Build flat index of all area + sub-area pages ─────────────────────────
function buildLocationIndex(): LocationPageData[] {
    const pages: LocationPageData[] = [];

    for (const state of IndianStates) {
        if (!state.seoEnabled) continue;

        for (const city of state.cities) {
            if (!city.seoEnabled) continue;

            // Collect sibling areas for "nearby areas" section
            const siblingAreas = city.areas
                .filter(a => a.seoEnabled)
                .map(a => ({
                    name: a.name,
                    slug: a.slug,
                    pageSlug: `physiotherapy-in-${a.slug}`,
                }));

            for (const area of city.areas) {
                if (!area.seoEnabled) continue;

                const areaPageSlug = `physiotherapy-in-${area.slug}`;

                // ── Area page ──────────────────────────────────────────────────────
                pages.push({
                    type: 'area',
                    pageSlug: areaPageSlug,
                    locationSlug: area.slug,
                    locationName: area.name,
                    cityName: city.name,
                    citySlug: city.slug,
                    stateName: state.name,
                    stateSlug: state.slug,
                    canonicalUrl: `${BASE}/${areaPageSlug}`,
                    metaTitle: `Best Home Physiotherapy in ${area.name}, ${city.name} | Aries PhysioCare`,
                    metaDescription: `Expert home physiotherapy in ${area.name}, ${city.name}. Certified physio specialists available at your doorstep. Same-day appointments. Call +91 9136447006.`,
                    keywords: [
                        `physiotherapy in ${area.name.toLowerCase()}`,
                        `home physiotherapy ${area.name.toLowerCase()}`,
                        `physiotherapist near me ${area.name.toLowerCase()}`,
                        `physio at home ${area.name.toLowerCase()} ${city.name.toLowerCase()}`,
                        `best physiotherapist ${area.name.toLowerCase()}`,
                    ],
                    heroHeading: `Expert Home Physiotherapy in ${area.name}`,
                    heroSubheading: `Certified physiotherapists available at your doorstep in ${area.name}, ${city.name}. Same-day appointments guaranteed.`,
                    nearbyAreas: siblingAreas.filter(a => a.slug !== area.slug).slice(0, 8),
                });

                // ── Sub-area pages ─────────────────────────────────────────────────
                if (area.subAreas) {
                    const siblingSubAreas = area.subAreas
                        .filter(s => s.seoEnabled)
                        .map(s => ({
                            name: s.name,
                            slug: s.slug,
                            pageSlug: `physiotherapy-in-${s.slug}`,
                        }));

                    for (const subArea of area.subAreas) {
                        if (!subArea.seoEnabled) continue;

                        // Skip if sub-area slug is identical to area slug (avoid duplicate pages)
                        if (subArea.slug === area.slug) continue;

                        const subAreaPageSlug = `physiotherapy-in-${subArea.slug}`;

                        pages.push({
                            type: 'subarea',
                            pageSlug: subAreaPageSlug,
                            locationSlug: subArea.slug,
                            locationName: subArea.name,
                            cityName: city.name,
                            citySlug: city.slug,
                            stateName: state.name,
                            stateSlug: state.slug,
                            areaName: area.name,
                            areaSlug: area.slug,
                            canonicalUrl: `${BASE}/${subAreaPageSlug}`,
                            metaTitle: `Best Home Physiotherapy in ${subArea.name}, ${city.name} | Aries PhysioCare`,
                            metaDescription: `Expert home physiotherapy in ${subArea.name}, ${area.name}, ${city.name}. Certified physio specialists at your doorstep. Book same-day. Call +91 9136447006.`,
                            keywords: [
                                `physiotherapy in ${subArea.name.toLowerCase()}`,
                                `home physiotherapy ${subArea.name.toLowerCase()}`,
                                `physiotherapist near me ${subArea.name.toLowerCase()}`,
                                `physio at home ${subArea.name.toLowerCase()} ${city.name.toLowerCase()}`,
                                `physiotherapy ${area.name.toLowerCase()} ${city.name.toLowerCase()}`,
                            ],
                            heroHeading: `Expert Home Physiotherapy in ${subArea.name}`,
                            heroSubheading: `Certified physiotherapists available at your doorstep in ${subArea.name}, ${area.name}, ${city.name}.`,
                            nearbyAreas: siblingSubAreas
                                .filter(s => s.slug !== subArea.slug)
                                .slice(0, 8),
                        });
                    }
                }
            }
        }
    }

    return pages;
}

// Singleton — built once at module load
let _locationIndex: LocationPageData[] | null = null;
let _locationMap: Map<string, LocationPageData> | null = null;

function getLocationIndex(): LocationPageData[] {
    if (!_locationIndex) {
        _locationIndex = buildLocationIndex();
    }
    return _locationIndex;
}

function getLocationMap(): Map<string, LocationPageData> {
    if (!_locationMap) {
        _locationMap = new Map();
        for (const page of getLocationIndex()) {
            // Only add if not already present (prevents slug collisions)
            if (!_locationMap.has(page.pageSlug)) {
                _locationMap.set(page.pageSlug, page);
            }
        }
    }
    return _locationMap;
}

export function getAllLocationPageSlugs(): string[] {
    return Array.from(getLocationMap().keys());
}

export function getLocationPageData(pageSlug: string): LocationPageData | undefined {
    return getLocationMap().get(pageSlug);
}

export function getAllLocationPages(): LocationPageData[] {
    return getLocationIndex();
}
