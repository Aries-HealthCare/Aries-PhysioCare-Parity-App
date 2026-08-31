/**
 * Website Therapists API Service
 * File: src/services/api/therapists.ts
 * Fetches therapist data for website display (Vetted Experts, location-based listings)
 */

import { API_ENDPOINTS, getAuthHeaders, handleApiError } from './config';

export interface TherapistDisplay {
  id: string;
  name: string;
  bio: string;
  profileImage?: string;
  specializations: string[];
  experience: number;
  qualifications?: string[];
  languages?: string[];
  isVerified: boolean;
  isAvailable?: boolean;
}

export interface TherapistListResponse {
  data: TherapistDisplay[];
  total: number;
  page: number;
  limit: number;
}

class TherapistsService {
  /**
   * Get all active verified therapists for home page "Vetted Experts"
   */
  async getVettedExperts(limit: number = 10) {
    try {
      const params = new URLSearchParams();
      params.append('status', 'active');
      params.append('isVerified', 'true');
      params.append('limit', limit.toString());

      const response = await fetch(`${API_ENDPOINTS.THERAPISTS}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vetted experts: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get therapists by location (state, city, area)
   * Used for location-based landing pages
   */
  async getTherapistsByLocation(state: string, city?: string, area?: string) {
    try {
      const params = new URLSearchParams();
      params.append('state', state);
      params.append('status', 'active');
      if (city) params.append('city', city);
      if (area) params.append('area', area);

      const response = await fetch(`${API_ENDPOINTS.THERAPISTS_LOCATION}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch therapists by location: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get therapists available for online video consultation
   */
  async getAvailableForConsultation(filters?: {
    specialization?: string;
    date?: string;
    city?: string;
    state?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.specialization) params.append('specialization', filters.specialization);
      if (filters?.date) params.append('date', filters.date);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.state) params.append('state', filters.state);

      const response = await fetch(`${API_ENDPOINTS.THERAPISTS_AVAILABLE}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch available therapists: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get therapist details by ID
   */
  async getTherapistById(therapistId: string) {
    try {
      // Use the public website endpoint with slug or ID to fetch single therapist
      const response = await fetch(`${API_ENDPOINTS.THERAPISTS}?slug=${therapistId}&limit=1`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch therapist: ${response.statusText}`);
      }

      const json = await response.json();
      if (!json.therapists || json.therapists.length === 0) {
        throw new Error(`Therapist not found`);
      }
      return { data: json.therapists[0] };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get consultation slots for a therapist
   */
  async getConsultationSlots(therapistId: string, date?: string) {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);

      const response = await fetch(`${API_ENDPOINTS.CONSULTATIONS}/${therapistId}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch consultation slots: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Book an online video consultation
   */
  async bookConsultation(therapistId: string, data: {
    slotId?: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    requestedDate?: string;
    notes?: string;
  }) {
    try {
      const payload = {
        ...data,
        therapistId,
      };

      const response = await fetch(`${API_ENDPOINTS.CONSULTATIONS}/${therapistId}/book`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to book consultation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const therapistsService = new TherapistsService();
