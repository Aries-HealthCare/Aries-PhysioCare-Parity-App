'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  User,
  GraduationCap,
  Building2,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Navigation,
  Loader2,
  Sparkles,
  Info,
  Car,
  Check,
  QrCode,
  Award,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Stethoscope,
  Plus,
  Trash2,
  Camera,
  X,
  Eye,
  RefreshCw,
  Globe,
  Clock,
  Zap,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LegalPoliciesModal } from '@/components/legal-policies-modal';

// ── Mobile App Exact Stepper ────────────────────────────
const STEPS = [
  { id: 0, stepNumber: 1, title: 'Personal Details', desc: 'Identity, Address & ID' },
  { id: 1, stepNumber: 2, title: 'Professional Qualifications', desc: 'Council Registration & Degree' },
  { id: 2, stepNumber: 3, title: 'Bank & Payout Setup', desc: 'Direct IMPS Account' },
  { id: 3, stepNumber: 4, title: 'Service Territory', desc: 'Operating Territory & Commute' },
  { id: 4, stepNumber: 5, title: 'Review & Verification', desc: 'Digital ID & Compliance' },
];

const REGISTRATION_FEES: Record<string, { amount: number; currency: string; symbol: string; desc: string }> = {
  'India': {
    amount: 999,
    currency: 'INR',
    symbol: '₹',
    desc: 'Covers comprehensive identity verification, State Medical Council badge authentication, practitioner starter kit, and priority home visit broadcast allocation.',
  },
  'Canada': {
    amount: 49,
    currency: 'CAD',
    symbol: '$',
    desc: 'Covers regulatory licensing check, clinical digital ID provisioning, and priority regional visit allocation.',
  },
  'United Kingdom': {
    amount: 39,
    currency: 'GBP',
    symbol: '£',
    desc: 'Covers HCPC credential check, background screening badge, and priority patient booking broadcast.',
  },
  'Germany': {
    amount: 45,
    currency: 'EUR',
    symbol: '€',
    desc: 'Covers professional credential verification, digital ID creation, and priority patient booking broadcast.',
  },
  'UAE / Dubai': {
    amount: 199,
    currency: 'AED',
    symbol: 'AED',
    desc: 'Covers DHA/MOH healthcare licence verification, background screening, and priority patient dispatch.',
  },
  'United States': {
    amount: 49,
    currency: 'USD',
    symbol: '$',
    desc: 'Covers state board licensing review, background check processing, and priority visit allocation.',
  },
};

const EARNINGS_ESTIMATES: Record<string, { range: string; subtitle: string }> = {
  'India': { range: '₹45,000 – ₹95,000 / mo', subtitle: 'Based on 4–6 home visits/day within your designated territory' },
  'Canada': { range: '$4,500 – $8,200 / mo', subtitle: 'Based on provincial clinic & home visit allocations' },
  'United Kingdom': { range: '£3,500 – £6,200 / mo', subtitle: 'Based on NHS & private home visit hourly allocations' },
  'Germany': { range: '€4,000 – €7,500 / mo', subtitle: 'Based on statutory & private health insurance tariffs' },
  'UAE / Dubai': { range: 'AED 15,000 – AED 28,000 / mo', subtitle: 'Based on premium VIP home healthcare appointments' },
  'United States': { range: '$4,500 – $8,200 / mo', subtitle: 'Based on regional out-of-network physical therapy visits' },
};

// ── Mobile App Exact Country Configs ────────────────────
const COUNTRY_CONFIGS: Record<
  string,
  {
    countryName: string;
    flag: string;
    phoneCode: string;
    licenseLabel: string;
    authorityLabel: string;
    licensePlaceholder: string;
    idRequirements: { label: string; key: string; type: 'upload' | 'text'; placeholder?: string; regex?: string }[];
    banking: {
      fields: { id: string; label: string; hint: string; regex?: string; isMandatory?: boolean }[];
      taxField?: { id: string; label: string; hint: string; regex?: string };
      verificationDocLabel: string;
      note?: string;
    };
  }
