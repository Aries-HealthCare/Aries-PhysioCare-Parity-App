'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi, resolveProfileImage } from '@/services/provider-api';
import { DynamicAppLogo } from '@/components/ui/dynamic-app-logo';
import { CountrySelector, COUNTRIES_CONFIG } from '@/components/country-selector';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  ShieldCheck,
  Camera,
  Save,
  CheckCircle2,
  Stethoscope,
  QrCode,
  Download,
  Share2,
  Calendar,
  Sparkles,
  Navigation,
  Plus,
  Trash2,
  ShieldAlert,
  Users,
  Loader2,
  CreditCard,
  Building2,
  FileText,
  Clock,
  Car,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProviderProfilePage() {
  const { user, updateUserData } = useProviderAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<
    'personal' | 'professional' | 'banking' | 'serviceArea' | 'emergency' | 'idcard'
  >('personal');

  // Country
  const [selectedCountry, setSelectedCountry] = useState<string>(
    (user as any)?.countryName || (user as any)?.country || 'India'
  );
  const currentCountry = COUNTRIES_CONFIG[selectedCountry] || COUNTRIES_CONFIG['India'];

  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [poseState, setPoseState] = useState(0);

  // Address
  const [streetAddress, setStreetAddress] = useState('');
  const [addressLineTwo, setAddressLineTwo] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [zipCode, setZipCode] = useState('');

  // Country-specific KYC Values
  const [idDocValues, setIdDocValues] = useState<Record<string, string>>({});

  // Professional Info
  const [role, setRole] = useState('Physiotherapist');
  const [qualification, setQualification] = useState('BPT (Bachelor of Physiotherapy)');
  const [specializations, setSpecializations] = useState<string[]>([
    'Musculoskeletal & Orthopedic Rehabilitation',
    'Post-Operative Rehabilitation',
  ]);
  const [certifications, setCertifications] = useState<string[]>(['Dry Needling', 'Manual Therapy']);
  const [experience, setExperience] = useState('3–5 Years');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [stateCouncil, setStateCouncil] = useState('');
  const [currentlyWorkingAt, setCurrentlyWorkingAt] = useState('');
  const [hasOwnClinic, setHasOwnClinic] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [clinicMonth, setClinicMonth] = useState('');
  const [clinicYear, setClinicYear] = useState('');
  const [portableEquipment, setPortableEquipment] = useState<string[]>([
    'TENS / IFT Machine',
    'Therabands & Weights',
  ]);

  // Banking Details
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');
  const [businessName, setBusinessName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState(''); // IFSC, Sort Code, Routing Number, IBAN
  const [upiId, setUpiId] = useState('');
  const [taxNumber, setTaxNumber] = useState(''); // PAN, SSN, UTR, SIN

  // Service Territory & Commute
  const [operatingRadiusKm, setOperatingRadiusKm] = useState('10');
  const [pincodes, setPincodes] = useState<string[]>(['400092', '400103', '400067']);
  const [newPincode, setNewPincode] = useState('');
  const [commuteMode, setCommuteMode] = useState('two_wheeler');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [dailyCapacity, setDailyCapacity] = useState('standard');
  const [timePreference, setTimePreference] = useState('flexible');
  const [acceptEmergencyVisits, setAcceptEmergencyVisits] = useState(true);

  // Emergency Contacts
  const [emergencyName, setEmergencyName] = useState('Emergency SOS Team');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98201 44219');
  const [emergencyRelation, setEmergencyRelation] = useState('Clinical Lead');
  const [secEmergencyName, setSecEmergencyName] = useState('');
  const [secEmergencyPhone, setSecEmergencyPhone] = useState('');
  const [secEmergencyRelation, setSecEmergencyRelation] = useState('');

  // UI state
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Digital ID 3D Animation State
  const [isIdCardFlipped, setIsIdCardFlipped] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCardTilt({
      x: -(y / (rect.height / 2)) * 10,
      y: (x / (rect.width / 2)) * 10,
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  // Populate from user context on mount
  useEffect(() => {
    if (user) {
      const u = user as any;
      const fName = u.firstName || '';
      const lName = u.lastName || '';
      const full = u.fullName || u.name || `${fName} ${lName}`.trim();
      setFullName(full);
      setFirstName(fName || full.split(' ')[0] || '');
      setLastName(lName || full.split(' ').slice(1).join(' ') || '');
      setEmail(u.email || '');
      setPhone(u.phone || u.mobileNo || u.phoneNumber || '');
      setGender(u.gender || 'male');
      setDob(u.dob || u.dateOfBirth || '');
      setProfilePhoto(u.profilePhoto || u.profileImage || '');

      if (u.countryName || u.country) setSelectedCountry(u.countryName || u.country);
      if (u.city) setCity(u.city);
      if (u.state) setState(u.state);
      if (u.streetAddress || u.address?.line1) setStreetAddress(u.streetAddress || u.address?.line1 || '');
      if (u.addressLineTwo || u.address?.line2) setAddressLineTwo(u.addressLineTwo || u.address?.line2 || '');
      if (u.area || u.address?.area) setArea(u.area || u.address?.area || '');
      if (u.zipCode || u.pinCode || u.address?.pinCode) setZipCode(u.zipCode || u.pinCode || u.address?.pinCode || '');

      // Professional
      if (u.role || u.designation) setRole(u.role || u.designation);
      if (u.qualification) setQualification(u.qualification);
      if (u.specialization && Array.isArray(u.specialization)) setSpecializations(u.specialization);
      else if (typeof u.specialization === 'string' && u.specialization) setSpecializations([u.specialization]);
      if (u.certifications && Array.isArray(u.certifications)) setCertifications(u.certifications);
      if (u.yearsOfExperience || u.experience) setExperience(String(u.yearsOfExperience || u.experience));
      if (u.licenseNumber) setLicenseNumber(u.licenseNumber);
      if (u.stateCouncil) setStateCouncil(u.stateCouncil);
      if (u.currentlyWorkingAt) setCurrentlyWorkingAt(u.currentlyWorkingAt);
      if (u.hasOwnClinic !== undefined) setHasOwnClinic(!!u.hasOwnClinic);
      if (u.clinicName) setClinicName(u.clinicName);
      if (u.clinicEstablishmentMonth) setClinicMonth(u.clinicEstablishmentMonth);
      if (u.clinicEstablishmentYear) setClinicYear(u.clinicEstablishmentYear);

      // Banking
      if (u.bankDetails) {
        setBankName(u.bankDetails.bankName || '');
        setAccountHolderName(u.bankDetails.accountHolderName || '');
        setAccountNumber(u.bankDetails.accountNumber || '');
        setConfirmAccountNumber(u.bankDetails.accountNumber || '');
        setBankCode(u.bankDetails.ifscCode || u.bankDetails.sortCode || u.bankDetails.iban || '');
        setUpiId(u.bankDetails.upiId || '');
        setTaxNumber(u.bankDetails.panNumber || u.bankDetails.taxNumber || '');
      }

      // Territory
      if (u.targetPincodes && u.targetPincodes.length > 0) setPincodes(u.targetPincodes);
      if (u.operatingRadiusKm || u.radius) setOperatingRadiusKm(String(u.operatingRadiusKm || u.radius || '10'));
      if (u.commuteMode) setCommuteMode(u.commuteMode);
      if (u.drivingLicenseNumber) setDrivingLicense(u.drivingLicenseNumber);

      // Emergency
      if (u.emergencyContacts && u.emergencyContacts.length > 0) {
        setEmergencyName(u.emergencyContacts[0].name || '');
        setEmergencyPhone(u.emergencyContacts[0].phone || '');
        setEmergencyRelation(u.emergencyContacts[0].relation || '');
        if (u.emergencyContacts[1]) {
          setSecEmergencyName(u.emergencyContacts[1].name || '');
          setSecEmergencyPhone(u.emergencyContacts[1].phone || '');
          setSecEmergencyRelation(u.emergencyContacts[1].relation || '');
        }
      }
    }
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const res = await providerApi.uploadProfilePhoto(file, gender);
      if (res.success && res.url) {
        setProfilePhoto(res.url);
        updateUserData({ profilePhoto: res.url });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.warn('Photo upload failed:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim() || fullName,
        name: `${firstName} ${lastName}`.trim() || fullName,
        email,
        phone,
        mobileNo: phone,
        gender,
        dob,
        countryName: selectedCountry,
        countryCode: currentCountry.dialCode,
        streetAddress,
        addressLineTwo,
        area,
        city,
        state,
        zipCode,
        role,
        designation: role,
        qualification,
        specialization: specializations,
        certifications,
        yearsOfExperience: experience,
        licenseNumber,
        stateCouncil,
        currentlyWorkingAt,
        hasOwnClinic,
        clinicName,
        clinicEstablishmentMonth: clinicMonth,
        clinicEstablishmentYear: clinicYear,
        portableEquipment,
        bankDetails: {
          accountType,
          businessName: accountType === 'business' ? businessName : undefined,
          bankName,
          accountHolderName,
          accountNumber,
          ifscCode: selectedCountry === 'India' ? bankCode : undefined,
          sortCode: selectedCountry === 'United Kingdom' ? bankCode : undefined,
          iban: ['Germany', 'UAE / Dubai'].includes(selectedCountry) ? bankCode : undefined,
          routingNumber: selectedCountry === 'United States' ? bankCode : undefined,
          transitNumber: selectedCountry === 'Canada' ? bankCode : undefined,
          upiId,
          panNumber: selectedCountry === 'India' ? taxNumber : undefined,
          taxNumber,
        },
        targetPincodes: pincodes,
        operatingRadiusKm: parseInt(operatingRadiusKm, 10) || 10,
        commuteMode,
        drivingLicenseNumber: drivingLicense,
        dailyCapacity,
        timePreference,
        acceptEmergencyVisits,
        emergencyContacts: [
          { name: emergencyName, phone: emergencyPhone, relation: emergencyRelation },
          ...(secEmergencyName ? [{ name: secEmergencyName, phone: secEmergencyPhone, relation: secEmergencyRelation }] : []),
        ],
      };

      await providerApi.updateProfile(payload);
      updateUserData(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.warn('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPincode = () => {
    const clean = newPincode.trim();
    if (clean && !pincodes.includes(clean)) {
      setPincodes([...pincodes, clean]);
      setNewPincode('');
    }
  };

  const handleRemovePincode = (p: string) => {
    setPincodes(pincodes.filter((item) => item !== p));
  };

  const axId =
    user?.axId ||
    user?.therapistId ||
    (phone ? `AX-${currentCountry.code}-${phone.slice(-4)}` : `AX-${currentCountry.code}-PROV`);

  const resolvedPhoto = resolveProfileImage(profilePhoto || user?.profilePhoto);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-border p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Profile Avatar */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-muted/60 border-2 border-primary/40 shadow-md flex items-center justify-center relative">
                {resolvedPhoto ? (
                  <img
                    src={resolvedPhoto}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary/60" />
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-primary text-white shadow-lg hover:scale-105 transition-transform"
                title="Upload Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Profile Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-outfit">
                  {fullName ? `Dr. ${fullName}` : 'Specialist Profile'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Verified Specialist
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>{role}</span>
                <span>•</span>
                <span>{qualification}</span>
                <span>•</span>
                <span>{currentCountry.flag} {city}, {currentCountry.name}</span>
              </p>
              <p className="text-[11px] font-mono text-primary font-bold">
                ID: {axId}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full sm:w-auto h-11 px-6 rounded-2xl font-bold gap-2 shadow-md shadow-primary/20"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : savedSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{savedSuccess ? 'Changes Saved!' : 'Save All Changes'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Bar matching mobile parity */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 border border-border rounded-2xl overflow-x-auto no-scrollbar text-xs font-bold font-outfit">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'personal'
              ? 'bg-card text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-3.5 h-3.5 text-primary" />
          <span>Personal & KYC</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('professional')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'professional'
              ? 'bg-card text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-primary" />
          <span>Clinical & Qualifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banking')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'banking'
              ? 'bg-card text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-primary" />
          <span>Banking & Payouts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('serviceArea')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'serviceArea'
              ? 'bg-card text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>Territory & Commute</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emergency')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'emergency'
              ? 'bg-card text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-primary" />
          <span>Emergency Contacts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('idcard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'idcard'
              ? 'bg-card text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-primary" />
          <span>Digital ID Card</span>
        </button>
      </div>

      {/* TAB 1: Personal & KYC */}
      {activeTab === 'personal' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">
              Personal Information & Identity Documents
            </h2>
            <p className="text-xs text-muted-foreground">
              Select your practice country to configure region-specific identification and tax verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-bold">Country of Practice</Label>
              <div className="mt-1.5">
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onSelectCountry={(c) => setSelectedCountry(c)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Dr. Rajesh"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-bold">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh@physiocare.com"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Mobile Number</Label>
              <div className="flex gap-2 mt-1.5">
                <span className="flex items-center px-3 rounded-xl bg-muted/60 text-xs font-mono font-bold">
                  {currentCountry.dialCode}
                </span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={currentCountry.phonePlaceholder}
                  className="h-11 rounded-xl text-xs font-mono font-bold flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">Date of Birth</Label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1.5 h-11 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground font-outfit">
              Residential & Postal Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold">Flat / House No / Building</Label>
                <Input
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. A-402, Lotus Grandeur"
                  className="mt-1.5 h-11 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Road / Street Name</Label>
                <Input
                  value={addressLineTwo}
                  onChange={(e) => setAddressLineTwo(e.target.value)}
                  placeholder="e.g. Link Road, Near Metro Station"
                  className="mt-1.5 h-11 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs font-bold">Locality / Area</Label>
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Andheri West"
                  className="mt-1.5 h-11 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="mt-1.5 h-11 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">State / Province</Label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="mt-1.5 h-11 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Postal / ZIP Code</Label>
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="400053"
                  className="mt-1.5 h-11 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Country Specific Identity Checklist */}
          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground font-outfit flex items-center gap-2">
              <span>{currentCountry.flag} {currentCountry.name} KYC Requirements</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCountry.idRequirements.map((req, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground block">
                      {req.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {req.type === 'upload' ? 'Verified Document Uploaded' : req.placeholder || 'Verified Input'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Clinical & Qualifications */}
      {activeTab === 'professional' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">
              Clinical Specializations & Hospital Affiliations
            </h2>
            <p className="text-xs text-muted-foreground">
              Define your healthcare role, clinical degrees, registration council numbers, and private clinic setup.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-bold">Healthcare Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 px-3 mt-1.5 bg-background border border-input rounded-xl text-xs font-medium"
              >
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Occupational Therapist">Occupational Therapist</option>
                <option value="Nurse">Nurse / Clinical Care</option>
                <option value="Dietician">Dietician & Nutritionist</option>
                <option value="Care Taker">Care Taker / Attendant</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold">Primary Qualification</Label>
              <Input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="BPT / MPT (Orthopedics)"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Years of Experience</Label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-11 px-3 mt-1.5 bg-background border border-input rounded-xl text-xs font-medium"
              >
                <option value="0–1 Years">0–1 Years (Fresher)</option>
                <option value="1–3 Years">1–3 Years (Junior Specialist)</option>
                <option value="3–5 Years">3–5 Years (Mid-Level Expert)</option>
                <option value="5–10 Years">5–10 Years (Senior Consultant)</option>
                <option value="10+ Years">10+ Years (Lead Specialist)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold">Medical Council Registration / License Number</Label>
              <Input
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. OT/PT-MH-12480"
                className="mt-1.5 h-11 rounded-xl text-xs font-mono font-bold uppercase"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Issuing State / National Council</Label>
              <Input
                value={stateCouncil}
                onChange={(e) => setStateCouncil(e.target.value)}
                placeholder="e.g. Maharashtra Council of OT & PT (MSCPT)"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground font-outfit">
              Hospital & Private Clinic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold">Currently Attached Hospital / Institute</Label>
                <Input
                  value={currentlyWorkingAt}
                  onChange={(e) => setCurrentlyWorkingAt(e.target.value)}
                  placeholder="e.g. Kokilaben Dhirubhai Ambani Hospital"
                  className="mt-1.5 h-11 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">Do you own / operate a private clinic?</Label>
                  <input
                    type="checkbox"
                    checked={hasOwnClinic}
                    onChange={(e) => setHasOwnClinic(e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                </div>
                {hasOwnClinic && (
                  <Input
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Clinic Name (e.g. Aries Advanced Rehab Clinic)"
                    className="mt-1.5 h-11 rounded-xl text-xs font-medium animate-in fade-in"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Banking & Payouts */}
      {activeTab === 'banking' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">
              Banking & Instant Settlement Configuration
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct settlement account for receiving 60% session earnings, overtime bonuses, and travel allowances.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-bold">Account Type</Label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="w-full h-11 px-3 mt-1.5 bg-background border border-input rounded-xl text-xs font-medium"
              >
                <option value="individual">Individual / Savings Account</option>
                <option value="business">Business / Current Account</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold">Bank Name</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank / Barclays / TD Bank"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Account Beneficiary Name</Label>
              <Input
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="As printed on bank records"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-bold">Account Number</Label>
              <Input
                type="password"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1.5 h-11 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">{currentCountry.bankFields.codeLabel}</Label>
              <Input
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                placeholder={currentCountry.bankFields.codePlaceholder}
                className="mt-1.5 h-11 rounded-xl text-xs font-mono font-bold uppercase"
              />
            </div>

            {selectedCountry === 'India' && (
              <div>
                <Label className="text-xs font-bold">UPI ID (For Instant 2X Settlement)</Label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="doctor@okaxis / mobile@upi"
                  className="mt-1.5 h-11 rounded-xl text-xs font-medium"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Service Territory & Commute */}
      {activeTab === 'serviceArea' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">
              Service Territory, Commute & Capacity
            </h2>
            <p className="text-xs text-muted-foreground">
              Define your geographic reach, preferred pincodes, daily visit target, and transit vehicles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">Max Operating Radius</Label>
                  <span className="text-xs font-mono font-black text-primary">
                    {operatingRadiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={operatingRadiusKm}
                  onChange={(e) => setOperatingRadiusKm(e.target.value)}
                  className="w-full mt-2 accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                  <span>5 km (Local)</span>
                  <span>25 km (Standard)</span>
                  <span>50 km (Metro-wide)</span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold">Commute & Transit Mode</Label>
                <select
                  value={commuteMode}
                  onChange={(e) => setCommuteMode(e.target.value)}
                  className="w-full h-11 px-3 mt-1.5 bg-background border border-input rounded-xl text-xs font-medium"
                >
                  <option value="two_wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
                  <option value="four_wheeler">Four-Wheeler (Personal Car)</option>
                  <option value="public_transit">Public Transit (Metro / Rail / Auto)</option>
                  <option value="bicycle">Bicycle / Walking (Nearby Radius)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold">Daily Visit Capacity Target</Label>
                <select
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(e.target.value)}
                  className="w-full h-11 px-3 mt-1.5 bg-background border border-input rounded-xl text-xs font-medium"
                >
                  <option value="part_time">Part-Time (Up to 3 visits / day)</option>
                  <option value="standard">Standard (4 to 5 visits / day)</option>
                  <option value="high_demand">High-Demand (6 to 8 visits / day)</option>
                  <option value="hero">Clinical Hero (8+ visits / day)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold">Target Pincodes / Local Postal Zones</Label>
              <div className="flex gap-2">
                <Input
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  placeholder="e.g. 400053 or M5V 2T6"
                  className="h-11 rounded-xl text-xs font-mono font-bold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPincode();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddPincode}
                  className="h-11 px-4 rounded-xl font-bold gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 border border-border rounded-2xl min-h-[100px]">
                {pincodes.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePincode(p)}
                      className="hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Emergency Contacts */}
      {activeTab === 'emergency' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">
              Clinical Safety & Emergency SOS Contacts
            </h2>
            <p className="text-xs text-muted-foreground">
              These verified emergency contacts are triggered immediately when you activate the in-app SOS button during home visits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-bold">Primary Contact Name</Label>
              <Input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Dr. Anand Verma"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Primary Contact Phone</Label>
              <Input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 98201 44219"
                className="mt-1.5 h-11 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Relationship</Label>
              <Input
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                placeholder="Clinical Lead / Spouse / Colleague"
                className="mt-1.5 h-11 rounded-xl text-xs font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Digital ID Card */}
      {activeTab === 'idcard' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in flex flex-col items-center">
          <div className="text-center space-y-1">
            <h2 className="text-base font-extrabold text-foreground font-outfit">
              Official Digital Healthcare Specialist Credential
            </h2>
            <p className="text-xs text-muted-foreground">
              Show this interactive credential during home consultations for instant patient authentication.
            </p>
          </div>

          {/* 3D ID Card Container */}
          <div
            className="w-full max-w-sm h-96 perspective cursor-pointer"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            onClick={() => setIsIdCardFlipped(!isIdCardFlipped)}
          >
            <div
              className={`w-full h-full relative rounded-3xl transition-transform duration-500 transform-style-3d shadow-2xl ${
                isIdCardFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transform: isIdCardFlipped
                  ? 'rotateY(180deg)'
                  : `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
              }}
            >
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-card via-card/90 to-primary/10 border-2 border-primary/30 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-xl">
                <div className="flex items-center justify-between">
                  <DynamicAppLogo className="h-8 w-auto" />
                  <span className="text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full bg-primary text-white">
                    Official Specialist
                  </span>
                </div>

                <div className="flex items-center gap-4 my-auto">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-primary shrink-0">
                    {resolvedPhoto ? (
                      <img src={resolvedPhoto} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary m-auto" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-foreground font-outfit">
                      Dr. {fullName || 'Specialist'}
                    </h3>
                    <p className="text-[11px] font-bold text-primary">{role}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{axId}</p>
                    <p className="text-[10px] text-muted-foreground">{currentCountry.flag} {city}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Council: {licenseNumber || 'Verified'}</span>
                  <span>Click to Flip ↺</span>
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-card via-card to-background border-2 border-primary/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Credential Verification
                  </span>
                  <h4 className="text-xs font-black text-foreground">Aries PhysioCare Network</h4>
                </div>

                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-2xl shadow-inner flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-foreground" />
                </div>

                <p className="text-[9px] text-center text-muted-foreground font-mono">
                  Scan QR code with any smartphone to verify therapist registration status and background check clearance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
