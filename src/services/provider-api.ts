/**
 * AriesXpert Provider API Service
 * 
 * Exact 1:1 match with mobile application (ariesxpertv2) ApiService and
 * ariesxpert-backend canonical endpoints.
 * Persists all registrations, onboarding steps, clinical SOAP forms, and visit finalization
 * to the central MongoDB database.
 */

import {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  ApiError,
  unwrap,
  unwrapList,
  readToken,
  writeToken,
  clearStoredToken,
} from './api-transport';
import { getBackendOrigin } from '@/lib/backend-api-config';

/**
 * Request prefix for mobile-shaped paths.
 *
 * In the browser this is empty so every call stays same-origin and is forwarded by the
 * Next route handlers in `src/app/api/{app,admin,v1}/[...path]/route.ts` — the browser
 * cannot call `api.ariesxpert.com` directly without tripping CORS. On the server the
 * backend origin is used directly. Either way the path that reaches the backend is
 * byte-identical to the one the Flutter app sends.
 */
const API_BASE_URL = typeof window !== 'undefined' ? '' : getBackendOrigin();

import { BUILTIN_34_ASSESSMENT_FORMS } from './assessment-forms-data';
export { BUILTIN_34_ASSESSMENT_FORMS };

export interface LeadBroadcast {
  id: string;
  leadId?: string;
  broadcastListingId?: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  age: number;
  gender: string;
  condition: string;
  packageType: string;
  serviceType?: string;
  sessionsCount: number;
  location: string;
  locality?: string;
  address?: string;
  city: string;
  pincode: string;
  distanceKm: number;
  estimatedFee: number;
  sessionFee?: number;
  payoutAmount?: number;
  urgency: 'HIGH' | 'MEDIUM' | 'SCHEDULED' | 'HIGH_DEMAND' | 'URGENT';
  expiresInSeconds: number;
  scheduledTime: string;
  scheduledDate?: string;
}

export interface WalletLedgerEntry {
  id: string;
  transactionId: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'VISIT_PAYOUT' | 'REFERRAL_BONUS' | 'WITHDRAWAL' | 'REWARD' | 'ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface MobileExpertProfile {
  _id: string;
  id?: string;
  fullName?: string;
  name?: string; // alias for fullName
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  email?: string;
  phone?: string;
  mobileNo?: string;
  mobileNumber?: string; // alias for phone
  isMobileNumberVerified?: boolean;
  isVerified?: boolean;
  countryCode?: string;
  countryName?: string;
  streetAddress?: string;
  addressLineTwo?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  area?: string;
  aadharNumber?: string;
  profilePhoto?: string;
  profileImageUrl?: string;
  profileImage?: string;
  panCard?: string;
  aadharCard?: string;
  aadharCardBack?: string;
  licenseNumber?: string;
  specialization?: string;
  designation?: string;
  ariesId?: string;
  degreeCertificateUrl?: string;
  registrationCertificateUrl?: string;
  experience?: number;
  totalVisits?: number;
  coins?: number;
  servicePincodes?: string[];
  serviceAreas?: string[];
  targetPincodes?: string[];

  // Step 1: Professional Info
  professionalInfo?: {
    professionalRole?: string;
    qualification?: string;
    specializations?: string[];
    yearOfExperience?: string | number;
    currentlyWorkingAt?: string;
    serviceTypes?: string[];
    hasModalities?: boolean;
    hasOwnClinic?: boolean;
    clinicName?: string;
    clinicEstablishmentMonth?: string;
    clinicEstablishmentYear?: string;
    registrationCertificate?: string;
    degreeCertificate?: string;
    cvResume?: string;
    extraCertifications?: string[];
  };

  // Step 2: Bank Info
  bankInfo?: {
    accountType?: string;
    businessName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    upiId?: string;
    panNumber?: string;
    cancelledCheque?: string;
  };

  // Step 3: Area of Service Info
  areaOfServiceInfo?: {
    city?: string;
    serviceAreas?: string[];
    pincode?: string;
    targetPincodes?: string[];
    serviceRadius?: number;
    commuteType?: string;
    travelCapacity?: string;
    urgentVisits?: boolean;
    maxDistance?: number;
    travelTimePreference?: string;
    drivingLicenseNumber?: string;
    drivingLicense?: string;
  };

  onboardingStep?: number; // 0: Personal, 1: Professional, 2: Banking, 3: Area, 4: Review, 5: Done
  onboardingStatus?: 'UNDER_REVIEW' | 'APPROVED' | 'INCOMPLETE' | 'REJECTED' | 'pending' | 'approved';
  status?: 'Pending' | 'Approved' | 'Active' | 'Rejected' | 'Incomplete' | 'ACTIVE' | 'UNDER_REVIEW';
  isTherapistActive?: boolean;
  isProfileActive?: boolean;
  isTherapistSOS?: boolean;
  yearsOfExperience?: string;
  walletBalance?: number;
  walletAmount?: number;  // server-side alias
  walletStatus?: string;
  totalEarnings?: number;
  completedVisitsCount?: number;
  axId?: string;
  therapistId?: string;  // server-side alias for _id
  uid?: string;          // server-side alias for _id
  rating?: number;
  totalReviews?: number;
  monthlyTargets?: Array<{ month: number; year: number; target: number; achieved: number }>;

  // ── Fields the mobile `UserModel` reads off the therapist record / therapistProfile.
  // Without these the parity app cannot render the target tracker, badges, scores and
  // notification preferences that the mobile app shows. (ariesxpertv2 user_model.dart)
  totalEarning?: number; // server field name; `totalEarnings` is the alias
  memberSince?: string;
  createdAt?: string;
  qualification?: string;
  currentlyWorkingAt?: string;
  serviceTypes?: string[];
  hasModalities?: boolean;
  hasOwnClinic?: boolean;
  clinicName?: string;
  clinicId?: string;

  // Targets & performance (mobile reads these from `therapistProfile`)
  monthlyVisitTarget?: number;
  monthlyVisitAchievement?: number;
  visitTargetProgress?: number;
  monthlyTargetEarnings?: number;
  monthlyCurrentEarnings?: number;
  monthlyEarningsGap?: number;
  isTargetAiAdjusted?: boolean;
  therapistOpportunityScore?: number;
  therapistHappinessScore?: number;
  badges?: string[];
  cityRankPercentile?: number;
  qaScoreAverage?: number;

  // Settings parity (mobile settings screen)
  enablePushNotification?: boolean;
  enableEmailNotification?: boolean;
  enableWhatsAppNotification?: boolean;
  enableSMSNotification?: boolean;
  notificationTone?: string;
  quietHoursFrom?: string;
  quietHoursTo?: string;
  isQuietHoursEnabled?: boolean;
  isProfileVisible?: boolean;
  isActivityTracking?: boolean;

  // Onboarding tour parity
  onboardingTourCompleted?: boolean;
  onboardingTourCompletedAt?: string;
  onboardingTourViewCount?: number;

  // KYC document URLs the mobile document vault renders
  aadharCardUrl?: string;
  aadharCardBackUrl?: string;
  panCardUrl?: string;
  cvResumeUrl?: string;
  extraCertificationsUrls?: string[];
  drivingLicenseNumber?: string;
  drivingLicenseUrl?: string;
  bankCancelledChequeUrl?: string;
  bankStatementUrl?: string;
  bankVerificationLetterUrl?: string;
  passportOrBrpUrl?: string;
  personalausweisUrl?: string;
  anmeldungDocumentUrl?: string;
  emiratesIdUrl?: string;
  passportVisaUrl?: string;
  governmentPhotoIdUrl?: string;
  ssnNumber?: string;
  nationalInsuranceNumber?: string;
}

export interface DynamicQuestion {
  _id: string;
  questionText: string;
  questionType:
    | 'text'
    | 'longText'
    | 'number'
    | 'singleChoice'
    | 'multipleChoice'
    | 'date'
    | 'scale'
    | 'boolean'
    | 'lineBreak'
    | 'header'
    | 'dropdown';
  required?: boolean;
  order?: number;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  group?: string;
  placeholder?: string;
  suffix?: string;
}

export interface DynamicAssessmentForm {
  _id: string;
  title: string;
  description?: string;
  treatmentType?: string;
  visitType?: 'First Visit' | 'Regular Visit' | 'first_visit' | 'regular_visit' | 'follow_up' | string;
  questions: DynamicQuestion[];
  isActive?: boolean;
}

export interface AssessmentResponsePayload {
  assessmentId: string;
  assessmentTitle: string;
  assessmentDescription?: string;
  treatmentType?: string;
  visitType?: string;
  appointmentId: string;
  patient?: string;
  expert?: string;
  therapyStartTime?: string;
  therapyEndTime?: string;
  questions: Array<{
    _id: string;
    questionText: string;
    questionType: string;
    answer: any;
    group?: string;
  }>;
}

export interface SOAPClinicalAssessment {
  chiefComplaint: string;
  mechanismOfInjury: string;
  vasPainScore: number; // 0-10
  painNature: string; // 'Throbbing' | 'Dull Ache' | 'Burning' | 'Stabbing' | 'Stiff'
  aggravatingFactors: string;
  relievingFactors: string;
  rangeOfMotion: string;
  muscleStrengthMMT: string; // 'Grade 0' to 'Grade 5'
  specialTests: string;
  palpationFindings: string;
  clinicalDiagnosis: string;
  rehabPhase: string; // 'Acute (0-2 wks)' | 'Subacute (2-6 wks)' | 'Functional Return'
  treatmentProvided: string[];
  selectedAddOns: string[]; // 'Cupping' | 'Needling' | 'IASTM' | 'Kinesology Tapeing'
  customAddOnName?: string;
  customAddOnAmount?: number;
  homeExercisePrescription: string;
  therapistNotes: string;
}

export interface FinalizeVisitPayload {
  appointmentId: string;
  paymentMethod: 'cash' | 'upi_qr' | 'online' | string;
  totalAmount: number;
  expertId?: string;
  patientId?: string;
  sessionFee?: number;
  addOnFees?: number;
  isPaymentCollected?: boolean;
  selectedAddOns?: string[];
  soapNotes?: SOAPClinicalAssessment;
  completedAt?: string;
  addOns?: string[];
  packageId?: string;
  packageName?: string;
}

class ProviderApiService {
  public getToken(): string | null {
    return readToken();
  }

  public saveToken(token: string) {
    writeToken(token);
  }

  public clearToken() {
    clearStoredToken();
  }

  private getHeaders(isMultipart = false): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // ==========================================
  // AUTH & ONBOARDING ENDPOINTS (REAL MONGODB BACKEND)
  // ==========================================

  /**
   * POST /api/app/expert/sendOrResendOTPtoUser
   * Same body as `ApiService.sendOrResendOTPtoUser` / `expertLoginFromMobile`.
   */
  public async sendOTP(mobileNo: string): Promise<{ success: boolean; message?: string; code?: string }> {
    const cleanMobile = mobileNo.replace(/\D/g, '').slice(-10);
    const res = await apiPost('/api/app/expert/sendOrResendOTPtoUser', {
      mobileNo: cleanMobile,
      cc: '91',
    });
    return {
      success: res.success !== false,
      message: res.message || `Verification code sent to +91 ${cleanMobile}`,
      code: (res as any).code,
    };
  }

  /**
   * POST /api/app/expert/verifyOTPofUser
   *
   * On success the backend returns the JWT and the expert document — the same pair the
   * mobile app stores. There is deliberately no offline fallback: minting a local
   * session would produce a signed-in UI with no backend data behind it, which is
   * exactly the drift this app exists to avoid.
   */
  public async verifyOTP(
    mobileNo: string,
    otp: string
  ): Promise<{ success: boolean; token?: string; result?: MobileExpertProfile; message?: string }> {
    const cleanMobile = mobileNo.replace(/\D/g, '').slice(-10);
    const res = await apiPost('/api/app/expert/verifyOTPofUser', {
      mobileNo: cleanMobile,
      otp,
    });

    const token =
      (res as any).accessToken ||
      (res as any).token ||
      (res as any).result?.token ||
      (res as any).result?.accessToken;

    if (token) this.saveToken(token);

    if (res.success === false) {
      return { success: false, message: res.message || 'That verification code was not accepted.' };
    }

    const expert =
      (res as any).expert ||
      (res as any).result?.expert ||
      ((res as any).result && typeof (res as any).result === 'object' && (res as any).result._id
        ? (res as any).result
        : null);

    return {
      success: true,
      token,
      result: expert ? this.normalizeExpertProfile(expert, cleanMobile) : undefined,
      message: res.message || 'OTP verified successfully',
    };
  }

