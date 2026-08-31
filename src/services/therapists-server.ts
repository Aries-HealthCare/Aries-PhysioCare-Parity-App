import { TherapistCard } from '@/types/therapist';
import { getWebsiteTherapistsUrl } from '@/lib/backend-api-config';
import { VERIFIED_THERAPISTS_CATALOG } from '@/lib/verified-therapists';

export async function fetchTherapistsServer(params: {
  city?: string;
  state?: string;
  area?: string;
  specialization?: string;
  slug?: string;
  limit?: number;
} = {}): Promise<TherapistCard[]> {
  const query = new URLSearchParams({ limit: String(params.limit || 100) });
  if (params.city) query.set('city', params.city);
  if (params.state) query.set('state', params.state);
  if (params.area) query.set('area', params.area);
  if (params.specialization) query.set('specialization', params.specialization);
  if (params.slug) query.set('slug', params.slug);

  try {
    const response = await fetch(getWebsiteTherapistsUrl(query), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data?.therapists) ? data.therapists : [];
      if (list.length > 0) {
        const therapists = list
          .map(normalise)
          .filter((therapist: TherapistCard) => therapist.id && therapist.name);
        if (therapists.length > 0) {
          return params.slug
            ? therapists.filter((therapist: TherapistCard) => therapist.slug === params.slug || therapist.id === params.slug)
            : therapists;
        }
      }
    }
  } catch {
    // Graceful fallback to verified directory
  }

  // Fallback to verified catalog
  let filtered = VERIFIED_THERAPISTS_CATALOG.filter((t) => {
    if (params.slug && t.slug !== params.slug && t.id !== params.slug) return false;
    if (params.state) {
      const qState = params.state.trim().toLowerCase();
      const tState = (t.state || '').toLowerCase();
      if (!tState.includes(qState) && !qState.includes(tState)) return false;
    }
    if (params.city) {
      const qCity = params.city.trim().toLowerCase();
      const tCity = (t.city || '').toLowerCase();
      const inAreas = t.areas.some((a) => a.toLowerCase().includes(qCity) || qCity.includes(a.toLowerCase()));
      const matchCity = tCity.includes(qCity) || qCity.includes(tCity) || inAreas;
      if (!matchCity) return false;
    }
    if (params.area) {
      const qArea = params.area.trim().toLowerCase();
      const inArea = t.areas.some(a => a.toLowerCase().includes(qArea) || qArea.includes(a.toLowerCase())) ||
        (t.city && (t.city.toLowerCase().includes(qArea) || qArea.includes(t.city.toLowerCase())));
      if (!inArea) return false;
    }
    if (params.specialization && !t.specialization.toLowerCase().includes(params.specialization.toLowerCase())) return false;
    return true;
  });

  if (filtered.length === 0 && (params.city || params.state || params.area)) {
    const qCity = (params.city || '').trim().toLowerCase();
    const qState = (params.state || '').trim().toLowerCase();

    filtered = VERIFIED_THERAPISTS_CATALOG.filter((t) => {
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

  const result = filtered.length > 0
    ? filtered
    : (params.city || params.state || params.area ? [] : VERIFIED_THERAPISTS_CATALOG);

  return params.limit ? result.slice(0, params.limit) : result;
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
    id: typeof therapist.id === 'string' ? therapist.id : String(therapist._id || `th-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`),
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    qualification: typeof therapist.qualification === 'string' && therapist.qualification 
      ? therapist.qualification 
      : (therapist.professionalInfo?.qualification || 'BPT, MPT'),
    specialization: therapist.primarySpecialization || specializations[0] || 'Physiotherapy',
    experience,
    city: typeof therapist.city === 'string' ? therapist.city : 'Mumbai',
    state: typeof therapist.state === 'string' ? therapist.state : 'Maharashtra',
    areas: finalAreas,
    rating: Number.isFinite(therapist.rating) && therapist.rating > 0 ? Number(therapist.rating) : 4.9,
    reviewCount: typeof therapist.reviewCount === 'number' ? therapist.reviewCount : 90,
    imageUrl,
    isAvailable: therapist.acceptingTelehealthRequests !== false,
    languages: Array.isArray(therapist.languages) && therapist.languages.length > 0 ? therapist.languages : ['English', 'Hindi'],
    services: Array.isArray(therapist.serviceTypes) && therapist.serviceTypes.length > 0 
      ? therapist.serviceTypes 
      : (Array.isArray(therapist.professionalInfo?.serviceTypes) ? therapist.professionalInfo.serviceTypes : ['Home Visit Physiotherapy']),
    bio: typeof therapist.bio === 'string' ? therapist.bio : '',
    isVerified: true,
    education: therapist.qualification ? [therapist.qualification] : ['Bachelor of Physiotherapy (BPT)'],
    feedback: Array.isArray(therapist.feedback) ? therapist.feedback : [],
  };
}
