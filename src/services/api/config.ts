/**
 * Website API Configuration
 * File: src/services/api/config.ts
 * Connects website to Admin Dashboard backend
 */

export const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.ariesxpert.com/api/v1';

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('websiteAuthToken');
  }
  return null;
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Server-only headers for public lead ingestion.
 *
 * The ingest secret must never use a NEXT_PUBLIC_ variable or be sent from a
 * browser. Lead form submissions enter through Next.js server actions, which
 * add this header while calling the backend.
 */
export const getLeadIngestHeaders = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Lead ingestion is only available from the website server');
  }

  const secret = process.env.LEAD_INGEST_SECRET;
  if (!secret) {
    throw new Error('Lead submission is temporarily unavailable');
  }

  return {
    'Content-Type': 'application/json',
    'x-lead-ingest-secret': secret,
  };
};

export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

export const API_ENDPOINTS = {
  // Leads
  LEADS: `${API_BASE_URL}/leads`,
  LEADS_APPOINTMENT: `${API_BASE_URL}/leads/appointment`,
  LEADS_TELEHEALTH: `${API_BASE_URL}/leads/telehealth`,
  LEADS_CALLBACK: `${API_BASE_URL}/leads/callback`,
  LEADS_CONTACT: `${API_BASE_URL}/leads/contact`,
  LEADS_CORPORATE: `${API_BASE_URL}/leads/corporate`,
  LEADS_INVESTOR: `${API_BASE_URL}/leads/investor`,
  LEADS_THERAPIST_APPLICATION: `${API_BASE_URL}/leads/therapist-application`,

  // Therapists (Public Website Routes)
  THERAPISTS: `${API_BASE_URL}/website/therapists`,
  THERAPISTS_LOCATION: `${API_BASE_URL}/website/therapists`, // Filters applied via query params
  THERAPISTS_AVAILABLE: `${API_BASE_URL}/website/therapists`, // Filters applied via query params

  // CMS
  CMS_PAGES: `${API_BASE_URL}/cms/pages`,
  CMS_BLOGS: `${API_BASE_URL}/cms/blogs`,
  CMS_SERVICES: `${API_BASE_URL}/cms/services`,
  CMS_CONDITIONS: `${API_BASE_URL}/cms/conditions`,
  CMS_TESTIMONIALS: `${API_BASE_URL}/cms/testimonials`,
  CMS_SETTINGS: `${API_BASE_URL}/cms/settings`,

  // Appointments
  APPOINTMENTS: `${API_BASE_URL}/appointments`,

  // Consultations
  CONSULTATIONS: `${API_BASE_URL}/therapists/consultation-slots`,
};