  public normalizeExpertProfile(expert: any, fallbackPhone?: string): MobileExpertProfile {
    if (!expert || typeof expert !== 'object') {
      return {
        _id: 'exp_' + (fallbackPhone || 'user'),
        phone: fallbackPhone || '',
        status: 'Active',
      };
    }

    const cleanMobile = (expert.phone || expert.mobileNo || fallbackPhone || '').replace(/\D/g, '').slice(-10);
    const hasCompleted =
      expert.onboardingStatus === 'completed' ||
      expert.status === 'Approved' ||
      expert.isProfileActive === true ||
      (expert.onboardingStep !== undefined && expert.onboardingStep >= 4 && (expert.licenseNumber || expert.professionalInfo?.registrationCertificate));

    const pInfo = expert.professionalInfo || {};
    const bInfo = expert.bankInfo || {};
    const aInfo = expert.areaOfServiceInfo || {};

    // Mobile's `UserModel.fromJson` reads targets, scores and badges off the nested
    // `therapistProfile` document, falling back to the root when the backend has
    // already flattened it. Without this the parity app renders empty targets while
    // the mobile app shows real ones.
    const tProfile =
      expert.therapistProfile && typeof expert.therapistProfile === 'object'
        ? expert.therapistProfile
        : expert;

    const toBool = (value: any, fallback: boolean): boolean => {
      if (value === undefined || value === null) return fallback;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return !!value;
    };
    const toNum = (value: any): number | undefined => {
      const n = Number(value);
      return Number.isFinite(n) ? n : undefined;
    };
    const notif = expert.settings?.notifications || expert.notifications || {};

    const regCertUrl = pInfo.registrationCertificate?.url || (typeof pInfo.registrationCertificate === 'string' ? pInfo.registrationCertificate : expert.registrationCertificateUrl || expert.registrationCertificate);
    const degCertUrl = pInfo.degreeCertificate?.url || (typeof pInfo.degreeCertificate === 'string' ? pInfo.degreeCertificate : expert.degreeCertificateUrl || expert.degreeCertificate);
    const cvUrl = pInfo.cvResume?.url || (typeof pInfo.cvResume === 'string' ? pInfo.cvResume : expert.cvResumeUrl || expert.cvResume);

    const extraCerts: string[] = [];
    if (Array.isArray(pInfo.extraCertifications)) {
      for (const c of pInfo.extraCertifications) {
        if (typeof c === 'string') extraCerts.push(c);
        else if (c && c.url) extraCerts.push(c.url);
      }
    } else if (Array.isArray(expert.extraCertifications)) {
      for (const c of expert.extraCertifications) {
        if (typeof c === 'string') extraCerts.push(c);
        else if (c && c.url) extraCerts.push(c.url);
      }
    }

    const chequeUrl = bInfo.cancelledCheque?.url || (typeof bInfo.cancelledCheque === 'string' ? bInfo.cancelledCheque : expert.cancelledCheque);
    const statementUrl = bInfo.bankStatement?.url || (typeof bInfo.bankStatement === 'string' ? bInfo.bankStatement : expert.bankStatement);
    const letterUrl = bInfo.bankVerificationLetter?.url || (typeof bInfo.bankVerificationLetter === 'string' ? bInfo.bankVerificationLetter : expert.bankVerificationLetter);

    const licenseDocUrl = aInfo.drivingLicense?.url || (typeof aInfo.drivingLicense === 'string' ? aInfo.drivingLicense : expert.drivingLicenseUrl || expert.drivingLicense);

    return {
      _id: expert._id || expert.id || ('exp_' + cleanMobile),
      id: expert._id || expert.id,
      // Mobile's `UserModel` resolves `therapistId` from the nested therapistProfile,
      // falling back to the root `_id`. The socket room (`therapist-<id>`) and every
      // `{ expert | therapist }` request body key off this id.
      therapistId:
        (expert.therapistProfile?._id || expert.therapistProfile?.id || expert.therapistId || expert._id || expert.id)?.toString(),
      uid: (expert.uid || expert._id || expert.id)?.toString(),
      fullName: expert.fullName || `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || expert.name || '',
      name: expert.fullName || `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || expert.name || '',
      firstName: expert.firstName || expert.fullName?.split(' ')[0] || '',
      lastName: expert.lastName || expert.fullName?.split(' ').slice(1).join(' ') || '',
      gender: expert.gender || 'male',
      dob: expert.dob,
      email: expert.email || `${cleanMobile}@ariesxpert.com`,
      phone: expert.phone || cleanMobile,
      mobileNo: expert.phone || cleanMobile,
      mobileNumber: expert.phone || cleanMobile,
      isMobileNumberVerified: expert.isMobileNumberVerified ?? expert.mobile_verified ?? true,
      isVerified: expert.isVerified ?? false,
      countryCode: expert.countryCode || '+91',
      countryName: expert.countryName || 'India',
      streetAddress: expert.streetAddress || expert.address || '',
      addressLineTwo: expert.addressLineTwo || '',
      zipCode: expert.zipCode || expert.pincode || aInfo.pincode || '',
      city: expert.city || aInfo.city || pInfo.city || '',
      state: expert.state || '',
      area: expert.area || '',
      aadharNumber: expert.aadharNumber || '',
      profilePhoto: expert.profilePhoto || expert.profileImageUrl || expert.profileImage || expert.photoUrl || expert.photo || undefined,
      profileImageUrl: expert.profilePhoto || expert.profileImageUrl || expert.profileImage || expert.photoUrl || expert.photo || undefined,
      profileImage: expert.profilePhoto || expert.profileImageUrl || expert.profileImage || expert.photoUrl || expert.photo || undefined,
      panCard: expert.panCard || bInfo.panNumber,
      aadharCard: expert.aadharCard,
      aadharCardBack: expert.aadharCardBack,
      licenseNumber:
        expert.licenseNumber ||
        pInfo.licenseNumber ||
        pInfo.councilRegistrationNumber ||
        pInfo.registrationNumber ||
        '',
      specialization:
        expert.specialization ||
        (Array.isArray(pInfo.specializations) && pInfo.specializations.length > 0 ? pInfo.specializations.join(', ') : null) ||
        pInfo.qualification ||
        expert.qualification ||
        'Musculoskeletal & Orthopedic',
      designation: expert.designation || pInfo.professionalRole || expert.therapistProfessionalRole || 'Physiotherapist',
      ariesId: expert.ariesId || expert.employeeId || expert.axId || expert.therapistId || (`AX-IND-${cleanMobile.slice(-4)}`),
      degreeCertificateUrl: degCertUrl,
      registrationCertificateUrl: regCertUrl,
      experience: expert.experience || (typeof pInfo.yearOfExperience === 'number' ? pInfo.yearOfExperience : parseInt(pInfo.yearOfExperience || '0', 10)) || 0,
      yearsOfExperience: expert.yearsOfExperience || pInfo.yearOfExperience || String(expert.experience || '0'),
      totalVisits: expert.totalVisits || 0,
      coins: expert.coins || 0,
      servicePincodes: aInfo.targetPincodes || expert.servicePincodes || [],
      serviceAreas: aInfo.serviceAreas || expert.serviceAreas || [],
      targetPincodes: aInfo.targetPincodes || expert.targetPincodes || [],
      onboardingStep: expert.onboardingStep ?? (hasCompleted ? 5 : 0),
      onboardingStatus: hasCompleted ? 'completed' : (expert.onboardingStatus || 'pending'),
      status: expert.status || (hasCompleted ? 'Active' : 'Pending'),
      isTherapistActive: expert.isProfileActive ?? expert.isTherapistActive ?? true,
      isProfileActive: expert.isProfileActive ?? true,
      rating: expert.rating || expert.averageRating || 0,
      totalReviews: expert.totalReviews || expert.reviewCount || 0,
      walletAmount: expert.walletAmount ?? expert.walletBalance ?? 0,
      totalEarnings: expert.totalEarnings ?? expert.totalEarning ?? 0,

      // Professional Info
      professionalInfo: {
        professionalRole: pInfo.professionalRole || expert.designation || 'Physiotherapist',
        qualification: pInfo.qualification || expert.qualification || '',
        specializations: Array.isArray(pInfo.specializations) ? pInfo.specializations : (expert.specializations || []),
        yearOfExperience: pInfo.yearOfExperience || expert.yearsOfExperience || '0',
        currentlyWorkingAt: pInfo.currentlyWorkingAt || expert.currentlyWorkingAt || '',
        serviceTypes: Array.isArray(pInfo.serviceTypes) ? pInfo.serviceTypes : (expert.serviceTypes || []),
        hasModalities: pInfo.hasModalities ?? expert.hasModalities ?? false,
        hasOwnClinic: pInfo.hasOwnClinic ?? expert.hasOwnClinic ?? false,
        clinicName: pInfo.clinicName || expert.clinicName || '',
        clinicEstablishmentMonth: pInfo.clinicEstablishmentMonth || expert.clinicEstablishmentMonth || '',
        clinicEstablishmentYear: pInfo.clinicEstablishmentYear || expert.clinicEstablishmentYear || '',
        registrationCertificate: regCertUrl,
        degreeCertificate: degCertUrl,
        cvResume: cvUrl,
        extraCertifications: extraCerts,
      },

      // Bank Info
      bankInfo: {
        accountType: bInfo.accountType || 'Individual',
        businessName: bInfo.businessName || '',
        accountHolderName: bInfo.accountHolderName || expert.fullName || '',
        accountNumber: bInfo.accountNumber || '',
        bankName: bInfo.bankName || '',
        ifscCode: bInfo.ifscCode || '',
        upiId: bInfo.upiId || '',
        panNumber: bInfo.panNumber || expert.panNumber || '',
        cancelledCheque: chequeUrl,
      },

      // Area of Service Info
      // ── Mobile UserModel parity fields ─────────────────────────────────────
      totalEarning: toNum(expert.totalEarning ?? expert.totalEarnings) ?? 0,
      clinicId: expert.clinicId ? String(expert.clinicId) : undefined,
      memberSince: expert.memberSince || expert.createdAt,
      createdAt: expert.createdAt,
      qualification: pInfo.qualification || expert.qualification || '',
      currentlyWorkingAt: pInfo.currentlyWorkingAt || expert.currentlyWorkingAt || '',
      serviceTypes: Array.isArray(pInfo.serviceTypes) ? pInfo.serviceTypes : (expert.serviceTypes || []),
      hasModalities: pInfo.hasModalities ?? expert.hasModalities ?? false,
      hasOwnClinic: pInfo.hasOwnClinic ?? expert.hasOwnClinic ?? false,
      clinicName: pInfo.clinicName || expert.clinicName || '',
      monthlyTargets: Array.isArray(expert.monthlyTargets) ? expert.monthlyTargets : [],

      // Targets & performance (therapistProfile-scoped in mobile)
      monthlyVisitTarget: toNum(tProfile.monthlyVisitTarget) ?? 5,
      monthlyVisitAchievement: toNum(tProfile.monthlyVisitAchievement) ?? 0,
      visitTargetProgress: toNum(tProfile.visitTargetProgress) ?? 0,
      monthlyTargetEarnings: toNum(tProfile.monthlyTargetEarnings),
      monthlyCurrentEarnings: toNum(tProfile.monthlyCurrentEarnings),
      monthlyEarningsGap: toNum(tProfile.monthlyEarningsGap),
      isTargetAiAdjusted: tProfile.isTargetAiAdjusted === true,
      therapistOpportunityScore: toNum(tProfile.therapistOpportunityScore),
      therapistHappinessScore: toNum(tProfile.therapistHappinessScore),
      badges: Array.isArray(tProfile.badges) ? tProfile.badges.map((b: any) => String(b)) : [],
      cityRankPercentile: toNum(tProfile.cityRankPercentile),
      qaScoreAverage: toNum(tProfile.qaScoreAverage),

      // Settings parity
      enablePushNotification: toBool(expert.enablePushNotification ?? notif.pushNotifications, true),
      enableEmailNotification: toBool(expert.enableEmailNotification ?? notif.emailNotifications, true),
      enableWhatsAppNotification: toBool(expert.enableWhatsAppNotification ?? notif.whatsappNotifications, false),
      enableSMSNotification: toBool(expert.enableSMSNotification ?? notif.smsNotifications, true),
      notificationTone: expert.notificationTone ? String(expert.notificationTone) : 'default',
      quietHoursFrom: expert.quietHoursFrom || '00:00',
      quietHoursTo: expert.quietHoursTo || '00:00',
      isQuietHoursEnabled: toBool(expert.isQuietHoursEnabled, false),
      isProfileVisible: toBool(expert.isProfileVisible, true),
      isActivityTracking: toBool(expert.isActivityTracking, true),
      isTherapistSOS: toBool(expert.isTherapistSOS, false),

      // Onboarding tour parity
      onboardingTourCompleted: tProfile.onboardingTourCompleted === true,
      onboardingTourCompletedAt: tProfile.onboardingTourCompletedAt,
      onboardingTourViewCount: toNum(tProfile.onboardingTourViewCount) ?? 0,

      // KYC document URLs (mobile document vault)
      aadharCardUrl: expert.aadharCard?.url || (typeof expert.aadharCard === 'string' ? expert.aadharCard : undefined),
      aadharCardBackUrl:
        expert.aadharCardBack?.url || (typeof expert.aadharCardBack === 'string' ? expert.aadharCardBack : undefined),
      panCardUrl:
        expert.panCard?.url ||
        (typeof expert.panCard === 'string' ? expert.panCard : undefined) ||
        (typeof bInfo.panCard === 'string' ? bInfo.panCard : bInfo.panCard?.url),
      cvResumeUrl: cvUrl,
      extraCertificationsUrls: extraCerts,
      drivingLicenseNumber: aInfo.drivingLicenseNumber || expert.drivingLicenseNumber || '',
      drivingLicenseUrl: licenseDocUrl,
      bankCancelledChequeUrl: chequeUrl,
      bankStatementUrl: statementUrl,
      bankVerificationLetterUrl: letterUrl,
      passportOrBrpUrl: expert.passportOrBrp?.url || (typeof expert.passportOrBrp === 'string' ? expert.passportOrBrp : undefined),
      personalausweisUrl: expert.personalausweis?.url || (typeof expert.personalausweis === 'string' ? expert.personalausweis : undefined),
      anmeldungDocumentUrl:
        expert.anmeldungDocument?.url || (typeof expert.anmeldungDocument === 'string' ? expert.anmeldungDocument : undefined),
      emiratesIdUrl: expert.emiratesId?.url || (typeof expert.emiratesId === 'string' ? expert.emiratesId : undefined),
      passportVisaUrl: expert.passportVisa?.url || (typeof expert.passportVisa === 'string' ? expert.passportVisa : undefined),
      governmentPhotoIdUrl:
        expert.governmentPhotoId?.url || (typeof expert.governmentPhotoId === 'string' ? expert.governmentPhotoId : undefined),
      ssnNumber: expert.ssnNumber ? String(expert.ssnNumber) : '',
      nationalInsuranceNumber: expert.nationalInsuranceNumber ? String(expert.nationalInsuranceNumber) : '',

      areaOfServiceInfo: {
        city: aInfo.city || expert.city || '',
        serviceAreas: aInfo.serviceAreas || expert.serviceAreas || [],
        pincode: aInfo.pincode || expert.pincode || expert.zipCode || '',
        targetPincodes: aInfo.targetPincodes || expert.targetPincodes || [],
        serviceRadius: aInfo.serviceRadius || expert.serviceRadius || 10,
        commuteType: aInfo.commuteType || expert.commuteType || '',
        travelCapacity: aInfo.travelCapacity || expert.travelCapacity || '',
        urgentVisits: aInfo.urgentVisits ?? expert.urgentVisits ?? false,
        maxDistance: aInfo.maxDistance || expert.maxDistance || 20,
        travelTimePreference: aInfo.travelTimePreference || expert.travelTimePreference || 'Anytime',
        drivingLicenseNumber: aInfo.drivingLicenseNumber || expert.drivingLicenseNumber || '',
        drivingLicense: licenseDocUrl,
      },
    };
  }

