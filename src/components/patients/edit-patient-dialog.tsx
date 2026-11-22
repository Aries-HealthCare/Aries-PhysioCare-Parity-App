'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Plus, Trash2, UserCog, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { providerApi } from '@/services/provider-api';

export interface EditPatientDialogProps {
  patient: any;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type GenderOption = 'Male' | 'Female' | 'Other';

function extractReportItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return String(obj.url || obj.uri || obj.name || obj.title || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

function normalizeGender(raw: unknown): GenderOption {
  const s = String(raw || '').trim().toLowerCase();
  if (s === 'female' || s === 'f') return 'Female';
  if (s === 'other' || s === 'non-binary' || s === 'prefer not to say') return 'Other';
  return 'Male';
}

function resolvePatientCore(patient: any) {
  const nested =
    patient?.patient && typeof patient.patient === 'object'
      ? patient.patient
      : patient?.patientDetails && typeof patient.patientDetails === 'object'
        ? patient.patientDetails
        : patient || {};

  const patientId = String(nested?._id || nested?.id || patient?._id || patient?.id || '');

  let firstName = String(nested?.firstName || patient?.firstName || '').trim();
  let lastName = String(nested?.lastName || patient?.lastName || '').trim();
  if (!firstName && !lastName) {
    const full = String(
      nested?.fullName || nested?.name || patient?.fullName || patient?.name || ''
    ).trim();
    if (full) {
      const parts = full.split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ');
    }
  }

  const phone = String(
    nested?.phone ||
      nested?.mobileNo ||
      nested?.mobileNumber ||
      patient?.phone ||
      patient?.mobileNo ||
      patient?.mobileNumber ||
      ''
  ).trim();

  const rawAge = nested?.age ?? patient?.age;
  const age =
    rawAge !== undefined && rawAge !== null && String(rawAge).trim() !== '' && Number(rawAge) > 0
      ? String(rawAge)
      : '';

  const gender = normalizeGender(nested?.gender || patient?.gender);

  const medicalConds = Array.isArray(nested?.medicalConditions)
    ? nested.medicalConditions.filter(Boolean).join(', ')
    : Array.isArray(patient?.medicalConditions)
      ? patient.medicalConditions.filter(Boolean).join(', ')
      : '';

  const condition = String(
    patient?.condition ||
      nested?.condition ||
      patient?.diagnosis ||
      nested?.diagnosis ||
      medicalConds ||
      ''
  ).trim();

  const rawAddr = nested?.address ?? patient?.address;
  const addrObj = rawAddr && typeof rawAddr === 'object' ? rawAddr : {};

  const street = String(addrObj.street || (typeof rawAddr === 'string' ? rawAddr : '') || '').trim();
  const addressLine2 = String(addrObj.addressLine2 || addrObj.line2 || '').trim();
  const city = String(addrObj.city || nested?.city || patient?.city || '').trim();
  const state = String(addrObj.state || nested?.state || patient?.state || '').trim();
  const pinCode = String(
    addrObj.pinCode ||
      addrObj.pincode ||
      addrObj.zipCode ||
      nested?.pinCode ||
      nested?.pincode ||
      patient?.pincode ||
      ''
  ).trim();
  const landMark = String(addrObj.landMark || addrObj.landmark || '').trim();

  const investigationReports = extractReportItems(
    nested?.investigationReports ?? patient?.investigationReports
  );
  const medicalReports = extractReportItems(
    nested?.medicalReports ??
      nested?.prescriptions ??
      patient?.medicalReports ??
      patient?.prescriptions
  );

  return {
    patientId,
    firstName,
    lastName,
    phone,
    age,
    gender,
    condition,
    street,
    addressLine2,
    city,
    state,
    pinCode,
    landMark,
    investigationReports,
    medicalReports,
  };
}

export function EditPatientDialog({ patient, open, onClose, onSaved }: EditPatientDialogProps) {
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<GenderOption>('Male');
  const [condition, setCondition] = useState('');

  const [street, setStreet] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [landMark, setLandMark] = useState('');

  const [investigationReports, setInvestigationReports] = useState<string[]>([]);
  const [medicalReports, setMedicalReports] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !patient) return;
    const init = resolvePatientCore(patient);
    setFirstName(init.firstName);
    setLastName(init.lastName);
    setPhone(init.phone);
    setAge(init.age);
    setGender(init.gender);
    setCondition(init.condition);
    setStreet(init.street);
    setAddressLine2(init.addressLine2);
    setCity(init.city);
    setStateVal(init.state);
    setPinCode(init.pinCode);
    setLandMark(init.landMark);
    setInvestigationReports(init.investigationReports);
    setMedicalReports(init.medicalReports);
    setErrorMsg(null);
  }, [open, patient]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isSaving, onClose]);

  if (!open || !patient) return null;

  const { patientId } = resolvePatientCore(patient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAge = age.trim();
    const trimmedCondition = condition.trim();

    if (!patientId) {
      setErrorMsg('Unable to identify this patient record. Please reload and try again.');
      return;
    }

    if (!trimmedFirst) {
      setErrorMsg('First name is required.');
      return;
    }

    if (trimmedPhone.length > 0 && trimmedPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Phone number must contain at least 10 digits.');
      return;
    }

    let parsedAge: number | undefined;
    if (trimmedAge.length > 0) {
      const num = Number(trimmedAge);
      if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0 || num > 120) {
        setErrorMsg('Please enter a valid numeric age between 1 and 120.');
        return;
      }
      parsedAge = num;
    }

    const cleanInvestigations = investigationReports.map((item) => item.trim()).filter(Boolean);
    const cleanMedical = medicalReports.map((item) => item.trim()).filter(Boolean);

    const payload: Record<string, any> = {
      firstName: trimmedFirst,
      lastName: trimmedLast,
      phone: trimmedPhone,
      ...(parsedAge !== undefined ? { age: parsedAge } : {}),
      gender,
      condition: trimmedCondition,
      medicalConditions: trimmedCondition ? [trimmedCondition] : [],
      address: {
        street: street.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: stateVal.trim(),
        pinCode: pinCode.trim(),
        landMark: landMark.trim(),
      },
      investigationReports: cleanInvestigations,
      medicalReports: cleanMedical,
      prescriptions: cleanMedical,
    };

    setIsSaving(true);
    try {
      const res = await providerApi.updatePatient(patientId, payload);
      if (res.success === false) {
        throw new Error(res.message || 'Could not save patient details.');
      }
      toast({
        title: 'Patient updated',
        description: `${[trimmedFirst, trimmedLast].filter(Boolean).join(' ')}'s clinical record has been saved.`,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update patient details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-patient-dialog-title"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCog className="w-4 h-4" />
            </div>
            <div>
              <h2 id="edit-patient-dialog-title" className="text-base font-extrabold text-foreground">
                Edit Patient Details
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Update demographics, doorstep address, condition, and clinical reports.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close edit patient dialog"
            disabled={isSaving}
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Personal Details */}
            <section className="space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="ep-first-name" className="text-xs font-bold text-foreground">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="ep-first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ep-last-name" className="text-xs font-bold text-foreground">
                    Last Name
                  </label>
                  <Input
                    id="ep-last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="ep-phone" className="text-xs font-bold text-foreground">
                    Phone Number
                  </label>
                  <Input
                    id="ep-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ep-age" className="text-xs font-bold text-foreground">
                    Age (Years)
                  </label>
                  <Input
                    id="ep-age"
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 54"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ep-gender" className="text-xs font-bold text-foreground">
                    Gender
                  </label>
                  <select
                    id="ep-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as GenderOption)}
                    disabled={isSaving}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Clinical Condition */}
            <section className="space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Clinical Profile
              </h3>
              <div className="space-y-1">
                <label htmlFor="ep-condition" className="text-xs font-bold text-foreground">
                  Primary Clinical Condition
                </label>
                <Input
                  id="ep-condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g. Post-TKR Rehabilitation, Lumbar Radiculopathy"
                  className="h-10 rounded-xl text-xs"
                  disabled={isSaving}
                />
              </div>
            </section>

            {/* Address */}
            <section className="space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Doorstep Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="ep-street" className="text-xs font-bold text-foreground">
                    Street Address
                  </label>
                  <Input
                    id="ep-street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House / Flat, Street"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ep-line2" className="text-xs font-bold text-foreground">
                    Address Line 2
                  </label>
                  <Input
                    id="ep-line2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Locality / Colony"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ep-city" className="text-xs font-bold text-foreground">
                    City
                  </label>
                  <Input
                    id="ep-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ep-state" className="text-xs font-bold text-foreground">
                    State
                  </label>
                  <Input
                    id="ep-state"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    placeholder="State"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ep-pincode" className="text-xs font-bold text-foreground">
                    Pin Code
                  </label>
                  <Input
                    id="ep-pincode"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="e.g. 400001"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ep-landmark" className="text-xs font-bold text-foreground">
                    Landmark
                  </label>
                  <Input
                    id="ep-landmark"
                    value={landMark}
                    onChange={(e) => setLandMark(e.target.value)}
                    placeholder="Nearby landmark"
                    className="h-10 rounded-xl text-xs"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </section>

            {/* Investigation Reports */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Investigation Reports
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSaving}
                  onClick={() => setInvestigationReports((prev) => [...prev, ''])}
                  className="h-7 px-2.5 text-xs font-bold text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Report
                </Button>
              </div>
              {investigationReports.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No investigation reports added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {investigationReports.map((val, idx) => (
                    <div key={`inv-${idx}`} className="flex items-center gap-2">
                      <Input
                        value={val}
                        onChange={(e) =>
                          setInvestigationReports((prev) =>
                            prev.map((item, i) => (i === idx ? e.target.value : item))
                          )
                        }
                        placeholder="Report note or document URL (e.g. Knee MRI report)"
                        className="h-9 rounded-xl text-xs flex-1"
                        disabled={isSaving}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove investigation report ${idx + 1}`}
                        disabled={isSaving}
                        onClick={() =>
                          setInvestigationReports((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Medical Reports / Prescriptions */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Doctor Prescriptions &amp; Medical Reports
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSaving}
                  onClick={() => setMedicalReports((prev) => [...prev, ''])}
                  className="h-7 px-2.5 text-xs font-bold text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Prescription
                </Button>
              </div>
              {medicalReports.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No prescriptions or medical reports added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {medicalReports.map((val, idx) => (
                    <div key={`med-${idx}`} className="flex items-center gap-2">
                      <Input
                        value={val}
                        onChange={(e) =>
                          setMedicalReports((prev) =>
                            prev.map((item, i) => (i === idx ? e.target.value : item))
                          )
                        }
                        placeholder="Prescription note or document URL"
                        className="h-9 rounded-xl text-xs flex-1"
                        disabled={isSaving}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove prescription ${idx + 1}`}
                        disabled={isSaving}
                        onClick={() =>
                          setMedicalReports((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sticky Footer */}
          <div className="px-5 sm:px-6 py-4 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-extrabold shadow-sm gap-2"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