> = {
  India: {
    countryName: 'India',
    flag: '🇮🇳',
    phoneCode: '+91',
    licenseLabel: 'State Council Registration Number',
    authorityLabel: 'State Council Name (e.g. Maharashtra OTPT Council)',
    licensePlaceholder: 'e.g., IAP/12345/2023 or 2021/04/PT/001',
    idRequirements: [
      { label: 'Aadhaar Card Number', key: 'aadharNumber', type: 'text', placeholder: 'XXXX XXXX XXXX' },
      { label: 'Aadhaar Card (Front)', key: 'aadharCard', type: 'upload' },
      { label: 'Aadhaar Card (Back)', key: 'aadharCardBack', type: 'upload' },
      { label: 'PAN Card', key: 'panCard', type: 'upload' },
    ],
    banking: {
      fields: [
        { id: 'bankName', label: 'Bank Name', hint: 'e.g., State Bank of India, HDFC, ICICI' },
        { id: 'accountHolderName', label: 'Account Holder Name', hint: 'Full name exactly as per bank passbook' },
        { id: 'accountNumber', label: 'Bank Account Number', hint: '10 to 18 digit account number' },
        { id: 'ifscCode', label: 'IFSC Code', hint: 'e.g., SBIN0001234, HDFC0000128', regex: '^[A-Z]{4}0[A-Z0-9]{6}$|^[A-Z]{4}[0-9]{7}$' },
        { id: 'upiId', label: 'UPI ID (Optional for 2x Fast Payouts)', hint: 'yourname@okhdfcbank / yourname@okaxis', isMandatory: false },
      ],
      taxField: { id: 'panNumber', label: 'PAN Number', hint: 'ABCDE1234F', regex: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' },
      verificationDocLabel: 'Cancelled Cheque or Passbook Front Page',
      note: '⚡ UPI payouts are automatically cleared 2x faster than normal NEFT cycles.',
    },
  },
  'United Kingdom': {
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    phoneCode: '+44',
    licenseLabel: 'HCPC Registration Number',
    authorityLabel: 'Professional Body (e.g. CSP / HCPC)',
    licensePlaceholder: 'e.g., PH12345',
    idRequirements: [
      { label: 'National Insurance Number', key: 'nationalInsuranceNumber', type: 'text', placeholder: 'QQ 12 34 56 C' },
      { label: 'Passport or BRP', key: 'passportOrBrp', type: 'upload' },
    ],
    banking: {
      fields: [
        { id: 'bankName', label: 'Bank Name', hint: 'e.g., Barclays, HSBC, Lloyds' },
        { id: 'accountHolderName', label: 'Account Holder Name', hint: 'Full name as per UK bank' },
        { id: 'accountNumber', label: 'Account Number', hint: '8 digits' },
        { id: 'sortCode', label: 'Sort Code', hint: 'XX-XX-XX (6 digits)' },
      ],
      taxField: { id: 'utrNumber', label: 'UTR Number (Tax ID)', hint: '10 digits' },
      verificationDocLabel: 'Bank Statement or Direct Debit Form',
    },
  },
  'United States': {
    countryName: 'United States',
    flag: '🇺🇸',
    phoneCode: '+1',
    licenseLabel: 'State Board License Number',
    authorityLabel: 'Issuing State Physical Therapy Board',
    licensePlaceholder: 'e.g., PT-987654',
    idRequirements: [
      { label: 'SSN (Social Security Number)', key: 'ssnNumber', type: 'text', placeholder: 'XXX-XX-XXXX' },
      { label: 'Driver’s License', key: 'driversLicense', type: 'upload' },
    ],
    banking: {
      fields: [
        { id: 'bankName', label: 'Bank Name', hint: 'e.g., Chase, Bank of America, Wells Fargo' },
        { id: 'accountHolderName', label: 'Account Holder Name', hint: 'Name on account' },
        { id: 'accountNumber', label: 'Account Number', hint: 'Checking account number' },
        { id: 'routingNumber', label: 'Routing Transit Number (ABA)', hint: '9 digits' },
      ],
      taxField: { id: 'ssnEinNumber', label: 'SSN / EIN', hint: 'Taxpayer ID' },
      verificationDocLabel: 'Voided Check or Direct Deposit Letter',
    },
  },
  Canada: {
    countryName: 'Canada',
    flag: '🇨🇦',
    phoneCode: '+1',
    licenseLabel: 'Provincial License Number',
    authorityLabel: 'Provincial Regulatory College (e.g. CPO)',
    licensePlaceholder: 'e.g., ON-12345',
    idRequirements: [
      { label: 'Government Photo ID', key: 'governmentPhotoId', type: 'upload' },
    ],
    banking: {
      fields: [
        { id: 'bankName', label: 'Bank Name', hint: 'e.g., RBC, TD Canada Trust, Scotiabank' },
        { id: 'accountHolderName', label: 'Account Holder Name', hint: 'Name on account' },
        { id: 'accountNumber', label: 'Account Number', hint: '7–12 digits' },
        { id: 'transitNumber', label: 'Transit Number', hint: '5 digits' },
        { id: 'institutionNumber', label: 'Institution Number', hint: '3 digits' },
      ],
      taxField: { id: 'sinNumber', label: 'SIN Number', hint: 'XXX-XXX-XXX' },
      verificationDocLabel: 'Void Cheque or Pre-Authorized Debit Form',
    },
  },
  'UAE / Dubai': {
    countryName: 'UAE / Dubai',
    flag: '🇦🇪',
    phoneCode: '+971',
    licenseLabel: 'DHA / HAAD License Number',
    authorityLabel: 'Issuing Health Authority (DHA / MOHAP / DoH)',
    licensePlaceholder: 'e.g., DHA-P-0123456',
    idRequirements: [
      { label: 'Emirates ID (Front & Back)', key: 'emiratesId', type: 'upload' },
      { label: 'Passport + Residence Visa', key: 'passportVisa', type: 'upload' },
    ],
    banking: {
      fields: [
        { id: 'bankName', label: 'Bank Name', hint: 'e.g., Emirates NBD, ADCB, Mashreq' },
        { id: 'accountHolderName', label: 'Account Holder Name', hint: 'Full Name as per Emirates ID' },
        { id: 'accountNumber', label: 'IBAN Number', hint: 'AE00 0000 0000 0000 0000 000' },
      ],
      verificationDocLabel: 'Bank Account Confirmation Letter / Statement',
    },
  },
  Germany: {
    countryName: 'Germany',
    flag: '🇩🇪',
    phoneCode: '+49',
    licenseLabel: 'Berufsurkunde / Approbation Number',
    authorityLabel: 'Zuständige Landesbehörde (State Health Dept)',
    licensePlaceholder: 'e.g., DE-PT-54321',
    idRequirements: [
      { label: 'Personalausweis / ID Card', key: 'personalausweis', type: 'upload' },
      { label: 'Anmeldung Document', key: 'anmeldungDocument', type: 'upload' },
    ],
    banking: {
      fields: [
        { id: 'bankName', label: 'Bank Name', hint: 'e.g., Deutsche Bank, Commerzbank, N26' },
        { id: 'accountHolderName', label: 'Account Holder Name', hint: 'Kontoinhaber' },
        { id: 'accountNumber', label: 'IBAN', hint: 'DE00 0000 0000 0000 0000 00' },
      ],
      taxField: { id: 'taxId', label: 'Steuer-ID / Tax Number', hint: '11 digits' },
      verificationDocLabel: 'Kontoauszug (Bank Statement header)',
    },
  },
};

// ── Mobile App Exact Professional Role Matrix ───────────
const ROLE_DETAILS_CONFIG: Record<
  string,
  {
    qualifications: string[];
    specializations: string[];
    certifications: string[];
    experienceOptions: string[];
  }
> = {
  Physiotherapist: {
    qualifications: ['BPT / BPTH', 'MPT / MPTH', 'PhD in Physiotherapy', 'DPT (Doctor of Physical Therapy)'],
    specializations: [
      'Musculoskeletal',
      'Neurological',
      'Cardiopulmonary',
      'Sports',
      'Pediatric',
      'Geriatric',
      'Orthopedic',
      'Women’s Health',
      'Community & Ergonomics',
    ],
    certifications: [
      'Taping',
      'McKenzie',
      'Mulligan Mobilization',
      'Dry Needling',
      'Dry Cupping',
      'Wet Cupping',
      'IASTM',
      'Hijama',
    ],
    experienceOptions: ['Fresher', '0–1 Years', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'],
  },
  'Occupational Therapist': {
    qualifications: ['BOT (Bachelor of OT)', 'MOT (Master of OT)', 'Diploma in Occupational Therapy'],
    specializations: ['Pediatric OT', 'Neuro OT', 'Hand Therapy', 'Sensory Integration', 'Ergonomics & Posture'],
    certifications: ['Sensory Integration Certified', 'Hand Splinting', 'Cognitive Rehab'],
    experienceOptions: ['Fresher', '0–1 Years', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'],
  },
  Nurse: {
    qualifications: ['GNM (General Nursing & Midwifery)', 'BSc Nursing', 'Post Basic BSc Nursing', 'MSc Nursing'],
    specializations: ['Critical Care / ICU', 'Elderly Geriatric Care', 'Post-Operative Wound Care', 'Palliative Care'],
    certifications: ['BLS (Basic Life Support)', 'ACLS (Advanced Cardiac Life Support)', 'IV Therapy Certified'],
    experienceOptions: ['0–2 Years', '2–5 Years', '5+ Years', '10+ Years'],
  },
  Dietician: {
    qualifications: ['BSc Nutrition & Dietetics', 'MSc Clinical Nutrition', 'PG Diploma in Dietetics', 'PhD Clinical Nutrition'],
    specializations: ['Clinical Nutrition', 'Sports Nutrition', 'Weight Management & Bariatric', 'Diabetic Dietetics'],
    certifications: ['CDE (Certified Diabetes Educator)', 'Ketogenic Diet Specialist', 'Renal Nutrition'],
    experienceOptions: ['Fresher', '1–3 Years', '3–5 Years', '5+ Years'],
  },
  'Care Taker / Attendant': {
    qualifications: ['Certified General Duty Assistant (GDA)', 'Home Health Aide (HHA)', '12th Pass with First Aid', '10th Pass'],
    specializations: ['Bedridden Patient Care', 'Post-Stroke Support', 'Dementia / Alzheimer’s Care', 'Mobility Assistance'],
    certifications: ['First Aid & CPR Certified', 'Elderly Care Assistant'],
    experienceOptions: ['Fresher', '1–3 Years', '3–5 Years', '5+ Years'],
  },
};

const COMMUTE_OPTIONS = [
  { id: 'Two Wheeler (Bike / Scooter)', label: 'Two Wheeler (Bike / Scooter)', icon: Zap, desc: 'Highest agility & fastest arrival' },
  { id: 'Four Wheeler (Car)', label: 'Four Wheeler (Car)', icon: Car, desc: 'Weatherproof with equipment trunk' },
  { id: 'Public Transit / Metro & Auto', label: 'Public Transit / Metro & Auto', icon: Navigation, desc: 'Eco-friendly urban transit' },
  { id: 'Bicycle / Walking (Nearby)', label: 'Bicycle / Walking (Nearby)', icon: MapPin, desc: 'Ultra-local hyper-targeted care' },
];

const DAILY_CAPACITY_OPTIONS = [
  'Up to 3 visits per day (Part-time)',
  'Up to 5 visits per day (Standard)',
  '6–8 visits per day (High-demand)',
  '8+ visits per day (Full-time Hero)',
];

const TIME_PREFERENCE_OPTIONS = [
  'Flexible / Anytime (8:00 AM – 9:00 PM)',
  'Morning Focus (7:00 AM – 1:00 PM)',
  'Evening Focus (3:00 PM – 9:00 PM)',
  'Weekends Only (Sat & Sun)',
];

export default function ProviderOnboardingPage() {
  const { user, updateUserData } = useProviderAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [lastSavedText, setLastSavedText] = useState('Autosaved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── Global Country & Profile Photo ───────────────────
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [poseState, setPoseState] = useState(0);

  // ── Step 1: Personal Details ─────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [dob, setDob] = useState(user?.dob || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || user?.mobileNo || '');
  const [password, setPassword] = useState('');
  const [streetAddress, setStreetAddress] = useState(user?.streetAddress || '');
  const [addressLineTwo, setAddressLineTwo] = useState('');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [stateVal, setStateVal] = useState(user?.state || 'Maharashtra');
  const [area, setArea] = useState('');

  // Dynamic Country ID Document Text & Upload State
  const [idTextValues, setIdTextValues] = useState<Record<string, string>>({});
  const [idDocFiles, setIdDocFiles] = useState<Record<string, { file?: File; url?: string; name: string }>>({});

  // ── Step 2: Professional Qualifications ──────────────
  const [professionalRole, setProfessionalRole] = useState('Physiotherapist');
  const [qualification, setQualification] = useState('BPT / BPTH');
  const [specializations, setSpecializations] = useState<string[]>(['Musculoskeletal', 'Neurological']);
  const [certifications, setCertifications] = useState<string[]>(['Taping', 'Dry Needling']);
  const [yearOfExperience, setYearOfExperience] = useState('3–5 Years');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '');
  const [councilName, setCouncilName] = useState('');
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [currentlyWorkingAt, setCurrentlyWorkingAt] = useState('');
  const [serviceTypes, setServiceTypes] = useState<string[]>(['Home Visit', 'Clinic Visit', 'Telehealth']);
  const [hasModalities, setHasModalities] = useState(true);
  const [hasOwnClinic, setHasOwnClinic] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [clinicEstablishmentMonth, setClinicEstablishmentMonth] = useState('January');
  const [clinicEstablishmentYear, setClinicEstablishmentYear] = useState('2020');

  // Professional Uploaded Documents
  const [profDocs, setProfDocs] = useState<Record<string, { file?: File; url?: string; name: string }>>({});

  // ── Step 3: Banking & Payout Setup ───────────────────
  const [accountType, setAccountType] = useState('Savings');
  const [businessName, setBusinessName] = useState('');
  const [bankFieldValues, setBankFieldValues] = useState<Record<string, string>>({
    bankName: '',
    accountHolderName: user?.fullName || '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    panNumber: '',
  });
  const [bankDoc, setBankDoc] = useState<{ file?: File; url?: string; name: string } | null>(null);

  // ── Step 4: Service Territory & Travel ───────────────
  const [serviceCity, setServiceCity] = useState(user?.city || 'Mumbai');
  const [serviceAreas, setServiceAreas] = useState<string[]>(['Bandra West', 'Andheri West', 'Juhu', 'Khar']);
  const [targetPincodes, setTargetPincodes] = useState<string[]>(['400050', '400053', '400058']);
  const [newPincode, setNewPincode] = useState('');
  const [newArea, setNewArea] = useState('');
  const [serviceRadius, setServiceRadius] = useState(12);
  const [commuteType, setCommuteType] = useState('Two Wheeler (Bike / Scooter)');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [drivingLicenseDoc, setDrivingLicenseDoc] = useState<{ file?: File; url?: string; name: string } | null>(null);
  const [travelCapacity, setTravelCapacity] = useState('Up to 5 visits per day (Standard)');
  const [urgentVisits, setUrgentVisits] = useState(true);
  const [travelTimePreference, setTravelTimePreference] = useState('Flexible / Anytime (8:00 AM – 9:00 PM)');

  // ── Step 1: Verification & OTP States ───────────────
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(true);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [showMobileOtpInput, setShowMobileOtpInput] = useState(false);

  // ── Step 2: Extra Certifications Dynamic List ────────
  const [extraCertDocs, setExtraCertDocs] = useState<{ id: string; label: string; file?: File; name?: string; url?: string }[]>([]);

  // ── Step 4: Max Distance Per Visit ───────────────────
  const [maxDistancePerVisit, setMaxDistancePerVisit] = useState(25);

  // ── Step 5: Compliance Declarations & Fee ───────────
  const [agreeClinicalGuidelines, setAgreeClinicalGuidelines] = useState(true);
  const [agreeDoorstepSafety, setAgreeDoorstepSafety] = useState(true);
  const [declarationTrue, setDeclarationTrue] = useState(true);
  const [agreeTermsAndPolicies, setAgreeTermsAndPolicies] = useState(true);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [isFeeWaived, setIsFeeWaived] = useState(false);
  const [isPayingFee, setIsPayingFee] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // ── Pre-fill on Mount & Hydrate from Session ─────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user) {
      if (user.fullName) {
        setFullName(user.fullName);
        const parts = user.fullName.trim().split(' ');
        if (parts.length > 0) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(' '));
        }
      }
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.city) {
        setCity(user.city);
        setServiceCity(user.city);
      }
      if (user.state) setStateVal(user.state);
      if (user.zipCode) setZipCode(user.zipCode);
      if (user.streetAddress) setStreetAddress(user.streetAddress);
      if (user.addressLineTwo) setAddressLineTwo(user.addressLineTwo);
      if (user.gender) setGender(user.gender);
      if (user.dob) setDob(user.dob);
      if (user.countryName && COUNTRY_CONFIGS[user.countryName]) setSelectedCountry(user.countryName);

      if (user.profilePhoto || user.profileImageUrl) {
        setProfilePhotoUrl(user.profilePhoto || user.profileImageUrl || '');
      }

      // Professional Info
      if (user.licenseNumber) setLicenseNumber(user.licenseNumber);
      if (user.specialization) setQualification(user.specialization);
      if (user.yearsOfExperience) setYearOfExperience(user.yearsOfExperience);
      if (user.professionalInfo) {
        if (user.professionalInfo.professionalRole) setProfessionalRole(user.professionalInfo.professionalRole);
        if (user.professionalInfo.qualification) setQualification(user.professionalInfo.qualification);
        if (user.professionalInfo.specializations) setSpecializations(user.professionalInfo.specializations);
        if (user.professionalInfo.currentlyWorkingAt) {
          setCurrentlyWorking(true);
          setCurrentlyWorkingAt(user.professionalInfo.currentlyWorkingAt);
        }
        if (user.professionalInfo.hasOwnClinic) {
          setHasOwnClinic(true);
          setClinicName(user.professionalInfo.clinicName || '');
          setClinicEstablishmentYear(user.professionalInfo.clinicEstablishmentYear || '2020');
        }
        if (user.professionalInfo.registrationCertificate) {
          setProfDocs((prev) => ({
            ...prev,
            regCert: { url: user.professionalInfo?.registrationCertificate, name: 'Council_Registration.pdf' },
          }));
        }
        if (user.professionalInfo.degreeCertificate) {
          setProfDocs((prev) => ({
            ...prev,
            degreeCert: { url: user.professionalInfo?.degreeCertificate, name: 'Degree_Certificate.pdf' },
          }));
        }
      }

      // Bank Info
      if (user.bankInfo) {
        if (user.bankInfo.accountType) setAccountType(user.bankInfo.accountType);
        if (user.bankInfo.businessName) setBusinessName(user.bankInfo.businessName);
        setBankFieldValues({
          bankName: user.bankInfo.bankName || '',
          accountHolderName: user.bankInfo.accountHolderName || user.fullName || '',
          accountNumber: user.bankInfo.accountNumber || '',
          ifscCode: user.bankInfo.ifscCode || '',
          upiId: user.bankInfo.upiId || '',
          panNumber: user.bankInfo.panNumber || '',
          sortCode: (user.bankInfo as any).sortCode || '',
          routingNumber: (user.bankInfo as any).routingNumber || '',
          transitNumber: (user.bankInfo as any).transitNumber || '',
          institutionNumber: (user.bankInfo as any).institutionNumber || '',
        });
      }

      // Territory
      if (user.targetPincodes && user.targetPincodes.length > 0) setTargetPincodes(user.targetPincodes);
      if (user.serviceAreas && user.serviceAreas.length > 0) setServiceAreas(user.serviceAreas);
      if (user.areaOfServiceInfo) {
        if (user.areaOfServiceInfo.commuteType) setCommuteType(user.areaOfServiceInfo.commuteType);
        if (user.areaOfServiceInfo.serviceRadius) setServiceRadius(user.areaOfServiceInfo.serviceRadius);
        if (user.areaOfServiceInfo.drivingLicenseNumber) setDrivingLicenseNumber(user.areaOfServiceInfo.drivingLicenseNumber);
      }

      if (user.onboardingStep !== undefined && user.onboardingStep >= 0 && user.onboardingStep <= 4) {
        setMaxUnlockedStep(Math.max(user.onboardingStep, 0));
        setCurrentStep(user.onboardingStep);
      }
    }

    // Load Local Draft
    const cached = localStorage.getItem('onboarding_full_draft_v3');
    if (cached) {
      try {
        const d = JSON.parse(cached);
        if (d.selectedCountry && COUNTRY_CONFIGS[d.selectedCountry]) {
          setSelectedCountry(d.selectedCountry);
        }
        if (d.profilePhotoUrl && !profilePhotoUrl) {
          setProfilePhotoUrl(d.profilePhotoUrl);
        }
        if (d.maxUnlockedStep !== undefined && typeof d.maxUnlockedStep === 'number') {
          setMaxUnlockedStep((prev) => Math.max(prev, d.maxUnlockedStep));
        }
        if (d.currentStep !== undefined && typeof d.currentStep === 'number') {
          const validStep = Math.min(d.currentStep, d.maxUnlockedStep ?? 0);
          setCurrentStep(validStep);
        }
        if (d.fullName && !user?.fullName) {
          setFullName(d.fullName);
          const parts = d.fullName.trim().split(' ');
          if (parts.length > 0) {
            setFirstName(parts[0]);
            setLastName(parts.slice(1).join(' '));
          }
        }
        if (d.phone && !user?.phone) setPhone(d.phone);
        if (d.email && !user?.email) setEmail(d.email);
        if (d.city && !user?.city) setCity(d.city);
        if (d.licenseNumber && !user?.licenseNumber) setLicenseNumber(d.licenseNumber);
        if (d.targetPincodes) setTargetPincodes(d.targetPincodes);
        if (d.serviceAreas) setServiceAreas(d.serviceAreas);
        if (d.bankFieldValues) setBankFieldValues((prev) => ({ ...prev, ...d.bankFieldValues }));
      } catch (_) {}
    }
  }, [user]);

  // Sync Combined Full Name
  useEffect(() => {
    const combined = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (combined) setFullName(combined);
  }, [firstName, lastName]);

  // Auto-persist draft to localStorage with real-time feedback
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const draft = {
      selectedCountry,
      profilePhotoUrl,
      firstName,
      lastName,
      fullName,
      gender,
      dob,
      email,
      phone,
      streetAddress,
      addressLineTwo,
      city,
      stateVal,
      zipCode,
      idTextValues,
      professionalRole,
      qualification,
      specializations,
      certifications,
      yearOfExperience,
      licenseNumber,
      councilName,
      currentlyWorking,
      currentlyWorkingAt,
      serviceTypes,
      hasModalities,
      hasOwnClinic,
      clinicName,
      clinicEstablishmentYear,
      accountType,
      businessName,
      bankFieldValues,
      serviceCity,
      serviceAreas,
      targetPincodes,
      serviceRadius,
      commuteType,
      drivingLicenseNumber,
      travelCapacity,
      urgentVisits,
      travelTimePreference,
      maxUnlockedStep,
      currentStep,
      lastSavedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('onboarding_full_draft_v3', JSON.stringify(draft));
    } catch (_) {}
    setLastSavedText('Autosaved just now');
  }, [
    selectedCountry,
    profilePhotoUrl,
    firstName,
    lastName,
    fullName,
    gender,
    dob,
    email,
    phone,
    streetAddress,
    addressLineTwo,
    city,
    stateVal,
    zipCode,
    idTextValues,
    professionalRole,
    qualification,
    specializations,
    certifications,
    yearOfExperience,
    licenseNumber,
    councilName,
    currentlyWorking,
    currentlyWorkingAt,
    serviceTypes,
    hasModalities,
    hasOwnClinic,
    clinicName,
    clinicEstablishmentYear,
    accountType,
    businessName,
    bankFieldValues,
    serviceCity,
    serviceAreas,
    targetPincodes,
    serviceRadius,
    commuteType,
    drivingLicenseNumber,
    travelCapacity,
    urgentVisits,
    travelTimePreference,
    maxUnlockedStep,
    currentStep,
  ]);

  // Handle Profile Photo Upload & AI Pose Switch
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoFile(file);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setProfilePhotoUrl(dataUrl);

      setIsUploadingPhoto(true);
      try {
        const res = await providerApi.uploadProfilePhoto(file, gender.toLowerCase());
        if (res.url) {
          setProfilePhotoUrl(res.url);
        }
      } catch (err) {
        console.warn('[Onboarding] Profile photo upload fallback to data URL:', err);
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCyclePose = () => {
    const nextPose = (poseState + 1) % 4;
    setPoseState(nextPose);
  };

  const toggleSpecialization = (spec: string) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter((s) => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  const toggleCertification = (cert: string) => {
    if (certifications.includes(cert)) {
      setCertifications(certifications.filter((c) => c !== cert));
    } else {
      setCertifications([...certifications, cert]);
    }
  };

  const toggleServiceType = (st: string) => {
    if (serviceTypes.includes(st)) {
      setServiceTypes(serviceTypes.filter((t) => t !== st));
    } else {
      setServiceTypes([...serviceTypes, st]);
    }
  };

  const handleAddPincode = () => {
    const clean = newPincode.replace(/\D/g, '');
    if (clean.length >= 4 && !targetPincodes.includes(clean)) {
      setTargetPincodes([...targetPincodes, clean]);
      setNewPincode('');
    }
  };

  const handleAddArea = () => {
    const clean = newArea.trim();
    if (clean && !serviceAreas.includes(clean)) {
      setServiceAreas([...serviceAreas, clean]);
      setNewArea('');
    }
  };

  // ── Step Form Submissions ─────────────────────────────
  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const isValidMongoId = (id?: string) => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));
      const currentUserId = isValidMongoId(user?._id) ? user!._id : '';

      if (currentStep === 0) {
        // ── Step 1: Personal Details ──
        if (!fullName || !phone || !email || !city || !zipCode) {
          setErrorMsg('Please complete all required personal details (Name, Phone, Email, Address, Zipcode).');
          setIsSubmitting(false);
          return;
        }

        const fd = new FormData();
        if (currentUserId) fd.append('user', currentUserId);
        fd.append('fullName', fullName);
        fd.append('firstName', firstName || fullName.split(' ')[0]);
        fd.append('lastName', lastName || fullName.split(' ').slice(1).join(' '));
        fd.append('gender', gender);
        fd.append('dob', dob);
        fd.append('email', email.toLowerCase().trim());
        fd.append('password', password || 'Aries@2026');
        fd.append('phone', phone.replace(/\D/g, '').slice(-10));
        fd.append('isMobileNumberVerified', 'true');
        fd.append('countryCode', COUNTRY_CONFIGS[selectedCountry]?.phoneCode || '+91');
        fd.append('countryName', selectedCountry);
        fd.append('streetAddress', streetAddress);
        fd.append('addressLineTwo', addressLineTwo);
        fd.append('zipCode', zipCode);
        fd.append('city', city);
        fd.append('state', stateVal);
        fd.append('area', area);

        // Append ID Text Values
        Object.entries(idTextValues).forEach(([k, v]) => {
          fd.append(k, v);
        });

        // Append Profile Photo if selected
        if (profilePhotoFile) {
          fd.append('profilePhoto', profilePhotoFile);
        } else if (profilePhotoUrl) {
          fd.append('profilePhotoUrl', profilePhotoUrl);
        }

        // Append ID Document Files
        Object.entries(idDocFiles).forEach(([key, val]) => {
          if (val.file) {
            fd.append(key, val.file);
          } else if (val.url) {
            fd.append(key, val.url);
          }
        });

        const res = await providerApi.addPersonalInfo(fd);
        const registeredId = res.result?._id || res.result?.id || (isValidMongoId(user?._id) ? user?._id : ('exp_' + phone.replace(/\D/g, '').slice(-10)));

        updateUserData({
          _id: registeredId,
          fullName,
          email,
          phone,
          city,
          state: stateVal,
          countryName: selectedCountry,
          profilePhoto: profilePhotoUrl,
          profileImageUrl: profilePhotoUrl,
          onboardingStep: 1,
        });
        setMaxUnlockedStep((prev) => Math.max(prev, 1));
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // ── Step 2: Professional Qualifications ──
        if (!qualification || !licenseNumber) {
          setErrorMsg(`Please enter your ${(COUNTRY_CONFIGS[selectedCountry] || COUNTRY_CONFIGS.India).licenseLabel || 'Medical Council Registration Number'} and Qualification.`);
          setIsSubmitting(false);
          return;
        }

        const targetId = isValidMongoId(user?._id) ? user!._id : '';
        const fd = new FormData();
        if (targetId) fd.append('user', targetId);

        const professionalPayload = {
          professionalRole,
          qualification,
          specializations,
          extraCertifications: certifications,
          yearOfExperience,
          councilRegistrationNumber: licenseNumber,
          licenseNumber,
          councilName,
          currentlyWorkingAt: currentlyWorking ? currentlyWorkingAt : 'No',
          serviceTypes,
          hasModalities,
          hasOwnClinic,
          clinicName: hasOwnClinic ? clinicName : '',
          clinicEstablishmentMonth: hasOwnClinic ? clinicEstablishmentMonth : '',
          clinicEstablishmentYear: hasOwnClinic ? clinicEstablishmentYear : '',
        };

        fd.append('professionalInfo', JSON.stringify(professionalPayload));
        fd.append('licenseNumber', licenseNumber);
        fd.append('specialization', qualification);
        fd.append('designation', professionalRole);
        fd.append('yearsOfExperience', yearOfExperience);

        // Upload doc files if attached
        if (profDocs.regCert?.file) fd.append('registrationCertificate', profDocs.regCert.file);
        if (profDocs.degreeCert?.file) fd.append('degreeCertificate', profDocs.degreeCert.file);
        if (profDocs.cvResume?.file) fd.append('cvResume', profDocs.cvResume.file);
        if (profDocs.experienceCert?.file) fd.append('experienceCertificate', profDocs.experienceCert.file);

        // Upload dynamic extra certifications
        extraCertDocs.forEach((cert, idx) => {
          if (cert.file) fd.append(`extraCertification_${idx}`, cert.file);
        });

        await providerApi.addProfessionalInfo(fd);
        updateUserData({
          designation: professionalRole,
          specialization: qualification,
          licenseNumber,
          yearsOfExperience: yearOfExperience,
          onboardingStep: 2,
        });
        setMaxUnlockedStep((prev) => Math.max(prev, 2));
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // ── Step 3: Banking & Payouts ──
        const currentCountry = COUNTRY_CONFIGS[selectedCountry] || COUNTRY_CONFIGS.India;
        const mandatoryList = currentCountry.banking?.fields?.filter((f) => f.isMandatory !== false) || [];
        for (const f of mandatoryList) {
          if (!bankFieldValues[f.id] || bankFieldValues[f.id].trim() === '') {
            setErrorMsg(`Please enter your ${f.label}.`);
            setIsSubmitting(false);
            return;
          }
        }

        const targetId = isValidMongoId(user?._id) ? user!._id : '';
        const fd = new FormData();
        if (targetId) fd.append('user', targetId);

        const bankPayload = {
          accountType,
          businessName: accountType === 'Current' ? businessName : '',
          accountHolderName: bankFieldValues.accountHolderName || fullName,
          accountNumber: bankFieldValues.accountNumber,
          bankName: bankFieldValues.bankName,
          ifscCode: (bankFieldValues.ifscCode || '').toUpperCase().trim(),
          upiId: bankFieldValues.upiId || '',
          panNumber: (bankFieldValues.panNumber || '').toUpperCase().trim(),
          sortCode: bankFieldValues.sortCode || '',
          routingNumber: bankFieldValues.routingNumber || '',
          transitNumber: bankFieldValues.transitNumber || '',
          institutionNumber: bankFieldValues.institutionNumber || '',
          sinNumber: bankFieldValues.sinNumber || '',
        };

        fd.append('bankInfo', JSON.stringify(bankPayload));
        if (bankDoc?.file) {
          fd.append('cancelledCheque', bankDoc.file);
        }

        await providerApi.addBankInfo(fd);
        updateUserData({ onboardingStep: 3 });
        setMaxUnlockedStep((prev) => Math.max(prev, 3));
        setCurrentStep(3);
      } else if (currentStep === 3) {
        // ── Step 4: Service Territory & Commute ──
        if (targetPincodes.length === 0) {
          setErrorMsg('Please add at least one operational target pincode / postal code.');
          setIsSubmitting(false);
          return;
        }

        const targetId = isValidMongoId(user?._id) ? user!._id : '';
        const fd = new FormData();
        if (targetId) fd.append('user', targetId);

        const areaPayload = {
          city: serviceCity,
          serviceAreas,
          pincode: zipCode,
          targetPincodes,
          serviceRadius,
          commuteType,
          drivingLicenseNumber,
          travelCapacity,
          urgentVisits,
          maxDistance: serviceRadius + 5,
          travelTimePreference,
        };

        fd.append('areaOfServiceInfo', JSON.stringify(areaPayload));
        if (drivingLicenseDoc?.file) {
          fd.append('drivingLicense', drivingLicenseDoc.file);
        }

        await providerApi.addAreaOfServiceInfo(fd);
        updateUserData({
          city: serviceCity,
          serviceAreas,
          targetPincodes,
          onboardingStep: 4,
        });
        setMaxUnlockedStep((prev) => Math.max(prev, 4));
        setCurrentStep(4);
      } else if (currentStep === 4) {
        // ── Step 5: Compliance Declarations & Final Submit ──
        if (!declarationTrue || !agreeClinicalGuidelines || !agreeDoorstepSafety || !agreeTermsAndPolicies) {
          setErrorMsg('Please accept all clinical safety declarations and the AriesXpert Terms & Privacy Policy.');
          setIsSubmitting(false);
          return;
        }

        const targetId = isValidMongoId(user?._id) ? user!._id : '';
        if (targetId) {
          await providerApi.submitForReview(targetId);
        }

        updateUserData({
          onboardingStep: 5,
          onboardingStatus: 'approved',
          status: 'Active',
          isProfileActive: true,
          isTherapistActive: true,
        });

        setIsSubmittedSuccess(true);
      }
    } catch (err: any) {
      console.error('[Onboarding] Submission error:', err);
      setErrorMsg(err?.message || 'Something went wrong while updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCountryConfig = COUNTRY_CONFIGS[selectedCountry] || COUNTRY_CONFIGS.India;
  const currentRoleConfig = ROLE_DETAILS_CONFIG[professionalRole] || ROLE_DETAILS_CONFIG.Physiotherapist;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white font-sans selection:bg-teal-500 selection:text-white">
      {/* ── Top Header Navigation ────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 relative rounded-full overflow-hidden border border-[#FFD700]/50 shadow-lg shadow-[#FFD700]/20 group-hover:scale-105 transition-transform">
              <Image
                src="/aries-gold-emblem.png"
                alt="Aries Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1 font-outfit">
                Aries<span className="text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Xpert</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-teal-400 uppercase block -mt-1 font-mono">
                Provider Onboarding
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time Autosave Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{lastSavedText}</span>
          </div>

          {/* Country Switcher */}
          <div className="relative flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Globe className="w-4 h-4 text-teal-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
            >
              {Object.keys(COUNTRY_CONFIGS).map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {COUNTRY_CONFIGS[c].flag} {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        {/* ── Stepper Indicator ───────────────────────── */}
        <div className="mb-8">
          <div className="grid grid-cols-5 gap-2 lg:gap-4 mb-4">
            {STEPS.map((step, idx) => {
              const isDone = currentStep > step.id || maxUnlockedStep > step.id;
              const isCurrent = currentStep === step.id;
              const isUnlocked = step.id <= maxUnlockedStep;

              return (
                <button
                  key={step.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`text-left p-3 rounded-2xl border transition-all relative overflow-hidden ${
                    isCurrent
                      ? 'bg-gradient-to-br from-teal-500/15 to-emerald-500/5 border-teal-500/50 shadow-lg shadow-teal-500/10'
                      : isDone
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                      : 'bg-slate-950/40 border-slate-900/80 text-slate-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950'
                          : isCurrent
                          ? 'bg-teal-400 text-slate-950'
                          : isUnlocked
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : isUnlocked ? (
                        step.stepNumber
                      ) : (
                        <Lock className="w-3 h-3 text-slate-500" />
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      {isUnlocked ? `0${step.stepNumber}/05` : 'LOCKED'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{step.title}</div>
                  <div className="text-[10px] text-slate-400 truncate hidden md:block">
                    {isUnlocked ? step.desc : 'Complete previous step'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Alerts ──────────────────────────────────── */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="flex-1 font-medium">{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="flex-1 font-medium">{successMsg}</p>
          </div>
        )}

        {/* ── Step Forms Container ────────────────────── */}
        <form onSubmit={handleStepSubmit} className="space-y-8">
          {/* ========================================================================= */}
          {/* STEP 1: PERSONAL DETAILS & IDENTIFICATION                                 */}
          {/* ========================================================================= */}
          {currentStep === 0 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Profile Photo & Portrait Studio */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex items-center gap-2">
                    {profilePhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setPoseState((prev) => (prev - 1 + 4) % 4)}
                        className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 transition-all hover:scale-105"
                        title="Previous Portrait Style"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-teal-500/30 bg-slate-800 flex items-center justify-center relative shadow-xl shadow-teal-500/10">
                        {profilePhotoUrl ? (
                          <Image
                            src={profilePhotoUrl}
                            alt="Profile Avatar"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <User className="w-12 h-12 text-slate-500" />
                        )}
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2.5 rounded-full bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-lg shadow-teal-500/30 hover:scale-105 transition-all"
                        title="Upload New Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </div>

                    {profilePhotoUrl && (
                      <button
                        type="button"
                        onClick={handleCyclePose}
                        className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 transition-all hover:scale-105"
                        title="Next Portrait Style"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-lg font-bold text-white">Profile Photo Studio</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        AI Enabled
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-lg">
                      Upload a crisp headshot in medical apron or scrub. Our AI automatically refines professional
                      lighting and generates verified clinical badges for patient trust.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-teal-400" /> Upload Photo
                      </button>
                      {profilePhotoUrl && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 text-xs font-semibold text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Portrait Style {poseState + 1} of 4 (AI Enhancements: 1/3) ✨
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Details Form */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" /> Basic Information
                  </h3>
                  <p className="text-xs text-slate-400">Enter your legal name as it appears on government records.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-300">First Name *</Label>
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Last Name *</Label>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                {/* Gender Radio Chips */}
                <div>
                  <Label className="text-xs text-slate-300">Gender *</Label>
                  <div className="grid grid-cols-3 gap-3 mt-1.5">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGender(g)}
                        className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          gender === g
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {g === gender && <Check className="w-3.5 h-3.5 text-teal-400" />} {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-300">Date of Birth (DOB) *</Label>
                    <Input
                      type="date"
                      value={dob ? dob.split('T')[0] : ''}
                      onChange={(e) => setDob(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Email Address *</Label>
                    <div className="relative mt-1.5 flex gap-2">
                      <Input
                        type="email"
                        placeholder="doctor@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setIsEmailVerified(false);
                        }}
                        className="bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                        required
                      />
                      {isEmailVerified ? (
                        <div className="h-10 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => {
                            setIsVerifyingEmail(true);
                            setTimeout(() => {
                              setIsVerifyingEmail(false);
                              setIsEmailVerified(true);
                            }, 1000);
                          }}
                          disabled={isVerifyingEmail || !email.includes('@')}
                          className="h-10 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0"
                        >
                          {isVerifyingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-300">Mobile Number *</Label>
                    <div className="relative mt-1.5 flex gap-2">
                      <div className="w-16 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-300 border border-slate-700 shrink-0">
                        {currentCountryConfig.phoneCode}
                      </div>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setIsMobileVerified(false);
                        }}
                        className="bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                        required
                      />
                      {isMobileVerified ? (
                        <div className="h-10 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => {
                            setIsVerifyingMobile(true);
                            setTimeout(() => {
                              setIsVerifyingMobile(false);
                              setIsMobileVerified(true);
                            }, 1000);
                          }}
                          disabled={isVerifyingMobile || phone.length < 7}
                          className="h-10 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0"
                        >
                          {isVerifyingMobile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Set Security Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" /> Residential & Communication Address
                  </h3>
                  <p className="text-xs text-slate-400">Used for official KYC verification and medical dispatch kits.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-xs text-slate-300">Flat / House No / Building Name *</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Flat 402, Sunshine Heights, Hill Road"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">Street / Road / Sector</Label>
                    <Input
                      type="text"
                      placeholder="e.g. SV Road, Bandra West"
                      value={addressLineTwo}
                      onChange={(e) => setAddressLineTwo(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">Locality / Area</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Bandra"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">City *</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setServiceCity(e.target.value);
                      }}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">State / Province *</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">Postal / Pincode / Zip Code *</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 400050"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Country ID & KYC Documents */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-400" /> Identification & KYC ({selectedCountry})
                    </h3>
                    <span className="text-xs font-semibold text-teal-400 flex items-center gap-1">
                      {currentCountryConfig.flag} {selectedCountry}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Government issued identification proofs required for clinical compliance.</p>
                </div>

                <div className="space-y-4">
                  {currentCountryConfig.idRequirements.map((req) => {
                    if (req.type === 'text') {
                      return (
                        <div key={req.key}>
                          <Label className="text-xs text-slate-300">{req.label} *</Label>
                          <Input
                            type="text"
                            placeholder={req.placeholder || 'Enter ID number'}
                            value={idTextValues[req.key] || ''}
                            onChange={(e) =>
                              setIdTextValues({ ...idTextValues, [req.key]: e.target.value })
                            }
                            className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500 font-mono tracking-wider"
                            required
                          />
                        </div>
                      );
                    }

                    // Document Upload File Component
                    const currentDoc = idDocFiles[req.key];
                    return (
                      <div
                        key={req.key}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{req.label}</div>
                            <div className="text-[10px] text-slate-400">
                              {currentDoc?.name ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> {currentDoc.name}
                                </span>
                              ) : (
                                'PDF, JPG or PNG (Max 10MB)'
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-teal-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
                            <Upload className="w-3.5 h-3.5 text-teal-400" />
                            {currentDoc ? 'Replace' : 'Upload File'}
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setIdDocFiles({
                                    ...idDocFiles,
                                    [req.key]: { file: f, name: f.name, url: URL.createObjectURL(f) },
                                  });
                                }
                              }}
                            />
                          </label>
                          {currentDoc && (
                            <button
                              type="button"
                              onClick={() => {
                                const copy = { ...idDocFiles };
                                delete copy[req.key];
                                setIdDocFiles(copy);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Details...
                    </>
                  ) : (
                    <>
                      Continue to Qualifications <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PROFESSIONAL QUALIFICATIONS & CLINICAL ACCREDITATION              */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Professional Role Selection */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-teal-400" /> Primary Healthcare Profession
                  </h3>
                  <p className="text-xs text-slate-400">Select your licensed discipline.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(ROLE_DETAILS_CONFIG).map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => {
                        setProfessionalRole(role);
                        const roleCfg = ROLE_DETAILS_CONFIG[role];
                        if (roleCfg) {
                          setQualification(roleCfg.qualifications[0]);
                          setSpecializations([roleCfg.specializations[0] || 'General']);
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        professionalRole === role
                          ? 'bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Stethoscope className={`w-5 h-5 ${professionalRole === role ? 'text-teal-400' : 'text-slate-500'}`} />
                        {professionalRole === role && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                      </div>
                      <div className="text-xs font-bold text-white">{role}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Degrees, Specializations, Experience */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-teal-400" /> Qualifications & Years of Experience
                  </h3>
                  <p className="text-xs text-slate-400">Degrees, specialization tracks and clinical experience options.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-300">Highest Clinical Qualification *</Label>
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full mt-1.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl p-3 text-xs focus:border-teal-500 focus:outline-none"
                    >
                      {currentRoleConfig.qualifications.map((q) => (
                        <option key={q} value={q} className="bg-slate-900 text-white">
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">Years of Clinical Experience *</Label>
                    <select
                      value={yearOfExperience}
                      onChange={(e) => setYearOfExperience(e.target.value)}
                      className="w-full mt-1.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl p-3 text-xs focus:border-teal-500 focus:outline-none"
                    >
                      {currentRoleConfig.experienceOptions.map((exp) => (
                        <option key={exp} value={exp} className="bg-slate-900 text-white">
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specializations: Only Masters Degree and Above Have Specializations (Single Select Radio Button) */}
                {(() => {
                  const q = (qualification || '').toUpperCase();
                  const isMasters =
                    q.includes('MPT') ||
                    q.includes('MPTH') ||
                    q.includes('MOT') ||
                    q.includes('MSC') ||
                    q.includes('M.SC') ||
                    q.includes('MASTER') ||
                    q.includes('PHD') ||
                    q.includes('DPT') ||
                    q.includes('DOCTOR');

                  if (isMasters) {
                    return (
                      <div className="space-y-2 pt-1 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-slate-300 flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Postgraduate / Master's Clinical Specialization (Select One) *
                          </Label>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                            Master's Required
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          As a {qualification} specialist, select your specialized clinical branch:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
                          {currentRoleConfig.specializations.map((spec) => {
                            const isSelected = specializations.includes(spec);
                            return (
                              <button
                                type="button"
                                key={spec}
                                onClick={() => setSpecializations([spec])}
                                className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <span className="truncate">{spec}</span>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'border-teal-400 bg-teal-500' : 'border-slate-600'
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>General Clinical Practice Track</span>
                          <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                            {qualification}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Bachelor's degree graduates (e.g. BPT, BOT, BSc Nursing) practice comprehensive general care. Sub-specialization tracks are activated automatically for Post-graduate / Master's degree (MPT, MOT, MSc, PhD) holders.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Certifications Chips (if available) */}
                {currentRoleConfig.certifications && currentRoleConfig.certifications.length > 0 && (
                  <div>
                    <Label className="text-xs text-slate-300">Additional Hands-on Certifications</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentRoleConfig.certifications.map((cert) => {
                        const isSelected = certifications.includes(cert);
                        return (
                          <button
                            type="button"
                            key={cert}
                            onClick={() => toggleCertification(cert)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />} {cert}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Regulatory License & Council Information */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-teal-400" /> Regulatory License & Registration ({selectedCountry})
                  </h3>
                  <p className="text-xs text-slate-400">Medical council registration is verified with official state registry.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-300">
                      {currentCountryConfig.licenseLabel} *
                    </Label>
                    <Input
                      type="text"
                      placeholder={currentCountryConfig.licensePlaceholder}
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500 font-mono tracking-wider"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">
                      {currentCountryConfig.authorityLabel}
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Maharashtra State OTPT Council"
                      value={councilName}
                      onChange={(e) => setCouncilName(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Working Status & Modalities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Currently Working Anywhere?</span>
                      <button
                        type="button"
                        onClick={() => setCurrentlyWorking(!currentlyWorking)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                          currentlyWorking ? 'bg-teal-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            currentlyWorking ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {currentlyWorking && (
                      <Input
                        type="text"
                        placeholder="Hospital / Clinic Name"
                        value={currentlyWorkingAt}
                        onChange={(e) => setCurrentlyWorkingAt(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-xs rounded-xl"
                      />
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Carry Portable Modalities?</span>
                      <button
                        type="button"
                        onClick={() => setHasModalities(!hasModalities)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                          hasModalities ? 'bg-teal-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            hasModalities ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Portable TENS, IFT, Ultrasound, or Resistance Bands.</p>
                  </div>
                </div>

                {/* Own Clinic Toggle */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">Do you own or manage a private clinic?</span>
                      <p className="text-[11px] text-slate-400">Receive clinic consultations alongside home visits.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasOwnClinic(!hasOwnClinic)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        hasOwnClinic ? 'bg-teal-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          hasOwnClinic ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {hasOwnClinic && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Input
                        type="text"
                        placeholder="Clinic Name (e.g. Apex Physio Hub)"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-xs rounded-xl"
                      />
                      <Input
                        type="text"
                        placeholder="Establishment Year (e.g. 2021)"
                        value={clinicEstablishmentYear}
                        onChange={(e) => setClinicEstablishmentYear(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-xs rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* Service Types */}
                <div>
                  <Label className="text-xs text-slate-300">Service Channels Offered *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Home Visit', 'Clinic Visit', 'Telehealth'].map((st) => {
                      const isSelected = serviceTypes.includes(st);
                      return (
                        <button
                          type="button"
                          key={st}
                          onClick={() => toggleServiceType(st)}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />} {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Professional Document Uploads */}
                <div className="space-y-3 pt-2">
                  <Label className="text-xs text-slate-300">Accreditation Document Uploads</Label>

                  {[
                    { key: 'regCert', label: 'Medical Council Registration Certificate' },
                    { key: 'degreeCert', label: 'Degree Certificate (BPT / MPT / MD)' },
                    { key: 'cvResume', label: 'Curriculum Vitae (CV / Resume)' },
                  ].map((doc) => {
                    const uploaded = profDocs[doc.key];
                    return (
                      <div
                        key={doc.key}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{doc.label}</div>
                            <div className="text-[10px] text-slate-400">
                              {uploaded?.name ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> {uploaded.name}
                                </span>
                              ) : (
                                'PDF, JPG or PNG (Max 10MB)'
                              )}
                            </div>
                          </div>
                        </div>

                        <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-teal-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-teal-400" />
                          {uploaded ? 'Replace' : 'Upload File'}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setProfDocs({
                                  ...profDocs,
                                  [doc.key]: { file: f, name: f.name, url: URL.createObjectURL(f) },
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                    );
                  })}

                  {/* Extra Certifications Dynamic Uploads */}
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Additional Clinical Certifications Upload (Optional)
                      </Label>
                    </div>

                    {extraCertDocs.map((extra, idx) => (
                      <div
                        key={extra.id}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in"
                      >
                        <div className="flex-1 w-full sm:w-auto">
                          <Input
                            type="text"
                            placeholder="Certification Title (e.g. Dry Needling / McKenzie)"
                            value={extra.label}
                            onChange={(e) => {
                              const updated = [...extraCertDocs];
                              updated[idx].label = e.target.value;
                              setExtraCertDocs(updated);
                            }}
                            className="bg-slate-900 border-slate-700 text-xs rounded-xl text-white"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-teal-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
                            <Upload className="w-3.5 h-3.5 text-teal-400" />
                            {extra.name ? <span className="max-w-[120px] truncate">{extra.name}</span> : 'Upload File'}
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  const updated = [...extraCertDocs];
                                  updated[idx].file = f;
                                  updated[idx].name = f.name;
                                  updated[idx].url = URL.createObjectURL(f);
                                  setExtraCertDocs(updated);
                                }
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setExtraCertDocs(extraCertDocs.filter((_, i) => i !== idx));
                            }}
                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setExtraCertDocs([
                          ...extraCertDocs,
                          { id: String(Date.now()), label: '', name: '', url: '' },
                        ]);
                      }}
                      className="w-full py-2.5 rounded-2xl border-dashed border-teal-500/40 text-teal-300 hover:bg-teal-500/10 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Another Certification File
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  className="px-6 py-3 rounded-2xl border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Qualifications...
                    </>
                  ) : (
                    <>
                      Continue to Banking <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: BANK & PAYOUT SETUP                                               */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-teal-400" /> Direct Bank & Payout Setup ({selectedCountry})
                    </h3>
                    <span className="text-xs font-semibold text-teal-400 flex items-center gap-1">
                      {currentCountryConfig.flag} {selectedCountry}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Payouts are credited directly to your bank account via instant IMPS / wire transfer.
                  </p>
                </div>

                {/* Account Type Selection */}
                <div>
                  <Label className="text-xs text-slate-300">Account Type *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    {['Savings', 'Current'].map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setAccountType(type)}
                        className={`py-3 px-4 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          accountType === type
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {accountType === type && <Check className="w-3.5 h-3.5 text-teal-400" />}{' '}
                        {type === 'Savings' ? 'Individual / Savings Account' : 'Current / Business Account'}
                      </button>
                    ))}
                  </div>
                </div>

                {accountType === 'Current' && (
                  <div>
                    <Label className="text-xs text-slate-300">Registered Business / Clinic Name *</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Apex Health Ventures LLP"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>
                )}

                {/* Dynamic Country Banking Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCountryConfig.banking.fields.map((f) => (
                    <div key={f.id} className={f.id === 'accountNumber' || f.id === 'accountHolderName' ? 'md:col-span-2' : ''}>
                      <Label className="text-xs text-slate-300">
                        {f.label} {f.isMandatory !== false && '*'}
                      </Label>
                      <Input
                        type="text"
                        placeholder={f.hint}
                        value={bankFieldValues[f.id] || ''}
                        onChange={(e) =>
                          setBankFieldValues({ ...bankFieldValues, [f.id]: e.target.value })
                        }
                        className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500 font-mono"
                        required={f.isMandatory !== false}
                      />
                    </div>
                  ))}

                  {/* Tax Field */}
                  {currentCountryConfig.banking.taxField && (
                    <div className="md:col-span-2">
                      <Label className="text-xs text-slate-300">
                        {currentCountryConfig.banking.taxField.label} *
                      </Label>
                      <Input
                        type="text"
                        placeholder={currentCountryConfig.banking.taxField.hint}
                        value={bankFieldValues[currentCountryConfig.banking.taxField.id] || ''}
                        onChange={(e) =>
                          setBankFieldValues({
                            ...bankFieldValues,
                            [currentCountryConfig.banking.taxField!.id]: e.target.value,
                          })
                        }
                        className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500 font-mono tracking-wider uppercase"
                        required
                      />
                    </div>
                  )}
                </div>

                {currentCountryConfig.banking.note && (
                  <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{currentCountryConfig.banking.note}</span>
                  </div>
                )}

                {/* Cancelled Cheque / Bank Proof Document Upload */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{currentCountryConfig.banking.verificationDocLabel}</div>
                      <div className="text-[10px] text-slate-400">
                        {bankDoc?.name ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> {bankDoc.name}
                          </span>
                        ) : (
                          'PDF, JPG or PNG (Must clearly show Account Number & IFSC / Name)'
                        )}
                      </div>
                    </div>
                  </div>

                  <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-teal-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    {bankDoc ? 'Replace' : 'Upload Proof'}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setBankDoc({ file: f, name: f.name, url: URL.createObjectURL(f) });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-2xl border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Banking...
                    </>
                  ) : (
                    <>
                      Continue to Service Area <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: SERVICE TERRITORY & COMMUTE                                       */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Estimated Monthly Earning Card */}
              {(() => {
                const earning = EARNINGS_ESTIMATES[selectedCountry] || EARNINGS_ESTIMATES.India;
                return (
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 border border-teal-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                          Estimated Monthly Earning
                        </span>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> High Demand
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-outfit">
                        {earning.range}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {earning.subtitle}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center sm:text-right space-y-0.5 shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Settlement Model</span>
                      <span className="text-xs font-bold text-teal-300">60% Revenue Share + IMPS</span>
                    </div>
                  </div>
                );
              })()}

              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" /> Operational Territory & Pincodes
                  </h3>
                  <p className="text-xs text-slate-400">Define the cities and pincodes where you will accept visits.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-300">Primary Operating City *</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={serviceCity}
                      onChange={(e) => setServiceCity(e.target.value)}
                      className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300 flex items-center justify-between">
                      <span>Maximum Travel Radius</span>
                      <span className="text-teal-400 font-bold">{serviceRadius} km</span>
                    </Label>
                    <input
                      type="range"
                      min={2}
                      max={50}
                      step={1}
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(Number(e.target.value))}
                      className="w-full mt-3 accent-teal-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                      <span>2 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>

                {/* Target Pincodes Chips */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Operational Target Pincodes / Postal Codes *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit Pincode (e.g. 400050)"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPincode();
                        }
                      }}
                      className="bg-slate-950/80 border-slate-800 text-white rounded-xl text-xs font-mono"
                    />
                    <Button
                      type="button"
                      onClick={handleAddPincode}
                      className="rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {targetPincodes.map((pin) => (
                      <span
                        key={pin}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/90 text-teal-300 border border-slate-700 text-xs font-mono flex items-center gap-2 shadow-sm"
                      >
                        {pin}
                        <button
                          type="button"
                          onClick={() => setTargetPincodes(targetPincodes.filter((p) => p !== pin))}
                          className="hover:text-rose-400 text-slate-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Service Areas Chips */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Covered Localities / Neighborhoods</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. Bandra West, Santacruz, Khar"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddArea();
                        }
                      }}
                      className="bg-slate-950/80 border-slate-800 text-white rounded-xl text-xs"
                    />
                    <Button
                      type="button"
                      onClick={handleAddArea}
                      className="rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4"
                    >
                      <Plus className="w-4 h-4" /> Add Area
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {serviceAreas.map((ar) => (
                      <span
                        key={ar}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700 text-xs flex items-center gap-2 shadow-sm"
                      >
                        {ar}
                        <button
                          type="button"
                          onClick={() => setServiceAreas(serviceAreas.filter((a) => a !== ar))}
                          className="hover:text-rose-400 text-slate-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Commute & Capacity Matrix */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-teal-400" /> Commute & Travel Capacity
                  </h3>
                  <p className="text-xs text-slate-400">Set transportation modes and daily patient appointment limits.</p>
                </div>

                {/* Commute Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COMMUTE_OPTIONS.map((c) => {
                    const isSelected = commuteType === c.id;
                    const IconComp = c.icon;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCommuteType(c.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <IconComp className={`w-5 h-5 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                        </div>
                        <div className="text-xs font-bold text-white">{c.label}</div>
                        <div className="text-[10px] text-slate-400">{c.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Driving License Input if Vehicle Selected */}
                {(commuteType.includes('Two Wheeler') || commuteType.includes('Four Wheeler')) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs text-slate-300">Driving License Number *</Label>
                      <Input
                        type="text"
                        placeholder="e.g. MH-02-2021-0012345"
                        value={drivingLicenseNumber}
                        onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                        className="mt-1.5 bg-slate-950/80 border-slate-800 text-white rounded-xl focus:border-teal-500 font-mono"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white">Driving License Document *</div>
                        <div className="text-[10px] text-slate-400">
                          {drivingLicenseDoc?.name ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> {drivingLicenseDoc.name}
                            </span>
                          ) : (
                            'Upload DL Front/Back'
                          )}
                        </div>
                      </div>

                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-teal-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-teal-400" />
                        {drivingLicenseDoc ? 'Replace' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setDrivingLicenseDoc({ file: f, name: f.name, url: URL.createObjectURL(f) });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Capacity & Max Distance Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label className="text-xs text-slate-300">Daily Visit Capacity *</Label>
                    <select
                      value={travelCapacity}
                      onChange={(e) => setTravelCapacity(e.target.value)}
                      className="w-full mt-1.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl p-3 text-xs focus:border-teal-500 focus:outline-none"
                    >
                      {DAILY_CAPACITY_OPTIONS.map((cap) => (
                        <option key={cap} value={cap} className="bg-slate-900 text-white">
                          {cap}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300 flex items-center justify-between">
                      <span>Max Distance Per Visit *</span>
                      <span className="text-teal-400 font-bold">{maxDistancePerVisit} km</span>
                    </Label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={maxDistancePerVisit}
                      onChange={(e) => setMaxDistancePerVisit(Number(e.target.value))}
                      className="w-full mt-3 accent-teal-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                      <span>5 km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                </div>

                {/* Travel Time Preference Selectable Chips */}
                <div>
                  <Label className="text-xs text-slate-300">Travel Time Preference *</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { id: 'Morning Focus (8:00 AM – 2:00 PM)', label: 'Morning', icon: '☀️' },
                      { id: 'Evening Focus (3:00 PM – 9:00 PM)', label: 'Evening', icon: '🌙' },
                      { id: 'Flexible / Anytime (8:00 AM – 9:00 PM)', label: 'Anytime', icon: '⚡' },
                    ].map((pref) => {
                      const isSelected = travelTimePreference.includes(pref.label) || travelTimePreference === pref.id;
                      return (
                        <button
                          type="button"
                          key={pref.id}
                          onClick={() => setTravelTimePreference(pref.id)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-lg mb-1">{pref.icon}</div>
                          <div className="text-xs font-bold">{pref.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Urgent Visits Acceptance */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" /> Accept Urgent / Emergency Same-day Visits?
                    </span>
                    <p className="text-[11px] text-slate-400">Emergency visits carry a +30% surge surcharge credited directly to you.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUrgentVisits(!urgentVisits)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      urgentVisits ? 'bg-teal-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        urgentVisits ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Step 4 Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-2xl border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Territory...
                    </>
                  ) : (
                    <>
                      Review & Generate Digital ID <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: REVIEW, DIGITAL ID PREVIEW & COMPLIANCE SIGN-OFF                  */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Digital ID Preview Card */}
              <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-teal-950/30 border border-teal-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-teal-500/40 bg-slate-800 relative shadow-xl">
                      {profilePhotoUrl ? (
                        <Image
                          src={profilePhotoUrl}
                          alt="ID Photo"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <User className="w-10 h-10 text-slate-500 m-auto mt-7" />
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                          {user?.ariesId || `AX-${selectedCountry.slice(0, 3).toUpperCase()}-${String(phone).slice(-4)}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED PRACTITIONER
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white">{fullName || 'Practitioner Name'}</h2>
                      <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-400" /> {professionalRole} • {qualification}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Council Reg: {licenseNumber || 'Under Review'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden border border-[#FFD700]/50 shadow-md">
                      <Image
                        src="/aries-gold-emblem.png"
                        alt="Aries Gold Emblem"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center space-y-1">
                      <QrCode className="w-12 h-12 text-white m-auto" />
                      <span className="text-[9px] font-mono text-teal-300 tracking-wider uppercase block">
                        Digital ID
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Review Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal & Address */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-400" /> Personal & Contact
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)}
                      className="text-[11px] text-teal-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <div><span className="text-slate-500">Phone:</span> {phone}</div>
                    <div><span className="text-slate-500">Email:</span> {email}</div>
                    <div><span className="text-slate-500">Gender:</span> {gender} • DOB: {dob ? dob.split('T')[0] : 'N/A'}</div>
                    <div><span className="text-slate-500">Address:</span> {streetAddress}, {city}, {stateVal} - {zipCode}</div>
                  </div>
                </div>

                {/* Professional & Qualifications */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-400" /> Professional Setup
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] text-teal-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <div><span className="text-slate-500">Role:</span> {professionalRole} ({qualification})</div>
                    <div><span className="text-slate-500">Experience:</span> {yearOfExperience}</div>
                    <div><span className="text-slate-500">Specializations:</span> {specializations.join(', ')}</div>
                    <div><span className="text-slate-500">Services:</span> {serviceTypes.join(', ')}</div>
                  </div>
                </div>

                {/* Bank Account */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-teal-400" /> Banking & Payouts
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] text-teal-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <div><span className="text-slate-500">Holder:</span> {bankFieldValues.accountHolderName || fullName}</div>
                    <div><span className="text-slate-500">Bank:</span> {bankFieldValues.bankName || 'Direct IMPS Account'}</div>
                    <div><span className="text-slate-500">Account:</span> ••••••••{String(bankFieldValues.accountNumber).slice(-4)}</div>
                    {bankFieldValues.ifscCode && <div><span className="text-slate-500">IFSC:</span> {bankFieldValues.ifscCode}</div>}
                    {bankFieldValues.upiId && <div><span className="text-slate-500">UPI:</span> {bankFieldValues.upiId}</div>}
                  </div>
                </div>

                {/* Territory */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" /> Service Territory
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] text-teal-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <div><span className="text-slate-500">City:</span> {serviceCity} (Radius: {serviceRadius} km)</div>
                    <div><span className="text-slate-500">Pincodes:</span> {targetPincodes.join(', ')}</div>
                    <div><span className="text-slate-500">Commute:</span> {commuteType}</div>
                    <div><span className="text-slate-500">Capacity:</span> {travelCapacity}</div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* REGISTRATION & VERIFICATION FEE CARD (MOBILE PARITY)                      */}
              {/* ========================================================================= */}
              {(() => {
                const feeConfig = REGISTRATION_FEES[selectedCountry] || REGISTRATION_FEES.India;
                return (
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-slate-950/90 border-2 border-amber-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Verification & Credential Fee
                          </span>
                          {isFeePaid ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : isFeeWaived ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> WAIVED
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white font-outfit">
                          {feeConfig.symbol} {feeConfig.amount} <span className="text-xs text-amber-300/80 font-normal font-sans">one-time</span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isFeePaid && !isFeeWaived && (
                          <>
                            <Button
                              type="button"
                              onClick={() => {
                                setIsPayingFee(true);
                                setTimeout(() => {
                                  setIsPayingFee(false);
                                  setIsFeePaid(true);
                                }, 1200);
                              }}
                              disabled={isPayingFee}
                              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                            >
                              {isPayingFee ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CreditCard className="w-3.5 h-3.5" />
                              )}
                              <span>Pay Online</span>
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsFeeWaived(true)}
                              className="px-4 py-2.5 rounded-2xl border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                            >
                              Apply Waiver
                            </Button>
                          </>
                        )}

                        {(isFeePaid || isFeeWaived) && (
                          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>{isFeePaid ? 'Payment Confirmed' : 'Legacy Waiver Applied'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
                      {feeConfig.desc}
                    </p>
                  </div>
                );
              })()}

              {/* Compliance & Declarations */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" /> Clinical Compliance, Terms & Safety Declarations
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsLegalModalOpen(true)}
                    className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Policies
                  </button>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTermsAndPolicies}
                    onChange={(e) => setAgreeTermsAndPolicies(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLegalModalOpen(true);
                      }}
                      className="text-teal-400 font-bold hover:underline"
                    >
                      AriesXpert Terms of Service, Privacy Policy & Fee Schedule
                    </button>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeClinicalGuidelines}
                    onChange={(e) => setAgreeClinicalGuidelines(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I agree to adhere strictly to the AriesXpert Clinical Code of Conduct, Patient Privacy (HIPAA/DISHA)
                    guidelines, and maintain professional hygiene standards during doorstep visits.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeDoorstepSafety}
                    onChange={(e) => setAgreeDoorstepSafety(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I acknowledge that I possess required portable medical diagnostic kits and agree to follow
                    zero-tolerance patient safety protocols at all times.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationTrue}
                    onChange={(e) => setDeclarationTrue(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I hereby declare that all information, certificates, license numbers, and banking details submitted
                    are authentic and accurate to the best of my knowledge.
                  </span>
                </label>
              </div>

              {/* Step 5 Final Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-2xl border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-2xl shadow-teal-500/30 flex items-center gap-2 transform hover:scale-[1.02] transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting for Approval...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 font-bold" /> Complete & Submit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* ── Pending Review Success Screen (Mobile Parity) ── */}
        {isSubmittedSuccess && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500 text-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-teal-500/20">
                <ShieldCheck className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white font-outfit">
                  Profile Submitted for Review!
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your clinical credentials, registration council certificate, and background check data have been submitted to the medical compliance team. Expected review time: 24–48 hours.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => router.push('/')}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-teal-500/30"
              >
                RETURN TO HOME
              </Button>
            </div>
          </div>
        )}

        {/* ── Legal Policies Modal Instance ──────────────── */}
        <LegalPoliciesModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          onAccept={() => setAgreeTermsAndPolicies(true)}
          country={selectedCountry}
        />
      </main>
    </div>
  );
}