  /** POST /api/app/expert/loginFromEmail — mirrors `ApiService.expertLoginFromEmail`. */
  public async loginFromEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; result?: MobileExpertProfile; message?: string }> {
    const res = await apiPost('/api/app/expert/loginFromEmail', {
      email: email.toLowerCase().trim(),
      password,
    });

    const token = (res as any).accessToken || (res as any).token || (res as any).result?.token;
    if (token) this.saveToken(token);

    if (res.success === false) {
      return { success: false, message: res.message || 'Those credentials were not accepted.' };
    }

    const expert = (res as any).expert || (res as any).result?.expert || (res as any).result;
    return {
      success: true,
      token,
      result: expert ? this.normalizeExpertProfile(expert) : undefined,
      message: res.message || 'Login successful',
    };
  }

  /**
   * POST /api/app/expert/checkOnboardingStatus
   * Returns the expert record when one exists for this phone number, so the web app
   * resumes onboarding at the same step the mobile app would.
   */
  public async checkOnboardingStatus(
    phone: string
  ): Promise<{ success: boolean; result?: MobileExpertProfile; message?: string }> {
    const clean = phone.replace(/\D/g, '').slice(-10);
    const res = await apiPost('/api/app/expert/checkOnboardingStatus', { phone: clean });
    const rawExpert = (res as any).expert || res.result || res.data;
    return {
      success: res.success !== false,
      result: rawExpert ? this.normalizeExpertProfile(rawExpert, clean) : undefined,
      message: res.message,
    };
  }

  /**
   * Onboarding steps — multipart POSTs to the same expert endpoints the mobile
   * onboarding wizard uses (`ApiService.expertAddPersonalInfo` and friends).
   * Each returns the updated expert document; a failure throws so the wizard cannot
   * advance past a step the backend never stored.
   */
  private async postExpertStep(
    path: string,
    formData: FormData
  ): Promise<{ success: boolean; token?: string; result?: MobileExpertProfile; message?: string }> {
    const res = await apiPost(path, undefined, { formData });
    const token = (res as any).accessToken || (res as any).token || (res as any).result?.token;
    if (token) this.saveToken(token);
    const rawExpert = (res as any).expert || res.result || res.data;
    return {
      success: res.success !== false,
      token,
      result: rawExpert ? this.normalizeExpertProfile(rawExpert) : undefined,
      message: res.message,
    };
  }

  /** POST /api/app/expert/addPersonalInfo (multipart) */
  public async addPersonalInfo(formData: FormData) {
    return this.postExpertStep('/api/app/expert/addPersonalInfo', formData);
  }

  /** POST /api/app/expert/addProfessionalInfo (multipart) */
  public async addProfessionalInfo(formData: FormData) {
    return this.postExpertStep('/api/app/expert/addProfessionalInfo', formData);
  }

  /** POST /api/app/expert/addBankInfo (multipart) */
  public async addBankInfo(formData: FormData) {
    return this.postExpertStep('/api/app/expert/addBankInfo', formData);
  }

  /** POST /api/app/expert/addAreaOfServiceInfo (multipart) */
  public async addAreaOfServiceInfo(formData: FormData) {
    return this.postExpertStep('/api/app/expert/addAreaOfServiceInfo', formData);
  }

  /** POST /api/app/expert/submitForReview — mirrors `ApiService.expertSubmitForReview`. */
  public async submitForReview(
    expertId: string
  ): Promise<{ success: boolean; result?: MobileExpertProfile; message?: string }> {
    const res = await apiPost('/api/app/expert/submitForReview', {
      user: expertId,
      status: 'Pending',
    });
    const rawExpert = (res as any).expert || res.result || res.data;
    return {
      success: res.success !== false,
      result: rawExpert ? this.normalizeExpertProfile(rawExpert) : undefined,
      message: res.message,
    };
  }

  /**
   * POST /api/app/expert/editProfile
   *
   * `editProfile` is the only profile-write route the backend exposes
   * (`expert.routes.ts`); the previously-used `/updateProfile` does not exist, so saves
   * silently 404'd. Both entry points now hit the real endpoint and return what the
   * backend stored.
   */
  public async editProfile(
    payload: Partial<MobileExpertProfile> & Record<string, any>
  ): Promise<{ success: boolean; result?: MobileExpertProfile; message?: string }> {
    const res = await apiPost('/api/app/expert/editProfile', {
      user: this.getCurrentUserId(),
      ...payload,
    });
    const rawExpert = (res as any).expert || res.result || res.data;
    return {
      success: res.success !== false,
      result: rawExpert ? this.normalizeExpertProfile(rawExpert) : undefined,
      message: res.message,
    };
  }

  /** Alias kept for existing call sites — same endpoint as {@link editProfile}. */
  public async updateProfile(
    payload: any
  ): Promise<{ success: boolean; result?: MobileExpertProfile; message?: string }> {
    return this.editProfile(payload);
  }

  /** POST /api/app/expert/refreshUser — mirrors `ApiService.expertRefreshUser`. */
  public async refreshUser(
    expertId: string
  ): Promise<{ success: boolean; result?: MobileExpertProfile; message?: string }> {
    const res = await apiPost('/api/app/expert/refreshUser', { user: expertId });
    const rawExpert = (res as any).expert || res.result || res.data;
    return {
      success: res.success !== false,
      result: rawExpert ? this.normalizeExpertProfile(rawExpert) : undefined,
      message: res.message,
    };
  }

  /**
   * POST /api/app/expert/generate-portrait (multipart)
   *
   * The backend stores the portrait and returns its URL. A local data-URL fallback was
   * removed deliberately: it produced a photo visible only in this browser while the
   * mobile app and the admin console still showed the old one.
   */
  public async uploadProfilePhoto(
    file: File,
    gender: string = 'male'
  ): Promise<{ success: boolean; url?: string; message?: string }> {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    formData.append('gender', gender);
    formData.append('poseState', '0');

    const res = await apiPost('/api/app/expert/generate-portrait', undefined, { formData });
    const result = unwrap(res);
    const photoUrl =
      (res as any).url ||
      (res as any).profilePhoto ||
      result?.profilePhoto ||
      result?.profileImageUrl;

    if (!photoUrl) {
      return {
        success: false,
        message: res.message || 'The portrait service did not return an image URL.',
      };
    }
    return { success: res.success !== false, url: photoUrl, message: res.message };
  }

  /** POST /api/app/expert/refresh-portrait — regenerate the stored portrait. */
  public async refreshPortrait(): Promise<{ success: boolean; url?: string; message?: string }> {
    const res = await apiPost('/api/app/expert/refresh-portrait', {});
    const result = unwrap(res);
    return {
      success: res.success !== false,
      url: (res as any).url || result?.profilePhoto || result?.profileImageUrl,
      message: res.message,
    };
  }

  /**
   * POST /api/app/expert/isTherapistActive — duty toggle.
   * Mobile reverts its local switch when this fails (`DashboardNotifier.toggleAvailability`),
   * so the failure has to be reported here too.
   */
  public async setTherapistActive(
    expertId: string,
    isActive: boolean
  ): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/expert/isTherapistActive', {
      user: expertId,
      isTherapistActive: isActive,
    });
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/expert/isTherapistSOS — mirrors `ApiService.isTherapistSOS`. */
  public async setTherapistSOS(isSOS: boolean, expertId?: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/expert/isTherapistSOS', {
      user: expertId || this.getCurrentUserId(),
      isTherapistSOS: isSOS,
    });
    return { success: res.success !== false, message: res.message };
  }

  // ==========================================
  // VISIT EXECUTION, SOAP NOTES & FINALIZE
  // ==========================================

  /**
   * POST /api/app/appointment/:appointmentId/finalize — identical body to
   * `ApiService.finalizeVisit`. Finalization moves money and closes the appointment,
   * so a failure must surface instead of being reported as a completed visit.
   */
  public async finalizeVisit(
    payload: FinalizeVisitPayload
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await apiPost(`/api/app/appointment/${payload.appointmentId}/finalize`, {
      paymentMethod: payload.paymentMethod,
      totalAmount: payload.totalAmount,
      ...(payload.addOns ? { addOns: payload.addOns } : {}),
      ...(payload.packageId ? { packageId: payload.packageId } : {}),
      ...(payload.packageName ? { packageName: payload.packageName } : {}),
    });
    return { success: res.success !== false, data: unwrap(res), message: res.message };
  }

  /**
   * POST /api/app/patient/referral-earning — fire-and-forget after a visit is
   * finalized, exactly as `ApiService.calculateReferralEarning` documents.
   */
  public async calculateReferralEarning(patientId: string, visitAmount: number, appointmentId: string) {
    try {
      await apiPost('/api/app/patient/referral-earning', { patientId, visitAmount, appointmentId });
    } catch (err: any) {
      console.warn('[API] calculateReferralEarning failed:', err?.message || err);
    }
  }

  /** POST /api/admin/wallet/request-withdrawal — same endpoint as `ApiService.requestWithdrawal`. */
  public async requestWithdrawal(amount: number): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/admin/wallet/request-withdrawal', { amount });
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/supportTicket/createSupportTicket — mirrors `ApiService.createSupportTicket`. */
  public async createSupportTicket(
    subject: string,
    category: string,
    priority: string,
    description: string,
    expertId?: string
  ): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/supportTicket/createSupportTicket', {
      subject,
      category,
      priority,
      description,
      expert: expertId || this.getCurrentUserId(),
    });
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  /** The cached expert record — the web equivalent of mobile's `authProvider.user`. */
  public getCachedUser(): MobileExpertProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('expert_user_data');
      return cached ? (JSON.parse(cached) as MobileExpertProfile) : null;
    } catch {
      return null;
    }
  }

  public getCurrentUserId(): string | null {
    const parsed = this.getCachedUser() as any;
    if (!parsed) return null;
    return parsed._id || parsed.id || parsed.therapistId || parsed.uid || null;
  }

  // ==========================================
  // DASHBOARD STATS (1:1 Mobile App Parity with Live MongoDB)
  // ==========================================

  /**
   * Dashboard KPIs — mirrors `DashboardNotifier._loadData()` in the Flutter app.
   *
   * The same four endpoints are queried with the same bodies, and the response
   * envelopes are read with the exact shapes the backend returns
   * (`home.controller.ts`):
   *   fetchNoOfVisit         → result.{today,month,year}.{total,completed}
   *   fetchNoOfPatientAttend → result: Patient[], count: number
   *   fetchReferTherapist    → result: AppReferral[]
   *   fetchReferPatients     → result: PatientReferral[]
   *   fetchLeadsTekenAnalysis/fetchMissLeadsAnalysis → result: lead[], metrics
   *
   * Earnings come from the therapist record (`totalEarning`), exactly as the mobile
   * dashboard reads `authState.user.totalEarning` — they are never derived locally.
   */
  public async getDashboardStats(expertId?: string): Promise<any> {
    const expId = expertId || this.getCurrentUserId();
    if (!expId) {
      throw new ApiError('No authenticated provider — cannot load dashboard.', 401);
    }

    const settle = async <T>(work: Promise<T>, label: string): Promise<T | null> => {
      try {
        return await work;
      } catch (err: any) {
        console.warn(`[API] getDashboardStats: ${label} failed:`, err?.message || err);
        return null;
      }
    };

    const [visitsRes, patientsRes, referTherapistRes, referPatientsRes, leadsRes, missedRes, profileRes] =
      await Promise.all([
        settle(apiPost('/api/app/home/fetchNoOfVisit', { expert: expId }), 'fetchNoOfVisit'),
        settle(apiPost('/api/app/home/fetchNoOfPatientAttend', { expert: expId }), 'fetchNoOfPatientAttend'),
        settle(apiPost('/api/app/expert/fetchReferTherapist', { referredBy: expId }), 'fetchReferTherapist'),
        settle(apiPost('/api/app/patient/fetchReferPatients', { therapist: expId }), 'fetchReferPatients'),
        settle(apiPost('/api/app/home/fetchLeadsTekenAnalysis', { expert: expId }), 'fetchLeadsTekenAnalysis'),
        settle(apiPost('/api/app/home/fetchMissLeadsAnalysis', { expert: expId }), 'fetchMissLeadsAnalysis'),
        settle(this.refreshUser(expId), 'refreshUser'),
      ]);

    const visits = (visitsRes?.result || {}) as any;
    const today = visits.today || {};
    const month = visits.month || {};
    const year = visits.year || {};

    const patientList = Array.isArray(patientsRes?.result) ? patientsRes!.result : [];
    const uniquePatients = patientsRes?.count ?? patientList.length;

    // Mobile sums referralAmount over active referrals only.
    const appReferrals = Array.isArray(referTherapistRes?.result) ? referTherapistRes!.result : [];
    const totalReferralEarnings = appReferrals
      .filter((r: any) => r.isProfileActive === true)
      .reduce((sum: number, r: any) => sum + (Number(r.referralAmount) || 0), 0);

    const patientReferrals = Array.isArray(referPatientsRes?.result) ? referPatientsRes!.result : [];
    const totalPatientReferralEarnings = patientReferrals
      .filter((r: any) => r.status === 'Active')
      .reduce((sum: number, r: any) => sum + (Number(r.referralAmount) || 0), 0);

    const leadsTakenList = Array.isArray(leadsRes?.result) ? leadsRes!.result : [];
    const leadMetrics = (leadsRes as any)?.metrics || {};
    const missedLeadsList = Array.isArray(missedRes?.result) ? missedRes!.result : [];

    const profile = profileRes?.result || null;
    const totalEarnings = Number(profile?.totalEarnings ?? profile?.walletAmount ?? 0) || 0;

    const now = new Date();
    const currentTarget = profile?.monthlyTargets?.find(
      (t: any) => t.month === now.getMonth() + 1 && t.year === now.getFullYear()
    );

    return {
      // Earnings — sourced from the therapist record, same as mobile.
      totalEarnings,
      walletAmount: Number(profile?.walletAmount ?? 0) || 0,

      // Visits — real backend shape.
      detailedVisits: {
        today: { total: today.total ?? 0, completed: today.completed ?? 0, pending: Math.max((today.total ?? 0) - (today.completed ?? 0), 0) },
        month: { total: month.total ?? 0, completed: month.completed ?? 0 },
        year: { total: year.total ?? 0, completed: year.completed ?? 0 },
      },
      todayVisits: today.total ?? 0,
      todayCompletedVisits: today.completed ?? 0,
      monthlyVisits: month.total ?? 0,
      totalVisits: year.total ?? 0,

      // Patients.
      uniquePatients,
      patientList,

      // Referrals.
      appReferrals,
      totalReferralEarnings,
      patientReferrals,
      totalPatientReferralEarnings,

      // Lead funnel.
      leadsTaken: leadMetrics.totalLeads ?? leadsTakenList.length,
      leadsTakenList,
      missedLeads: missedLeadsList.length,
      missedLeadsList,
      leadConversionRate:
        leadMetrics.conversionRate !== undefined ? `${leadMetrics.conversionRate}%` : undefined,
      leadMetrics,

      // Monthly target (mirrors mobile target_setup widget).
      monthlyTarget: currentTarget?.target ?? profile?.monthlyTargetEarnings,
      monthlyAchieved: currentTarget?.achieved ?? profile?.monthlyCurrentEarnings,
      monthlyVisitTarget: profile?.monthlyVisitTarget,
      monthlyVisitAchievement: profile?.monthlyVisitAchievement,
    };
  }

  /** POST /api/app/expert/setMonthlyTarget — mirrors `DashboardNotifier.setMonthlyTarget`. */
  public async setMonthlyTarget(target: number, expertId?: string): Promise<{ success: boolean; result?: any; message?: string }> {
    const expId = expertId || this.getCurrentUserId();
    const res = await apiPost('/api/app/expert/setMonthlyTarget', {
      expertId: expId,
      monthlyTarget: target,
    });
    return {
      success: res.success !== false,
      result: res.result ? this.normalizeExpertProfile(res.result) : undefined,
      message: res.message,
    };
  }

  /** POST /api/app/home/fetchLeadsTekenAnalysis — leads-taken funnel + quality metrics. */
  public async fetchLeadsTakenAnalysis(expertId?: string): Promise<{ leads: any[]; metrics: any }> {
    const expId = expertId || this.getCurrentUserId();
    const res = await apiPost('/api/app/home/fetchLeadsTekenAnalysis', { expert: expId });
    return {
      leads: Array.isArray(res.result) ? res.result : [],
      metrics: (res as any).metrics || {},
    };
  }

  /** POST /api/app/home/fetchMissLeadsAnalysis — leads that lapsed without a response. */
  public async fetchMissedLeadsAnalysis(expertId?: string): Promise<any[]> {
    const expId = expertId || this.getCurrentUserId();
    const res = await apiPost('/api/app/home/fetchMissLeadsAnalysis', { expert: expId });
    return Array.isArray(res.result) ? res.result : [];
  }

  // ==========================================
  // LEADS & BROADCASTS (1:1 Mobile App Parity with Live MongoDB)
  // ==========================================

  /**
   * POST /api/app/broadcastlisting/fetchBroadcastlisting  body: { expert }
   *
   * Returns the therapist's broadcast listings enriched with the populated broadcast
   * and patient documents (`broadcastlisting.controller.ts` → `result`). Listings are
   * split the way the mobile lead screen splits them: still-open offers vs. the ones
   * this provider already accepted.
   */
  public async getLeads(expertId?: string): Promise<{ newLeads: any[]; acquiredLeads: any[] }> {
    const expId = expertId || this.getCurrentUserId();
    const res = await apiPost('/api/app/broadcastlisting/fetchBroadcastlisting', { expert: expId });

    const listings = unwrapList(res, 'broadcastlisting', 'broadcastListings');
    const isInterested = (listing: any) =>
      String(listing?.therapistResponse || '').toLowerCase() === 'interested';

    return {
      newLeads: listings.filter((listing) => !listing?.therapistResponse),
      acquiredLeads: listings.filter(isInterested),
    };
  }

  /**
   * PUT /api/app/broadcastlisting/markAsInterestedOrNot
   *
   * The backend keys off `broadcastListingId` + `therapistResponse`
   * (`markAsInterestedOrNot` controller), which is exactly what
   * `ApiService.markAsInterestedOrNot` sends. The previous `{broadcastId, isInterested}`
   * body was ignored by the server, so accepting a lead here never reached the backend.
   */
  public async expressInterest(broadcastListingId: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPut('/api/app/broadcastlisting/markAsInterestedOrNot', {
      broadcastListingId,
      therapistResponse: 'Interested',
    });
    return { success: res.success !== false, message: res.message };
  }

  /** PUT /api/app/broadcastlisting/markAsInterestedOrNot with a "Not Interested" response. */
  public async passLead(broadcastListingId: string, reason?: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPut('/api/app/broadcastlisting/markAsInterestedOrNot', {
      broadcastListingId,
      therapistResponse: 'Not Interested',
      ...(reason ? { notIntrestedRemark: reason } : {}),
    });
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/patient/requestReview — mirrors `ApiService.requestPatientReview`. */
  public async requestPatientReview(patientId: string): Promise<any> {
    const res = await apiPost('/api/app/patient/requestReview', { patientId });
    return { success: res.success !== false, data: unwrap(res), message: res.message };
  }

  // ==========================================
  // APPOINTMENTS (1:1 Mobile App Parity with Live MongoDB)
  // ==========================================

  /** POST /api/app/appointment/fetchAppointments  body: { therapist } */
  public async getAppointments(therapistId?: string): Promise<any[]> {
    const tId = therapistId || this.getCurrentUserId();
    const res = await apiPost('/api/app/appointment/fetchAppointments', { therapist: tId });
    return unwrapList(res, 'appointments');
  }

  /**
   * "Start travel" has no backend endpoint in either client — the mobile app
   * (`VisitFlowService.startVisit`) only moves local state to `movingToPatient`.
   * Kept as a local transition so the web workflow matches the mobile workflow.
   */
  public async startTravel(_appointmentId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  /**
   * POST /api/app/appointment/:appointmentId/validate-arrival
   * Mirrors `VisitFlowService.markReached()` — the backend geo-validates the arrival
   * and the UI only advances when it confirms, so failures must propagate.
   */
  public async markArrived(
    appointmentId: string,
    coords?: { lat: number; lng: number }
  ): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost(`/api/app/appointment/${appointmentId}/validate-arrival`, {
      location: {
        latitude: coords?.lat,
        longitude: coords?.lng,
        timestamp: new Date().toISOString(),
      },
    });
    return { success: res.success !== false, message: res.message };
  }

  /**
   * Patient-side OTP check-in. The backend validates the arrival OTP through the same
   * `validate-arrival` endpoint the mobile app uses; there is no separate check-in route.
   */
  public async checkInWithOtp(appointmentId: string, otp: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost(`/api/app/appointment/${appointmentId}/validate-arrival`, { otp });
    return { success: res.success !== false, message: res.message };
  }

  // ==========================================
  // PATIENTS (1:1 Mobile App Parity with Live MongoDB)
  // ==========================================

  /** POST /api/app/patient/fetchPatients  body: { therapist } */
  public async getPatients(therapistId?: string): Promise<any[]> {
    const tId = therapistId || this.getCurrentUserId();
    const res = await apiPost('/api/app/patient/fetchPatients', { therapist: tId });
    return unwrapList(res, 'patients');
  }

  // ==========================================
  // REFERRAL DOCTORS & PATIENTS (1:1 Mobile App Parity)
  // ==========================================

  /**
   * Referral ledger. Same two calls the mobile dashboard makes:
   *   POST /api/app/expert/fetchReferTherapist   body: { referredBy }
   *   POST /api/app/patient/fetchReferPatients   body: { therapist }
   */
  public async fetchReferrals(expertId?: string): Promise<{ referTherapist: any[]; referPatients: any[] }> {
    const expId = expertId || this.getCurrentUserId();
    if (!expId) return { referTherapist: [], referPatients: [] };

    const [therapistRes, patientRes] = await Promise.allSettled([
      apiPost('/api/app/expert/fetchReferTherapist', { referredBy: expId }),
      apiPost('/api/app/patient/fetchReferPatients', { therapist: expId }),
    ]);

    return {
      referTherapist:
        therapistRes.status === 'fulfilled' ? unwrapList(therapistRes.value, 'referTherapist') : [],
      referPatients:
        patientRes.status === 'fulfilled' ? unwrapList(patientRes.value, 'referPatients') : [],
    };
  }

  /** POST /api/app/patient/createReferPatient — mirrors `ApiService.createReferPatient` with full structured payload support. */
  public async createReferPatient(payload: {
    firstName?: string;
    lastName?: string;
    patientName?: string;
    phone?: string;
    patientMobile?: string;
    gender?: string;
    age?: number | string;
    medicalConditions?: string[];
    patientCondition?: string;
    referPatientAppointmentTime?: string;
    referredBy?: string;
    therapist?: string;
    address?: any;
    patientAddress?: string;
    city?: string;
    packageId?: string;
    packageName?: string;
    sessionPrice?: number;
    patientConfirmed?: boolean;
    [key: string]: any;
  }): Promise<{ success: boolean; result?: any; message?: string }> {
    const fName = payload.firstName || (payload.patientName ? payload.patientName.split(' ')[0] : 'Patient');
    const lName = payload.lastName || (payload.patientName ? payload.patientName.split(' ').slice(1).join(' ') : '');
    const phoneNum = payload.phone || payload.patientMobile || '';
    const conditions = payload.medicalConditions || (payload.patientCondition ? [payload.patientCondition] : []);
    const refBy = payload.referredBy || payload.therapist || this.getCurrentUserId();

    let addrObj = typeof payload.address === 'object' && payload.address !== null ? payload.address : {};
    if (typeof payload.patientAddress === 'string' && (!addrObj || !Object.keys(addrObj).length)) {
      addrObj = { street: payload.patientAddress, city: payload.city || '' };
    }

    const body: Record<string, any> = {
      firstName: fName,
      lastName: lName,
      phone: phoneNum,
      gender: payload.gender || 'Other',
      age: Number(payload.age) || 30,
      medicalConditions: conditions,
      referPatientAppointmentTime: payload.referPatientAppointmentTime || new Date().toISOString(),
      referredBy: refBy,
      therapist: refBy,
      address: addrObj,
      city: payload.city || addrObj.city || '',
      patientName: `${fName} ${lName}`.trim(),
      patientMobile: phoneNum,
      patientAddress: typeof payload.patientAddress === 'string' ? payload.patientAddress : (addrObj.street || addrObj.address || ''),
      patientCondition: Array.isArray(conditions) ? conditions.join(', ') : String(conditions || ''),
    };
    if (payload.packageId) body.packageId = payload.packageId;
    if (payload.packageName) body.packageName = payload.packageName;
    if (payload.sessionPrice) body.sessionPrice = payload.sessionPrice;
    if (payload.patientConfirmed !== undefined) body.patientConfirmed = payload.patientConfirmed;

    const res = await apiPost('/api/app/patient/createReferPatient', body);
    return {
      success: res.success !== false,
      result: unwrap(res),
      message: res.message || 'Patient referred successfully',
    };
  }

  /** GET /api/admin/finance/pricing/resolve — mirrors `ApiService.resolveSessionPrice`. */
  public async resolveSessionPrice(params: {
    city: string;
    pincode?: string;
    area?: string;
    country?: string;
  }): Promise<{ price: number; hierarchyLevel: string }> {
    const q = new URLSearchParams();
    q.set('city', params.city);
    q.set('country', params.country || 'India');
    if (params.pincode) q.set('pincode', params.pincode);
    if (params.area) q.set('area', params.area);
    try {
      const res = await apiGet(`/api/admin/finance/pricing/resolve?${q.toString()}`);
      return {
        price: Number(res?.price ?? res?.result?.price ?? 800),
        hierarchyLevel: res?.hierarchyLevel ?? res?.result?.hierarchyLevel ?? 'city',
      };
    } catch {
      return { price: 800, hierarchyLevel: 'default' };
    }
  }

  /** GET /api/admin/packages — mirrors `ApiService.fetchPackages`. */
  public async fetchPackages(city?: string): Promise<any[]> {
    const q = new URLSearchParams({ ownerType: 'admin', limit: '50', isActive: 'true' });
    if (city) q.set('city', city);
    try {
      const res = await apiGet(`/api/admin/packages?${q.toString()}`);
      return unwrapList(res, 'packages');
    } catch {
      return [];
    }
  }

  /** POST /api/app/expert/createReferTherapist — mirrors `ApiService.createReferTherapist`. */
  public async createReferTherapist(payload: {
    referredBy: string;
    doctorName: string;
    doctorMobile: string;
    specialization?: string;
    city?: string;
    [key: string]: any;
  }): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/expert/createReferTherapist', payload);
    return {
      success: res.success !== false,
      result: unwrap(res),
      message: res.message || 'Therapist referred successfully',
    };
  }

  // ==========================================
  // WALLET & TRANSACTIONS
  // ==========================================

  /**
   * GET /api/app/wallet/my-wallet
   *
   * The backend returns `{ availableBalance, pendingBalance, lockedBalance, currency,
   * status }` (wallet_transaction.controller.ts → getMyWallet), derived from the
   * therapist's `walletAmount` minus pending withdrawals — the same figures the mobile
   * `PayoutService` shows.
   */
  public async getWalletBalance(): Promise<{
    availableBalance: number;
    pendingBalance: number;
    lockedBalance: number;
    currency: string;
    walletStatus: string;
    isEligibleForPayout: boolean;
  }> {
    const res = await apiGet('/api/app/wallet/my-wallet');
    const wallet = unwrap(res) || {};
    const available = Number(wallet.availableBalance ?? wallet.walletAmount ?? 0) || 0;

    return {
      availableBalance: available,
      pendingBalance: Number(wallet.pendingBalance ?? 0) || 0,
      lockedBalance: Number(wallet.lockedBalance ?? 0) || 0,
      currency: wallet.currency || 'INR',
      walletStatus: wallet.status || wallet.walletStatus || 'Active',
      isEligibleForPayout: available >= 500,
    };
  }

  /** POST /api/app/walletTransaction/fetchWalletTransactions  body: { expert } */
  public async getTransactions(expertId?: string): Promise<any[]> {
    const expId = expertId || this.getCurrentUserId();
    const res = await apiPost('/api/app/walletTransaction/fetchWalletTransactions', { expert: expId });
    return unwrapList(res, 'transactions', 'walletTransactions');
  }

  // ==========================================
  // 34 DYNAMIC CLINICAL ASSESSMENT FORMS
  // ==========================================

  /** Matches Flutter FormService.fetchAssessments() → POST /api/app/assessment/fetchAssessments */
  public async fetchAssessments(): Promise<DynamicAssessmentForm[]> {
    try {
      const data = await apiPost('/api/app/assessment/fetchAssessments', {});
      const list: any[] = unwrapList(data, 'assessments');

      if (list && list.length > 0) {
        return list.map((item: any) => ({
          _id: item._id || item.id,
          title: item.title || item.name || 'Clinical Assessment',
          description: item.description,
          treatmentType: typeof item.treatmentType === 'object' ? item.treatmentType?._id : item.treatmentType,
          visitType: item.visitType || 'First Visit',
          questions: (item.questions || item.fields || []).map((q: any) => ({
            _id: q._id || q.id,
            questionText: q.questionText || q.label || '',
            questionType: q.questionType || q.type || 'text',
            required: q.required ?? q.isMandatory ?? false,
            order: q.order ?? 0,
            options: q.options || [],
            scaleMin: q.scaleMin ?? q.min ?? 0,
            scaleMax: q.scaleMax ?? q.max ?? 10,
            group: q.group || 'Clinical Examination',
            placeholder: q.placeholder,
            suffix: q.suffix,
          })),
        }));
      }
    } catch (e: any) {
      // A backend outage must be visible, not papered over with a local catalogue —
      // otherwise a clinician fills a form the server never issued and cannot store.
      console.error('[API] fetchAssessments failed:', e);
      throw e;
    }

    // Backend reachable but no assessment forms configured for this tenant yet:
    // fall back to the built-in clinical templates so a visit can still be documented.
    console.warn('[API] No assessment forms returned by the backend; using built-in clinical templates.');
    return BUILTIN_34_ASSESSMENT_FORMS;
  }

  public async getAssessmentFormConfig(
    treatmentType: string,
    visitType: 'First Visit' | 'Regular Visit' | string
  ): Promise<DynamicAssessmentForm | null> {
    const assessments = await this.fetchAssessments();
    const isFirstVisit = visitType.toLowerCase().includes('first') || visitType.toLowerCase().includes('1');

    // 1. Exact match by title & visitType
    const exact = assessments.find((a) => {
      const matchType = isFirstVisit
        ? a.visitType?.toLowerCase().includes('first')
        : a.visitType?.toLowerCase().includes('regular') || a.visitType?.toLowerCase().includes('follow');
      return matchType && a.title.toLowerCase().includes(treatmentType.toLowerCase());
    });
    if (exact) return exact;

    // 2. Match by treatmentType
    const treatmentMatch = assessments.find((a) => {
      const matchType = isFirstVisit
        ? a.visitType?.toLowerCase().includes('first')
        : a.visitType?.toLowerCase().includes('regular');
      return matchType && (a.treatmentType === treatmentType || a.title.toLowerCase().includes(treatmentType.toLowerCase()));
    });
    if (treatmentMatch) return treatmentMatch;

    // 3. Fallback to first/regular generic form
    const generic = assessments.find((a) =>
      isFirstVisit ? a.visitType?.toLowerCase().includes('first') : a.visitType?.toLowerCase().includes('regular')
    );
    return generic || assessments[0] || null;
  }

  /** Matches Flutter FormService.submitForm() → POST /api/app/assessmentResponse/addAssessmentResponse */
  /**
   * POST /api/app/assessmentResponse/addAssessmentResponse
   *
   * Mirrors `VisitFlowService` — clinical data must be durably persisted before the
   * visit advances to payment, so a failure is rethrown rather than swallowed. The
   * mobile app does exactly this (`rethrow` after keeping the form in memory).
   */
  public async submitAssessmentResponse(
    payload: AssessmentResponsePayload
  ): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/assessmentResponse/addAssessmentResponse', {
      isActive: true,
      isDeleted: false,
      ...payload,
    });
    return { success: res.success !== false, message: res.message };
  }

  // ==========================================
  // GAMING ARENA & CHAMPIONSHIP HUB (1:1 Mobile Parity)
  // ==========================================

  /**
   * Gaming hub summary. Mirrors `gamingProfileProvider` + `dailyLeaderboardProvider`
   * in the Flutter app: `POST /api/app/gaming/profile { userId }` and
   * `GET /api/app/gaming/leaderboard`. (There is no `/gaming/dashboard` route.)
   */
  public async getGamingDashboard(): Promise<{
    coins: number;
    rank: number;
    weeklyScore: number;
    completedQuests: number;
    streakDays: number;
    tier: string;
    alias?: string;
    profile: any;
    leaderboard: any[];
  }> {
    const userId = this.getCurrentUserId();
    const [profile, leaderboard] = await Promise.all([
      this.getGamingProfile().catch(() => null),
      this.getGamingLeaderboard().catch(() => [] as any[]),
    ]);

    const myRank =
      leaderboard.findIndex(
        (entry: any) =>
          String(entry.userId || entry._id || entry.user?._id) === String(userId) ||
          (profile?.alias && entry.alias === profile.alias)
      ) + 1;

    return {
      coins: Number(profile?.coins ?? 0) || 0,
      rank: myRank > 0 ? myRank : Number(profile?.rank ?? 0) || 0,
      weeklyScore: Number(profile?.points ?? profile?.xp ?? 0) || 0,
      completedQuests: Number(profile?.completedQuests ?? profile?.tasksCompleted ?? 0) || 0,
      streakDays: Number(profile?.streakDays ?? 0) || 0,
      tier: profile?.league || profile?.activeTier || 'bronze',
      alias: profile?.alias,
      profile,
      leaderboard,
    };
  }

  /** GET /api/app/gaming/leaderboard */
  public async getGamingLeaderboard(): Promise<any[]> {
    const res = await apiGet('/api/app/gaming/leaderboard');
    return unwrapList(res, 'leaderboard', 'entries');
  }

  /**
   * POST /api/app/gaming/enter — the live daily tournament (questions, prize pool,
   * entry fee, countdown) exactly as `DailyTournamentNotifier.enter()` fetches it.
   */
  public async getDailyTournament(): Promise<{ game: any; message?: string }> {
    const res = await apiPost('/api/app/gaming/enter', { userId: this.getCurrentUserId() });
    return { game: (res as any).game ?? unwrap(res), message: res.message };
  }

  /**
   * POST /api/app/gaming/submit
   * Body matches `GamingService.submitChallenge` exactly: { userId, gameType,
   * isCorrect, timeTakenMs }. The server scores the entry and records it against
   * today's leaderboard; one submission per game type per day.
   */
  public async submitDailyTournament(payload: {
    gameType: string;
    isCorrect: boolean;
    timeTakenMs: number;
  }): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/gaming/submit', {
      userId: this.getCurrentUserId(),
      gameType: payload.gameType,
      isCorrect: payload.isCorrect,
      timeTakenMs: payload.timeTakenMs,
    });
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** POST /api/app/gaming/set-alias */
  public async setGamingAlias(alias: string, avatarId?: string): Promise<{ success: boolean; profile?: any; message?: string }> {
    const res = await apiPost('/api/app/gaming/set-alias', {
      userId: this.getCurrentUserId(),
      alias,
      ...(avatarId ? { avatarId } : {}),
    });
    return { success: res.success !== false, profile: (res as any).profile, message: res.message };
  }

  /** GET /api/app/gaming/crosswords */
  public async getActiveCrossword(): Promise<any> {
    const res = await apiGet('/api/app/gaming/crosswords');
    return unwrap(res);
  }

  /** POST /api/app/gaming/crosswords/submit */
  public async submitCrossword(payload: Record<string, any>): Promise<any> {
    const res = await apiPost('/api/app/gaming/crosswords/submit', {
      userId: this.getCurrentUserId(),
      ...payload,
    });
    return unwrap(res);
  }

  /** POST /api/app/gaming/buy-coins-from-wallet */
  public async buyCoinsFromWallet(amount: number): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/gaming/buy-coins-from-wallet', {
      userId: this.getCurrentUserId(),
      amount,
    });
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** POST /api/app/gaming/withdraw-coins-to-wallet */
  public async withdrawCoinsToWallet(amount: number): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/gaming/withdraw-coins-to-wallet', {
      userId: this.getCurrentUserId(),
      amount,
    });
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** POST /api/app/gaming/topic-quizzes/start */
  public async startTopicQuiz(topicId: string): Promise<any> {
    const res = await apiPost('/api/app/gaming/topic-quizzes/start', {
      userId: this.getCurrentUserId(),
      topicId,
    });
    return unwrap(res);
  }

  /** POST /api/app/gaming/topic-quizzes/submit */
  public async submitTopicQuiz(payload: Record<string, any>): Promise<any> {
    const res = await apiPost('/api/app/gaming/topic-quizzes/submit', {
      userId: this.getCurrentUserId(),
      ...payload,
    });
    return unwrap(res);
  }

  /** GET /api/app/gaming/topic-quizzes/:topicId/leaderboard */
  public async getTopicQuizLeaderboard(topicId: string): Promise<any[]> {
    const res = await apiGet(`/api/app/gaming/topic-quizzes/${encodeURIComponent(topicId)}/leaderboard`);
    return unwrapList(res, 'leaderboard', 'entries');
  }

  // ==========================================
  // ATTENDANCE & DUTY TELEMETRY
  // ==========================================

  /**
   * POST /attendance — the exact endpoint and body `AttendanceNotifier.markAttendance`
   * posts from the mobile app. Failures propagate rather than being reported as a
   * successful punch, so the two clients agree on what was actually recorded.
   */
  public async recordAttendance(
    type: 'PUNCH_IN' | 'PUNCH_OUT',
    coords?: { lat: number; lng: number }
  ): Promise<{ success: boolean; message: string; timestamp: string }> {
    const now = new Date();
    const user = this.getCachedUser();
    const res = await apiPost('/attendance', {
      staffId: this.getCurrentUserId(),
      clinicId: user?.clinicId,
      date: now.toISOString(),
      status: type === 'PUNCH_IN' ? 'Clocked In' : 'Clocked Out',
      time: now.toISOString(),
      location: coords ? { latitude: coords.lat, longitude: coords.lng } : undefined,
    });
    return {
      success: res.success !== false,
      message: res.message || `Successfully recorded ${type.replace('_', ' ').toLowerCase()}`,
      timestamp: now.toLocaleTimeString('en-IN'),
    };
  }

  // ==========================================
  // INVOICES & RECEIPT GENERATOR
  // ==========================================

  /**
   * POST /api/app/patient/sendInvoice — the same endpoint `ApiService.sendPatientInvoice`
   * calls. The backend mints and delivers the invoice, so the number that comes back is
   * the one the patient and the mobile app see.
   */
  public async generateInvoice(payload: {
    patientId?: string;
    patientName: string;
    patientPhone?: string;
    treatmentType: string;
    sessionNumber: number;
    totalSessions: number;
    sessionFee: number;
    addOns: Array<{ name: string; amount: number }>;
    paymentMethod: string;
    appointmentId?: string;
  }): Promise<{ success: boolean; invoiceNumber?: string; downloadUrl?: string; message?: string }> {
    const res = await apiPost('/api/app/patient/sendInvoice', {
      expert: this.getCurrentUserId(),
      ...payload,
      totalAmount:
        Number(payload.sessionFee || 0) +
        (payload.addOns || []).reduce((sum, a) => sum + (Number(a.amount) || 0), 0),
    });
    const result = unwrap(res);
    return {
      success: res.success !== false,
      invoiceNumber: result?.invoiceNumber || result?.invoiceNo || result?.number,
      downloadUrl: result?.downloadUrl || result?.invoiceUrl || result?.url,
      message: res.message,
    };
  }

  // ==========================================
  // NOTIFICATIONS & ALERTS
  // ==========================================

  /** POST /api/app/notification/fetchNotifications — mirrors `NotificationProvider.load()`. */
  public async getNotifications(limit = 50): Promise<any[]> {
    const expertId = this.getCurrentUserId();
    const res = await apiPost('/api/app/notification/fetchNotifications', {
      expert: expertId,
      limit,
    });
    return unwrapList(res, 'notifications');
  }

  /** PUT /api/app/notification/mark-read/:id */
  public async markNotificationRead(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPut(`/api/app/notification/mark-read/${id}`, {});
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/notification/mark-all-read */
  public async markAllNotificationsRead(expertId?: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/notification/mark-all-read', {
      expert: expertId || this.getCurrentUserId() || '',
    });
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/notification/removeNotification */
  public async removeNotification(notificationId: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/notification/removeNotification', { notificationId });
    return { success: res.success !== false, message: res.message };
  }

  /** GET /api/app/notification/unread-count */
  public async getUnreadNotificationCount(expertId?: string): Promise<number> {
    const expId = expertId || this.getCurrentUserId();
    const res = await apiGet(`/api/app/notification/unread-count?expert=${encodeURIComponent(expId || '')}`);
    const value = (res as any).count ?? (res as any).result?.count ?? unwrap(res);
    return Number(value) || 0;
  }

  // ==========================================
  // QUALITY METRICS & PATIENT REVIEWS
  // ==========================================

  /**
   * Quality & audit metrics.
   *
   * There is no `fetchQualityMetrics` endpoint. The real figures come from
   * `POST /api/app/home/fetchLeadsTekenAnalysis` (its `metrics` block carries
   * conversionRate, onTimePaymentRate, patientOnTimeRate and the conversion funnel) and
   * from the therapist record (`qaScoreAverage`, `rating`, `cityRankPercentile`).
   *
   * Patient reviews are collected on Google, not stored per therapist in this backend —
   * there is no endpoint that returns them and none that accepts a therapist reply. The
   * flag below lets the UI say so rather than render an empty or invented review list.
   */
  public async getQualityMetrics(): Promise<{
    clinicalComplianceScore: number;
    onTimeArrivalRate: number;
    patientOnTimeRate: number;
    payoutOnTimeRate: number;
    conversionRate: number;
    averageRating: number;
    cityRankPercentile?: number;
    conversionFunnel?: { leadsTaken: number; assessmentsDone: number; convertedToPackage: number };
    metrics: any;
    reviewsAvailable: false;
  }> {
    const expId = this.getCurrentUserId();

    const [analysis, profileRes] = await Promise.all([
      this.fetchLeadsTakenAnalysis(expId || undefined),
      expId ? this.refreshUser(expId).catch(() => null) : Promise.resolve(null),
    ]);

    const metrics = analysis.metrics || {};
    const profile = profileRes?.result || null;

    return {
      clinicalComplianceScore: Number(profile?.qaScoreAverage ?? 0) || 0,
      onTimeArrivalRate: Number(metrics.onTimePaymentRate ?? 0) || 0,
      patientOnTimeRate: Number(metrics.patientOnTimeRate ?? 0) || 0,
      payoutOnTimeRate: Number(metrics.physioOnTimeRate ?? 0) || 0,
      conversionRate: Number(metrics.conversionRate ?? 0) || 0,
      averageRating: Number(profile?.rating ?? 0) || 0,
      cityRankPercentile: profile?.cityRankPercentile,
      conversionFunnel: metrics.conversionFunnel,
      metrics,
      reviewsAvailable: false,
    };
  }

  /** GET /api/app/feedback/public — published patient feedback (mobile feedback module). */
  public async getPublicFeedback(): Promise<any[]> {
    const res = await apiGet('/api/app/feedback/public');
    return unwrapList(res, 'feedback', 'feedbacks');
  }

  /** POST /api/app/feedback/submit — mirrors the mobile feedback submission. */
  public async submitFeedback(payload: Record<string, any>): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/feedback/submit', payload);
    return { success: res.success !== false, message: res.message };
  }

  // ==========================================
  // SUPPORT TICKETS & FAQ (1:1 Mobile Parity)
  // ==========================================

  /** POST /api/app/supportTicket/fetchSupportTickets  body: { expert } */
  public async getSupportTickets(expertId?: string): Promise<any[]> {
    const expId = expertId || this.getCurrentUserId();
    const res = await apiPost('/api/app/supportTicket/fetchSupportTickets', { expert: expId });
    return unwrapList(res, 'tickets', 'supportTickets');
  }

  /** POST /api/app/faq/fetchFaqs — the same FAQ set the mobile help centre renders. */
  public async fetchFaqs(): Promise<any[]> {
    const res = await apiPost('/api/app/faq/fetchFaqs');
    return unwrapList(res, 'faqs');
  }

  // ==========================================
  // EMERGENCY SOS
  // ==========================================

  /**
   * POST /api/app/sos/start — identical body to `SosService.triggerSOS`
   * (therapistName, phone, type, location{latitude,longitude,accuracy}).
   * Returns the backend `sosSessionId` used for telemetry and resolution.
   */
  public async startSOS(
    coords?: { lat: number; lng: number; accuracy?: number },
    type: 'THERAPIST_THREAT' | 'PATIENT_EMERGENCY' | string = 'THERAPIST_THREAT'
  ): Promise<{ success: boolean; sosSessionId?: string; result?: any; message?: string }> {
    const user = this.getCachedUser();
    const res = await apiPost('/api/app/sos/start', {
      therapistName: user?.fullName || user?.name || '',
      phone: user?.phone || user?.mobileNo || '',
      type,
      location: {
        latitude: coords?.lat,
        longitude: coords?.lng,
        accuracy: coords?.accuracy ?? 0,
      },
    });
    return {
      success: res.success !== false,
      sosSessionId: (res as any).sosSessionId || unwrap(res)?._id,
      result: unwrap(res),
      message: res.message,
    };
  }

  /**
   * PATCH /api/app/sos/:sessionId/location — live telemetry, same body as the
   * mobile `_startTelemetry()` loop so the admin SOS console sees one stream.
   */
  public async updateSOSLocation(
    sessionId: string,
    telemetry: { lat: number; lng: number; accuracy?: number; batteryLevel?: number; networkStrength?: string }
  ): Promise<{ success: boolean }> {
    const res = await apiPatch(`/api/app/sos/${sessionId}/location`, {
      lat: telemetry.lat,
      lng: telemetry.lng,
      accuracy: telemetry.accuracy ?? 0,
      batteryLevel: telemetry.batteryLevel,
      networkStrength: telemetry.networkStrength || 'Unknown',
      timestamp: new Date().toISOString(),
    });
    return { success: res.success !== false };
  }

  /**
   * GET /api/app/sos/my — the active session for this provider.
   * Mobile reads `res['data']` (a single session object); normalised to a list here.
   */
  public async getMySOS(): Promise<any[]> {
    const res = await apiGet('/api/app/sos/my');
    const payload = unwrap(res);
    if (!payload) return [];
    return Array.isArray(payload) ? payload : [payload];
  }

  /** POST /api/app/sos/:sessionId/resolve — requires the resolution PIN, as in mobile. */
  public async resolveSOS(sosId: string, pin: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost(`/api/app/sos/${sosId}/resolve`, { pin });
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/therapistEmergencyContact/fetchEmergencyContacts */
  public async fetchEmergencyContacts(expertId?: string): Promise<any[]> {
    const res = await apiPost('/api/app/therapistEmergencyContact/fetchEmergencyContacts', {
      expert: expertId || this.getCurrentUserId(),
    });
    return unwrapList(res, 'contacts');
  }

  /** POST /api/app/therapistEmergencyContact/createOrUpdateEmergencyContact */
  public async saveEmergencyContact(payload: {
    id?: string;
    name: string;
    phone: string;
    relation?: string;
  }): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/therapistEmergencyContact/createOrUpdateEmergencyContact', {
      expert: this.getCurrentUserId(),
      ...payload,
    });
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/therapistEmergencyContact/deleteEmergencyContact */
  public async deleteEmergencyContact(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/therapistEmergencyContact/deleteEmergencyContact', { id });
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/quickDial/fetchQuickDials — emergency quick-dial directory. */
  public async getQuickDials(): Promise<any[]> {
    const res = await apiPost('/api/app/quickDial/fetchQuickDials');
    return unwrapList(res, 'quickDials');
  }

  // ==========================================
  // APP SETTINGS (Notifications, Quiet Hours, Visibility)
  // ==========================================

  /**
   * POST /api/app/expert/notificationEnableOrDisable
   * Mirrors `ApiService.expertUpdateNotificationSettings` — the backend stores one
   * flag per channel plus the tone, so the mobile settings screen and this one write
   * the same document.
   */
  public async updateNotificationSettings(payload: {
    enablePushNotification?: boolean;
    enableEmailNotification?: boolean;
    enableWhatsAppNotification?: boolean;
    enableSMSNotification?: boolean;
    notificationTone?: string;
  }): Promise<{ success: boolean; result?: MobileExpertProfile; message?: string }> {
    const res = await apiPost('/api/app/expert/notificationEnableOrDisable', {
      user: this.getCurrentUserId(),
      ...payload,
    });
    return {
      success: res.success !== false,
      result: res.result ? this.normalizeExpertProfile(res.result) : undefined,
      message: res.message,
    };
  }

  /** Convenience wrapper: toggle push notifications only. */
  public async setNotificationEnabled(enabled: boolean): Promise<{ success: boolean; message?: string }> {
    return this.updateNotificationSettings({ enablePushNotification: enabled });
  }

  /** POST /api/app/expert/updateQuietHours — mirrors `ApiService.expertUpdateQuietHours`. */
  public async updateQuietHours(payload: {
    enabled: boolean;
    start?: string;
    end?: string;
  }): Promise<{ success: boolean; result?: MobileExpertProfile; message?: string }> {
    const res = await apiPost('/api/app/expert/updateQuietHours', {
      user: this.getCurrentUserId(),
      isQuietHoursEnabled: payload.enabled,
      quietHoursFrom: payload.start,
      quietHoursTo: payload.end,
    });
    return {
      success: res.success !== false,
      result: res.result ? this.normalizeExpertProfile(res.result) : undefined,
      message: res.message,
    };
  }

  /** POST /api/app/expert/isActivityTracking */
  public async setActivityTracking(enabled: boolean): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/expert/isActivityTracking', {
      user: this.getCurrentUserId(),
      isActivityTracking: enabled,
    });
    return { success: res.success !== false, message: res.message };
  }

  /** POST /api/app/expert/isProfileVisible */
  public async setProfileVisible(visible: boolean): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/expert/isProfileVisible', {
      user: this.getCurrentUserId(),
      isProfileVisible: visible,
    });
    return { success: res.success !== false, message: res.message };
  }

  // ==========================================
  // AI CLINICAL BUDDY
  // ==========================================

  /** GET /api/app/buddy/profile — mirrors `BuddyService.fetchProfile()`. */
  public async getBuddyProfile(): Promise<any> {
    const res = await apiGet('/api/app/buddy/profile');
    return unwrap(res);
  }

  /** POST /api/app/buddy/profile — persist companion identity/personality. */
  public async saveBuddyProfile(payload: Record<string, any>): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/buddy/profile', payload);
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** GET /api/app/buddy/dashboard — missions, streaks and life events. */
  public async getBuddyDashboard(): Promise<any> {
    const res = await apiGet('/api/app/buddy/dashboard');
    return unwrap(res);
  }

  /**
   * POST /api/app/buddy/chat — the same clinical-companion endpoint the mobile app
   * talks to, so conversation history is shared between the two clients.
   */
  public async sendBuddyChat(message: string, sessionId?: string): Promise<{ success: boolean; reply?: string; sessionId?: string; result?: any; message?: string }> {
    const res = await apiPost('/api/app/buddy/chat', { message, ...(sessionId ? { sessionId } : {}) });
    const result = unwrap(res);
    return {
      success: res.success !== false,
      reply: result?.reply || result?.message || (res as any).reply,
      sessionId: result?.sessionId || (res as any).sessionId,
      result,
      message: res.message,
    };
  }

  /** POST /api/app/buddy/chat/session — start a fresh companion session. */
  public async startBuddySession(): Promise<any> {
    const res = await apiPost('/api/app/buddy/chat/session');
    return unwrap(res);
  }

  /** POST /api/app/buddy/chat/session/active — switch the active session. */
  public async setActiveBuddySession(sessionId: string): Promise<{ success: boolean }> {
    const res = await apiPost('/api/app/buddy/chat/session/active', { sessionId });
    return { success: res.success !== false };
  }

  /** DELETE /api/app/buddy/chat/session/:sessionId */
  public async deleteBuddySession(sessionId: string): Promise<{ success: boolean }> {
    const res = await apiDelete(`/api/app/buddy/chat/session/${sessionId}`);
    return { success: res.success !== false };
  }

  /** POST /api/app/buddy/mission/complete */
  public async completeBuddyMission(taskId: string): Promise<{ success: boolean; result?: any }> {
    const res = await apiPost('/api/app/buddy/mission/complete', { taskId });
    return { success: res.success !== false, result: unwrap(res) };
  }

  /** POST /api/app/buddy/life-event/celebrated */
  public async markLifeEventCelebrated(eventId: string): Promise<{ success: boolean }> {
    const res = await apiPost('/api/app/buddy/life-event/celebrated', { eventId });
    return { success: res.success !== false };
  }

  /** GET /api/app/ai/history — shared AI consultation history. */
  public async getAiHistory(): Promise<any[]> {
    const res = await apiGet('/api/app/ai/history');
    return unwrapList(res, 'history', 'messages');
  }

  // ==========================================
  // REWARDS & GAMING BONUSES
  // ==========================================

  /** GET /api/app/gaming/bonus-offers */
  public async getBonusOffers(): Promise<any[]> {
    const res = await apiGet(`/api/app/gaming/bonus-offers?userId=${encodeURIComponent(this.getCurrentUserId() || '')}`);
    return unwrapList(res, 'offers', 'bonusOffers');
  }

  /**
   * POST /api/app/gaming/profile  body: { userId }
   * The controller answers `{ success, profile }` (gaming.controller.ts), where the
   * profile carries alias, coins, points, xp, league, streakDays and activeTier.
   */
  public async getGamingProfile(): Promise<any> {
    const res = await apiPost('/api/app/gaming/profile', { userId: this.getCurrentUserId() });
    return (res as any).profile ?? unwrap(res);
  }

  /** POST /api/app/gaming/claim-bonus */
  public async claimBonus(bonusId: string): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/gaming/claim-bonus', {
      userId: this.getCurrentUserId(),
      bonusId,
    });
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  // ==========================================
  // CLINICAL ACADEMY (TRAINING) — Proactive Tasks & Quizzes
  // ==========================================

  /** GET /api/app/gaming/topic-quizzes?userId= — mirrors `topicQuizzesProvider`. */
  public async getTopicQuizzes(): Promise<any[]> {
    const res = await apiGet(`/api/app/gaming/topic-quizzes?userId=${encodeURIComponent(this.getCurrentUserId() || '')}`);
    return unwrapList(res, 'quizzes', 'topics');
  }

  /**
   * POST /api/app/gaming/proactive-task — mirrors `proactiveTasksProvider`, which
   * POSTs with the userId and treats the response as the task list.
   */
  public async getProactiveTasks(): Promise<any[]> {
    const res = await apiPost('/api/app/gaming/proactive-task', { userId: this.getCurrentUserId() });
    return unwrapList(res, 'tasks', 'proactiveTasks');
  }

  /** POST /api/app/gaming/proactive-task — submit a completed proactive task. */
  public async submitProactiveTask(payload: Record<string, any>): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/gaming/proactive-task', {
      userId: this.getCurrentUserId(),
      ...payload,
    });
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  // ==========================================
  // TELEHEALTH
  // ==========================================

  /** POST /api/app/appointment/:appointmentId/start-telehealth */
  public async startTelehealth(appointmentId: string): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost(`/api/app/appointment/${appointmentId}/start-telehealth`);
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** POST /api/app/appointment/:appointmentId/end-telehealth */
  public async endTelehealth(appointmentId: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost(`/api/app/appointment/${appointmentId}/end-telehealth`);
    return { success: res.success !== false, message: res.message };
  }

  /**
   * PUT /api/app/appointment/:appointmentId/assessment
   * The backend registers this as a PUT (appointment.route.ts) and the mobile
   * `TelehealthService.submitAssessment` uses PUT — a POST here would 404.
   */
  public async submitTelehealthAssessment(
    appointmentId: string,
    payload: { exercises: Array<{ name: string; sets: string; reps: string; hold: string }>; notes?: string }
  ): Promise<{ success: boolean; message?: string }> {
    const res = await apiPut(`/api/app/appointment/${appointmentId}/assessment`, payload);
    return { success: res.success !== false, message: res.message };
  }

  // ==========================================
  // APPOINTMENT WRITES, TREATMENTS & CONFIG (mobile parity)
  // ==========================================

  /** POST /api/app/appointment/createAppointmentFromTherapist */
  public async createAppointment(payload: Record<string, any>): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/appointment/createAppointmentFromTherapist', {
      therapist: this.getCurrentUserId(),
      ...payload,
    });
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** POST /api/app/appointment/rescheduleAppointment */
  public async rescheduleAppointment(payload: {
    appointmentId: string;
    appointmentDate: string;
    appointmentTime?: string;
    reason?: string;
  }): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/appointment/rescheduleAppointment', payload);
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** GET /api/app/appointment/:appointmentId/payment-status */
  public async getAppointmentPaymentStatus(appointmentId: string): Promise<any> {
    const res = await apiGet(`/api/app/appointment/${appointmentId}/payment-status`);
    return unwrap(res);
  }

  /** GET /api/app/patient/fetchPatientById/:id */
  public async getPatientById(patientId: string): Promise<any> {
    const res = await apiGet(`/api/app/patient/fetchPatientById/${patientId}`);
    return unwrap(res);
  }

  /** PUT /api/app/patient/update/:patientId */
  public async updatePatient(patientId: string, payload: Record<string, any>): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPut(`/api/app/patient/update/${patientId}`, payload);
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** POST /api/app/treatment/fetchTreatments — treatment catalogue used by the visit form. */
  public async fetchTreatments(): Promise<any[]> {
    const res = await apiPost('/api/app/treatment/fetchTreatments', {});
    return unwrapList(res, 'treatments');
  }

  /** POST /api/app/appConfig/getAppConfigs — dynamic config blocks, same `types` body as mobile. */
  public async getAppConfigs(types: string[]): Promise<any> {
    const res = await apiPost('/api/app/appConfig/getAppConfigs', { types });
    return unwrap(res);
  }

  /** GET /api/admin/mobile-config — themes, legal copy, fees and FAQs (mobile config service). */
  public async getMobileConfig(params?: Record<string, string>): Promise<any> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiGet(`/api/admin/mobile-config${query}`);
    return unwrap(res);
  }

  /** POST /api/app/transaction/createTransaction */
  public async createTransaction(payload: Record<string, any>): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/transaction/createTransaction', payload);
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** POST /api/app/transaction/verifyCashfreeTransaction */
  public async verifyCashfreeTransaction(orderId: string): Promise<{ success: boolean; result?: any; message?: string }> {
    const res = await apiPost('/api/app/transaction/verifyCashfreeTransaction', { orderId });
    return { success: res.success !== false, result: unwrap(res), message: res.message };
  }

  /** POST /api/app/payments/generate-qr — UPI QR for in-visit collection. */
  public async generatePaymentQr(payload: Record<string, any>): Promise<any> {
    const res = await apiPost('/api/app/payments/generate-qr', payload);
    return unwrap(res);
  }

  /** GET /api/app/payments/status/:orderId */
  public async getPaymentStatus(orderId: string): Promise<any> {
    const res = await apiGet(`/api/app/payments/status/${orderId}`);
    return unwrap(res);
  }

  /** GET /api/app/appointments/payments/gateways-config */
  public async getPaymentGatewaysConfig(): Promise<any> {
    const res = await apiGet('/api/app/appointments/payments/gateways-config');
    return unwrap(res);
  }

  /**
   * Availability & service coverage.
   *
   * Mobile has no dedicated availability endpoint: the "where and when I work" data
   * lives on the therapist record (`areaOfServiceInfo` + `isTherapistActive`), edited
   * through `addAreaOfServiceInfo`. This reads the same record so both apps agree.
   */
  public async getAvailability(expertId?: string): Promise<{
    isAcceptingLeads: boolean;
    city: string;
    serviceAreas: string[];
    targetPincodes: string[];
    serviceRadius: number;
    maxDistance: number;
    commuteType: string;
    travelCapacity: string;
    travelTimePreference: string;
    urgentVisits: boolean;
  }> {
    const expId = expertId || this.getCurrentUserId();
    if (!expId) throw new ApiError('No authenticated provider — cannot load availability.', 401);

    const res = await this.refreshUser(expId);
    const profile = res.result;
    const area = profile?.areaOfServiceInfo || {};

    return {
      isAcceptingLeads: profile?.isTherapistActive ?? false,
      city: area.city || profile?.city || '',
      serviceAreas: area.serviceAreas || [],
      targetPincodes: area.targetPincodes || [],
      serviceRadius: Number(area.serviceRadius ?? 10),
      maxDistance: Number(area.maxDistance ?? 20),
      commuteType: area.commuteType || '',
      travelCapacity: area.travelCapacity || '',
      travelTimePreference: area.travelTimePreference || 'Anytime',
      urgentVisits: area.urgentVisits ?? false,
    };
  }

  public async autoLogin(payload: { email?: string; phone?: string }): Promise<{
    success: boolean;
    token?: string;
    result?: MobileExpertProfile;
    message?: string;
  }> {
    const res = await apiPost('/api/app/expert/autoLogin', payload);
    const token = (res as any).accessToken || (res as any).token || (res as any).result?.token;
    if (token) this.saveToken(token);
    const expert = (res as any).expert || (res as any).result?.expert || (res as any).result;
    return {
      success: res.success !== false && !!expert,
      token,
      result: expert ? this.normalizeExpertProfile(expert) : undefined,
      message: res.message,
    };
  }

  public async sendEmailOTP(email: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/expert/sendEmailOTP', { email: email.toLowerCase().trim() });
    return { success: res.success !== false, message: res.message };
  }

  public async verifyEmailOTP(email: string, otp: string): Promise<{
    success: boolean;
    token?: string;
    result?: MobileExpertProfile;
    message?: string;
  }> {
    const res = await apiPost('/api/app/expert/verifyEmailOTP', { email: email.toLowerCase().trim(), otp });
    const token = (res as any).accessToken || (res as any).token || (res as any).result?.token;
    if (token) this.saveToken(token);
    const expert = (res as any).expert || (res as any).result?.expert || (res as any).result;
    return {
      success: res.success !== false,
      token,
      result: expert?._id ? this.normalizeExpertProfile(expert) : undefined,
      message: res.message,
    };
  }

  public async requestEmailVerification(email: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/expert/requestEmailVerification', { email: email.toLowerCase().trim() });
    return { success: res.success !== false, message: res.message };
  }

  public async checkEmailVerificationStatus(email: string): Promise<any> {
    const res = await apiGet(
      `/api/app/expert/checkEmailVerificationStatus?email=${encodeURIComponent(email.toLowerCase().trim())}`
    );
    return unwrap(res);
  }

  public async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/expert/forgotPassword', { email: email.toLowerCase().trim() });
    return { success: res.success !== false, message: res.message };
  }

  public async sendPasswordResetOTP(email: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost('/api/app/expert/sendPasswordResetOTP', { email: email.toLowerCase().trim() });
    return { success: res.success !== false, message: res.message };
  }

  public async verifyPasswordResetOTP(email: string, otp: string): Promise<{
    success: boolean;
    resetToken?: string;
    message?: string;
  }> {
    const res = await apiPost('/api/app/expert/verifyPasswordResetOTP', {
      email: email.toLowerCase().trim(),
      otp,
    });
    return {
      success: res.success !== false,
      resetToken: (res as any).resetToken || (res as any).token,
      message: res.message,
    };
  }

  public async resetPassword(payload: { token: string; newPassword: string }): Promise<{
    success: boolean;
    message?: string;
  }> {
    const res = await apiPost('/api/app/expert/resetPassword', payload);
    return { success: res.success !== false, message: res.message };
  }

  public async updateOnboardingTour(payload: Record<string, any>): Promise<{ success: boolean }> {
    const res = await apiPost('/api/app/expert/updateOnboardingTour', payload);
    return { success: res.success !== false };
  }

  public async aiConsult(prompt: string, context?: Record<string, any>): Promise<any> {
    const res = await apiPost('/api/app/ai/consult', { prompt, ...context });
    return unwrap(res);
  }

  public async getChats(): Promise<any[]> {
    const res = await apiGet('/api/v1/chats');
    return unwrapList(res, 'chats', 'items');
  }

  public async createChat(payload: Record<string, any>): Promise<any> {
    const res = await apiPost('/api/v1/chats', payload);
    return unwrap(res);
  }

  public async getChatMessages(chatId: string): Promise<any[]> {
    const res = await apiGet(`/api/v1/chats/${chatId}/messages?limit=100`);
    return unwrapList(res, 'messages', 'items');
  }

  public async sendChatMessage(chatId: string, text: string): Promise<any> {
    const res = await apiPost(`/api/v1/chats/${chatId}/messages`, { text });
    return unwrap(res);
  }

  public async initializeSupportChat(): Promise<any> {
    const res = await apiPost('/api/app/support-chat/initialize', {});
    return unwrap(res);
  }

  public async getMapsConfig(): Promise<any> {
    const res = await apiGet('/api/app/integrations/google-maps/mobile-config');
    return unwrap(res);
  }

  public async uploadPaymentProof(appointmentId: string, formData: FormData): Promise<{ success: boolean; message?: string }> {
    const res = await apiPost(`/api/app/appointments/${appointmentId}/payment-proof`, undefined, { formData });
    return { success: res.success !== false, message: res.message };
  }

  public async getFlashAlerts(): Promise<any[]> {
    const res = await apiGet('/api/admin/flash-alerts/active?targetAudience=therapists');
    return unwrapList(res, 'alerts', 'items');
  }

  public async trackFlashAlertClick(id: string): Promise<void> {
    await apiPost(`/api/admin/flash-alerts/track/${id}/click`, {});
  }

  /** Telehealth-eligible appointments = live appointments filtered client-side by consultationType/mode */
  public async getTelehealthAppointments(therapistId?: string): Promise<any[]> {
    const appointments = await this.getAppointments(therapistId);
    return appointments.filter((a: any) => {
      const mode = (a.consultationType || a.mode || a.visitType || a.appointmentType || '').toString().toLowerCase();
      return mode.includes('tele') || mode.includes('video') || a.isTelehealth === true;
    });
  }
}

