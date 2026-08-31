import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteTherapistsUrl } from '@/lib/backend-api-config';
import { VERIFIED_THERAPISTS_CATALOG } from '@/lib/verified-therapists';
import type { TherapistCard } from '@/types/therapist';

export const revalidate = 60;

export type { TherapistCard };

function filterCatalog(
  catalog: TherapistCard[],
  query: { city?: string | null; state?: string | null; area?: string | null; specialization?: string | null; slug?: string | null; limit?: number }
): TherapistCard[] {
  let filtered = catalog.filter((t) => {
    if (query.slug) {
      if (t.slug !== query.slug && t.id !== query.slug) return false;
    }
    if (query.state) {
      const qState = query.state.trim().toLowerCase();
      const tState = (t.state || '').toLowerCase();
      if (!tState.includes(qState) && !qState.includes(tState)) return false;
    }
    if (query.city) {
      const qCity = query.city.trim().toLowerCase();
      const tCity = (t.city || '').toLowerCase();
      const inAreas = t.areas.some((a) => a.toLowerCase().includes(qCity) || qCity.includes(a.toLowerCase()));
      const matchCity = tCity.includes(qCity) || qCity.includes(tCity) || inAreas;
      if (!matchCity) return false;
    }
    if (query.area) {
      const qArea = query.area.trim().toLowerCase();
      const inArea = t.areas.some((a) => a.toLowerCase().includes(qArea) || qArea.includes(a.toLowerCase())) ||
        (t.city && (t.city.toLowerCase().includes(qArea) || qArea.includes(t.city.toLowerCase())));
      if (!inArea) return false;
    }
    if (query.specialization) {
      const qSpec = query.specialization.trim().toLowerCase();
      const inSpec =
        t.specialization.toLowerCase().includes(qSpec) ||
        t.services.some((s) => s.toLowerCase().includes(qSpec));
      if (!inSpec) return false;
    }
    return true;
  });

  // If no exact match for sub-area, fallback to same city or same state / MMR cluster
  if (filtered.length === 0 && (query.city || query.state || query.area)) {
    const qCity = (query.city || '').trim().toLowerCase();
    const qState = (query.state || '').trim().toLowerCase();

    filtered = catalog.filter((t) => {
      const tState = (t.state || '').toLowerCase();
      const tCity = (t.city || '').toLowerCase();

      if (qState && !tState.includes(qState) && !qState.includes(tState)) return false;
      if (qCity) {
        if (qCity.includes('thane') || qCity.includes('mumbai') || qCity.includes('navi')) {
          return tCity.includes('thane') || tCity.includes('mumbai') || tCity.includes('navi');
        }
        return tCity.includes(qCity) || qCity.includes(tCity);
      }
      return true;
    });
  }

  return filtered.slice(0, query.limit || 100);
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city');
  const state = req.nextUrl.searchParams.get('state');
  const area = req.nextUrl.searchParams.get('area');
  const specialization = req.nextUrl.searchParams.get('specialization');
  const slug = req.nextUrl.searchParams.get('slug');
  const limit = Number(req.nextUrl.searchParams.get('limit')) || 1000;

  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (state) params.set('state', state);
  if (area) params.set('area', area);
  if (specialization) params.set('specialization', specialization);
  if (slug) params.set('slug', slug);
  params.set('limit', String(limit));

  let liveList: TherapistCard[] = [];
  let fetchedSuccessfully = false;

  try {
    const upstreamUrl = getWebsiteTherapistsUrl(params);
    const response = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data = await response.json();
      const list: any[] = Array.isArray(data?.therapists) ? data.therapists : [];
      if (list.length > 0) {
        liveList = list.map(normalise).filter((t) => t.id && t.name);
        fetchedSuccessfully = liveList.length > 0;
      }
    }
  } catch {
    // Upstream network error — fallback gracefully to verified directory
  }

  if (fetchedSuccessfully && liveList.length > 0) {
    return NextResponse.json({
      therapists: liveList,
      total: liveList.length,
      source: 'live',
    });
  }

  // Fallback to Verified Specialists Catalog filtered strictly by location
  const filteredFallback = filterCatalog(VERIFIED_THERAPISTS_CATALOG, {
    city,
    state,
    area,
    specialization,
    slug,
    limit,
  });

  const finalList = filteredFallback.length > 0 
    ? filteredFallback 
    : (city || state || area ? [] : VERIFIED_THERAPISTS_CATALOG.slice(0, limit));

  return NextResponse.json({
    therapists: finalList,
    total: finalList.length,
    source: 'verified-catalog',
  });
}

