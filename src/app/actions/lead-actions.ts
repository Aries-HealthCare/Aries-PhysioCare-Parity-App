/**
 * Server Actions for Lead Submission — attribution fields forwarded to backend.
 */
'use server';

import { z } from 'zod';
import { leadsService, type LeadAttributionPayload } from '@/services/api/leads';
import { leadAttributionSchema, pickAttributionFields } from '@/lib/lead-attribution-schema';

const appointmentSchema = leadAttributionSchema.merge(
  z.object({
    service: z.string().min(1, 'Service is required'),
    country: z.string(),
    state: z.string().min(1, 'State is required'),
    city: z.string().min(1, 'City is required'),
    area: z.string().min(1, 'Area is required'),
    date: z.date(),
    time: z.string().min(1, 'Time is required'),
    therapist: z.string().optional(),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Invalid email address'),
    address: z.string().min(1, 'Address is required'),
    condition: z.string().optional(),
    paymentMethod: z.enum(['card', 'upi', 'cash']).optional(),
  }),
);

export async function submitAppointmentLead(data: z.infer<typeof appointmentSchema>) {
  try {
    const validatedData = appointmentSchema.parse(data);
    const attr = pickAttributionFields(validatedData);

    const response = await leadsService.submitAppointmentLead({
      fullName: validatedData.fullName,
      phone: validatedData.phone,
      email: validatedData.email,
      state: validatedData.state,
      city: validatedData.city,
      area: validatedData.area,
      address: validatedData.address,
      service: validatedData.service,
      date: validatedData.date,
      time: validatedData.time,
      condition: validatedData.condition,
      therapistId: validatedData.therapist,
      paymentMethod: validatedData.paymentMethod as 'card' | 'upi' | 'cash' | undefined,
      attribution: attr,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Error submitting appointment lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit appointment',
    };
  }
}

const callbackSchema = leadAttributionSchema.merge(
  z.object({
    fullName: z.string().min(1, 'Name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
  }),
);

export async function submitCallbackLead(data: z.infer<typeof callbackSchema>) {
  try {
    const validatedData = callbackSchema.parse(data);
    const response = await leadsService.submitCallbackLead({
      fullName: validatedData.fullName,
      phone: validatedData.phone,
      attribution: pickAttributionFields(validatedData),
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error submitting callback lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit callback request',
    };
  }
}

const telehealthSchema = leadAttributionSchema.merge(
  z.object({
    fullName: z.string().min(2).max(120),
    mobile: z.string().min(10).max(20),
    email: z.string().email(),
    address: z.string().min(5).max(500),
    condition: z.string().min(10).max(2000),
    age: z.number().int().min(1).max(120),
    gender: z.enum(['male', 'female', 'other']),
    therapistId: z.string().min(1).max(100),
    preferredDate: z.string().datetime(),
    preferredTime: z.string().min(1).max(30),
  }),
);

export async function submitTelehealthRequest(data: z.infer<typeof telehealthSchema>) {
  try {
    const validated = telehealthSchema.parse(data);
    const response = await leadsService.submitTelehealthLead({
      fullName: validated.fullName,
      phone: validated.mobile,
      email: validated.email,
      address: validated.address,
      condition: validated.condition,
      age: validated.age,
      gender: validated.gender,
      therapistId: validated.therapistId,
      preferredDate: validated.preferredDate,
      preferredTime: validated.preferredTime,
      attribution: pickAttributionFields(validated),
    });
    return { success: true, data: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit telehealth request',
    };
  }
}

const contactSchema = leadAttributionSchema.merge(
  z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Valid phone number is required'),
    country: z.string().optional(),
    city: z.string().optional(),
    enquiryType: z.string().min(1, 'Please select an enquiry type'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),
);

export async function submitContactLead(data: z.infer<typeof contactSchema>) {
  try {
    const validatedData = contactSchema.parse(data);
    const response = await leadsService.submitContactLead({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      country: validatedData.country,
      city: validatedData.city,
      enquiryType: validatedData.enquiryType,
      message: validatedData.message,
      attribution: pickAttributionFields(validatedData),
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error submitting contact lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit contact form',
    };
  }
}

const corporateSchema = leadAttributionSchema.merge(
  z.object({
    companyName: z.string().min(1, 'Company name is required'),
    industryType: z.string().optional(),
    employeeCount: z.string().optional(),
    contactPerson: z.string().min(1, 'Contact person is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Valid phone number is required'),
    location: z.string().optional(),
    requirement: z.string().optional(),
  }),
);

export async function submitCorporateLead(data: z.infer<typeof corporateSchema>) {
  try {
    const validatedData = corporateSchema.parse(data);
    const response = await leadsService.submitCorporateLead({
      companyName: validatedData.companyName,
      industryType: validatedData.industryType,
      employeeCount: validatedData.employeeCount,
      contactPerson: validatedData.contactPerson,
      email: validatedData.email,
      phone: validatedData.phone,
      location: validatedData.location,
      requirement: validatedData.requirement,
      attribution: pickAttributionFields(validatedData),
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error submitting corporate lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit corporate inquiry',
    };
  }
}

const investorSchema = leadAttributionSchema.merge(
  z.object({
    companyName: z.string().optional(),
    investorName: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Valid phone number is required'),
    country: z.string().optional(),
    investmentInterest: z.string().optional(),
    message: z.string().optional(),
  }),
);

export async function submitInvestorLead(data: z.infer<typeof investorSchema>) {
  try {
    const validatedData = investorSchema.parse(data);
    const response = await leadsService.submitInvestorLead({
      companyName: validatedData.companyName,
      investorName: validatedData.investorName,
      email: validatedData.email,
      phone: validatedData.phone,
      country: validatedData.country,
      investmentInterest: validatedData.investmentInterest,
      message: validatedData.message,
      attribution: pickAttributionFields(validatedData),
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error submitting investor lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit investor inquiry',
    };
  }
}

export async function submitTherapistApplicationLead(
  data: Record<string, unknown>,
) {
  try {
    const attr = pickAttributionFields(data);
    const response = await leadsService.submitTherapistApplicationLead({
      fullName: String(data.fullName || data.name || ''),
      phone: String(data.phone || data.mobile || ''),
      email: String(data.email || ''),
      city: data.city ? String(data.city) : undefined,
      state: data.state ? String(data.state) : undefined,
      message: data.message ? String(data.message) : undefined,
      attribution: attr,
    });
    return { success: true, data: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit therapist application',
    };
  }
}