export const providerApi = new ProviderApiService();

// ── Export Legacy Aliases for Backwards Compatibility ──────
export const sendProviderOtp = (phone: string) => providerApi.sendOTP(phone);
export const verifyProviderOtp = (phone: string, otp: string) => providerApi.verifyOTP(phone, otp);
export const loginWithMobile = (phone: string, otp: string) => providerApi.verifyOTP(phone, otp);
export const loginWithEmail = (email: string, pass: string) => providerApi.loginFromEmail(email, pass);

// ── WalletTransaction type (matches mobile WalletTransaction model) ──
export interface WalletTransaction {
  _id?: string;
  id?: string;
  type: 'CREDIT' | 'DEBIT';
  category?: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'SUCCESS' | 'PENDING' | 'FAILED';
  description?: string;
  date?: string;
  createdAt?: string;
}

export async function fetchIncomingLeads(): Promise<LeadBroadcast[]> {
  const data = await providerApi.getLeads();
  return (data.newLeads || []) as LeadBroadcast[];
}

export async function respondToLeadBroadcast(
  leadId: string,
  response: 'ACCEPTED' | 'DECLINED' | 'ACCEPT' | 'DECLINE'
): Promise<{ success: boolean; message?: string }> {
  const accepted = response === 'ACCEPTED' || response === 'ACCEPT';
  return accepted ? providerApi.expressInterest(leadId) : providerApi.passLead(leadId);
}

export function resolveProfileImage(photo?: string | null): string | null {
  if (!photo || photo === 'null' || photo === 'undefined' || photo === '') return null;
  if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
    return photo;
  }
  const clean = photo.startsWith('/') ? photo : `/${photo}`;
  // Same normalisation as mobile's `UserModel._normalizeUrl` — relative asset paths are
  // resolved against the configured backend origin, not a hard-coded host.
  return `${getBackendOrigin()}${clean}`;
}