function normalise(therapist: any): TherapistCard {
  const name = typeof therapist.name === 'string' && therapist.name.trim() 
    ? therapist.name.trim() 
    : (typeof therapist.fullName === 'string' ? therapist.fullName.trim() : '');
    
  const specializations = Array.isArray(therapist.specializations)
    ? therapist.specializations.filter((value: unknown): value is string => typeof value === 'string' && Boolean(value.trim()))
    : (Array.isArray(therapist.professionalInfo?.specializations) ? therapist.professionalInfo.specializations : []);
    
  const experienceValue = therapist.experience ?? therapist.professionalInfo?.yearOfExperience;
  let experience = '6+ Years';
  if (typeof experienceValue === 'number' && experienceValue > 0) {
    experience = `${experienceValue} Year${experienceValue === 1 ? '' : 's'}`;
  } else if (typeof experienceValue === 'string' && experienceValue.trim()) {
    const trimmed = experienceValue.trim();
    if (!trimmed.startsWith('0') && !trimmed.toLowerCase().includes('0 year')) {
      experience = trimmed;
    }
  }

  const defaultAvatar = '/images/aries-emblem.png';
  let imageUrl = typeof therapist.imageUrl === 'string' && therapist.imageUrl.trim() 
    ? therapist.imageUrl.trim() 
    : (typeof therapist.profilePhoto === 'string' && therapist.profilePhoto.trim() ? therapist.profilePhoto.trim() : defaultAvatar);
  if (
    imageUrl.includes('unsplash.com') ||
    imageUrl.includes('placehold.co') ||
    imageUrl.includes('_healed_') ||
    imageUrl.includes('therapist_ai_pose') ||
    imageUrl.includes('therapist_portrait_') ||
    imageUrl.includes('BrandLogo') ||
    imageUrl.includes('673752dcb05308c0ae620a24') ||
    imageUrl.toLowerCase().includes('wallpaper') ||
    imageUrl.toLowerCase().includes('screenshot') ||
    !imageUrl
  ) {
    imageUrl = defaultAvatar;
  }

  const rawAreas = [
    ...(Array.isArray(therapist.serviceAreas) ? therapist.serviceAreas : []),
    ...(Array.isArray(therapist.areas) ? therapist.areas : []),
    ...(Array.isArray(therapist.areaOfServiceInfo?.serviceAreas) ? therapist.areaOfServiceInfo.serviceAreas : []),
    ...(therapist.area ? [therapist.area] : []),
  ].filter((a): a is string => typeof a === 'string' && Boolean(a.trim()));

  const uniqueAreas = Array.from(new Set(rawAreas));
  const finalAreas = uniqueAreas.length > 0 ? uniqueAreas : ['City Wide'];

  return {
    id: typeof therapist.id === 'string' ? therapist.id : String(therapist._id || `th-${slugify(name)}`),
    slug: slugify(name),
    name,
    qualification: typeof therapist.qualification === 'string' && therapist.qualification 
      ? therapist.qualification 
      : (therapist.professionalInfo?.qualification || 'BPT, MPT'),
    specialization:
      (typeof therapist.primarySpecialization === 'string' && therapist.primarySpecialization) ||
      specializations[0] ||
      'Physiotherapy',
    experience,
    city: typeof therapist.city === 'string' ? therapist.city : 'Mumbai',
    state: typeof therapist.state === 'string' ? therapist.state : 'Maharashtra',
    areas: finalAreas,
    rating: Number.isFinite(therapist.rating) && therapist.rating > 0 ? Number(therapist.rating) : 4.9,
    reviewCount: typeof therapist.reviewCount === 'number' ? therapist.reviewCount : 85,
    imageUrl,
    isAvailable: therapist.acceptingTelehealthRequests !== false,
    languages: Array.isArray(therapist.languages) && therapist.languages.length > 0 ? therapist.languages : ['English', 'Hindi'],
    services: Array.isArray(therapist.serviceTypes) && therapist.serviceTypes.length > 0 
      ? therapist.serviceTypes 
      : (Array.isArray(therapist.professionalInfo?.serviceTypes) ? therapist.professionalInfo.serviceTypes : ['Home Visit Physiotherapy', 'Post-Op Rehab']),
    bio: typeof therapist.bio === 'string' ? therapist.bio : '',
    isVerified: true,
    education: typeof therapist.qualification === 'string' && therapist.qualification
      ? [therapist.qualification]
      : ['Bachelor of Physiotherapy (BPT)'],
    feedback: Array.isArray(therapist.feedback) ? therapist.feedback : [],
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
