/**
 * Website Leads API Service
 * File: src/services/api/leads.ts
 * Handles form submissions that create leads in the admin dashboard
 */

import { API_ENDPOINTS, getLeadIngestHeaders, handleApiError } from './config';

export interface LeadAttributionPayload {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmAdset?: string;
  utmAd?: string;
  utmKeyword?: string;
  gclid?: string;
  fbclid?: string;
  contentId?: string;
  campaignId?: string;
  marketId?: string;
  growthEngine?: 'PATIENT' | 'THERAPIST' | 'BRAND';
  referrer?: string;
  landingPage?: string;
}

function withAttribution(
  payload: Record<string, unknown>,
  attribution?: LeadAttributionPayload,
): Record<string, unknown> {
  if (!attribution) return payload;
  return { ...payload, ...attribution, growthEngine: attribution.growthEngine || payload.growthEngine || 'PATIENT' };
}

export interface AppointmentLead {
  fullName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  area: string;
  address: string;
  service: string;
  date: Date | string;
  time: string;
  paymentMethod?: 'card' | 'upi' | 'cash';
  condition?: string;
  therapistId?: string;
  attribution?: LeadAttributionPayload;
}

export interface CallbackLead {
  fullName: string;
  phone: string;
  attribution?: LeadAttributionPayload;
}

export interface TelehealthLead {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  condition: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  therapistId: string;
  preferredDate: string;
  preferredTime: string;
  attribution?: LeadAttributionPayload;
}

export interface ContactLead {
  name: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  enquiryType: string;
  message: string;
  attribution?: LeadAttributionPayload;
}

export interface CorporateLead {
  companyName: string;
  industryType?: string;
  employeeCount?: string;
  contactPerson: string;
  email: string;
  phone: string;
  location?: string;
  requirement?: string;
  attribution?: LeadAttributionPayload;
}

export interface InvestorLead {
  companyName?: string;
  investorName: string;
  email: string;
  phone: string;
  country?: string;
  investmentInterest?: string;
  message?: string;
  attribution?: LeadAttributionPayload;
}

export interface TherapistApplicationLead {
  fullName: string;
  phone: string;
  email: string;
  city?: string;
  state?: string;
  message?: string;
  attribution?: LeadAttributionPayload;
}

class LeadsService {
  /**
   * Submit appointment/booking form to create lead in dashboard
   */
  async submitAppointmentLead(data: AppointmentLead) {
    try {
      const payload = withAttribution({
        ...data,
        leadType: 'patient-appointment',
        source: 'website',
        condition: data.condition || data.service,
        preferredTherapistId: data.therapistId,
        location: {
          country: 'India',
          state: data.state,
          city: data.city,
          area: data.area,
        },
      }, data.attribution);

      const response = await fetch(API_ENDPOINTS.LEADS_APPOINTMENT, {
        method: 'POST',
        headers: getLeadIngestHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit appointment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async submitTelehealthLead(data: TelehealthLead) {
    try {
      const response = await fetch(API_ENDPOINTS.LEADS_TELEHEALTH, {
        method: 'POST',
        headers: getLeadIngestHeaders(),
        body: JSON.stringify(withAttribution({
          ...data,
          leadType: 'telehealth-request',
          source: 'website-free-tele-consultation',
          service: 'Telehealth consultation',
          notes: data.condition,
          preferredTherapistId: data.therapistId,
          date: data.preferredDate,
          time: data.preferredTime,
        }, data.attribution)),
      });
      if (!response.ok) {
        throw new Error(`Failed to submit telehealth request: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit callback request form
   */
  async submitCallbackLead(data: CallbackLead) {
    try {
      const payload = withAttribution({
        ...data,
        leadType: 'patient-callback',
        source: 'website',
      }, data.attribution);

      const response = await fetch(API_ENDPOINTS.LEADS_CALLBACK, {
        method: 'POST',
        headers: getLeadIngestHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit callback: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit contact form
   */
  async submitContactLead(data: ContactLead) {
    try {
      const payload = withAttribution({
        ...data,
        leadType: 'contact-inquiry',
        source: 'website',
      }, data.attribution);

      const response = await fetch(API_ENDPOINTS.LEADS_CONTACT, {
        method: 'POST',
        headers: getLeadIngestHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit contact: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit corporate inquiry form
   */
  async submitCorporateLead(data: CorporateLead) {
    try {
      const payload = withAttribution({
        ...data,
        leadType: 'corporate-partner',
        source: 'website',
      }, data.attribution);

      const response = await fetch(API_ENDPOINTS.LEADS_CORPORATE, {
        method: 'POST',
        headers: getLeadIngestHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit corporate inquiry: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit investor inquiry form
   */
  async submitInvestorLead(data: InvestorLead) {
    try {
      const payload = withAttribution({
        ...data,
        leadType: 'investor-inquiry',
        source: 'website',
      }, data.attribution);

      const response = await fetch(API_ENDPOINTS.LEADS_INVESTOR, {
        method: 'POST',
        headers: getLeadIngestHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit investor inquiry: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async submitTherapistApplicationLead(data: TherapistApplicationLead) {
    try {
      const payload = withAttribution({
        fullName: data.fullName,
        name: data.fullName,
        phone: data.phone,
        email: data.email,
        city: data.city,
        state: data.state,
        message: data.message,
        leadType: 'therapist-application',
        source: 'website',
        growthEngine: 'THERAPIST',
      }, { ...data.attribution, growthEngine: 'THERAPIST' });

      const response = await fetch(API_ENDPOINTS.LEADS_THERAPIST_APPLICATION, {
        method: 'POST',
        headers: getLeadIngestHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit therapist application: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const leadsService = new LeadsService();
