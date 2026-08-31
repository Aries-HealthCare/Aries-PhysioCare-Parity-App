import { submitTelehealthRequest } from '@/app/actions/lead-actions';
import { withStoredAttribution } from '@/lib/growth-attribution';
import { IntakeFormValues, TeleTherapist } from '@/lib/telehealth-types';

export async function getTelehealthTherapists(): Promise<TeleTherapist[]> {
  const response = await fetch('/api/therapists?limit=100', {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('The therapist directory is unavailable');
  }
  const data = await response.json();
  if (!Array.isArray(data?.therapists) || data.therapists.length === 0) {
    throw new Error('No telehealth specialists are currently available');
  }
  return data.therapists
    .filter((therapist: any) => therapist.isAvailable !== false)
    .map((therapist: any) => ({
      id: therapist.id,
      name: therapist.name,
      qualification: therapist.qualification || 'BPT, MPT',
      experience: therapist.experience || '5+ Years',
      specialization: therapist.specialization || 'Physiotherapy',
      imageUrl: therapist.imageUrl || '/images/aries-emblem.png',
      isAvailable: true,
    }));
}

export async function scheduleConsultation(
  data: IntakeFormValues,
  therapistId: string,
  date: Date,
  time: string,
): Promise<void> {
  const result = await submitTelehealthRequest(
    withStoredAttribution({
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email,
      address: data.address,
      condition: data.condition,
      age: data.age,
      gender: data.gender,
      therapistId,
      preferredDate: date.toISOString(),
      preferredTime: time,
    }),
  );
  if (!result.success) {
    throw new Error(result.error || 'Unable to submit telehealth request');
  }
}
