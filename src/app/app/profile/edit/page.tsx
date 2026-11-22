'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
  Briefcase,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi, resolveProfileImage } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';

export default function EditProfilePage() {
  const { user, refreshProfile, updateUserData } = useProviderAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [qualification, setQualification] = useState('');
  const [designation, setDesignation] = useState('Physiotherapist');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [currentlyWorkingAt, setCurrentlyWorkingAt] = useState('');
  const [clinicName, setClinicName] = useState('');

  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [panNumber, setPanNumber] = useState('');

  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [refreshingPortrait, setRefreshingPortrait] = useState(false);
  const [saving, setSaving] = useState(false);

  // Email OTP verification
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || user.fullName?.split(' ')[0] || '');
    setLastName(user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '');
    setEmail(user.email || '');
    setGender(user.gender || 'male');
    setDob(user.dob ? String(user.dob).slice(0, 10) : '');
    setStreetAddress(user.streetAddress || '');
    setCity(user.city || user.areaOfServiceInfo?.city || '');
    setStateName(user.state || '');
    setZipCode(user.zipCode || user.areaOfServiceInfo?.pincode || '');

    setQualification(user.professionalInfo?.qualification || user.qualification || '');
    setDesignation(user.professionalInfo?.professionalRole || user.designation || 'Physiotherapist');
    setLicenseNumber(user.licenseNumber || '');
    setExperience(String(user.professionalInfo?.yearOfExperience || user.yearsOfExperience || user.experience || ''));
    setCurrentlyWorkingAt(user.professionalInfo?.currentlyWorkingAt || user.currentlyWorkingAt || '');
    setClinicName(user.professionalInfo?.clinicName || user.clinicName || '');

    setAccountHolderName(user.bankInfo?.accountHolderName || user.fullName || '');
    setBankName(user.bankInfo?.bankName || '');
    setAccountNumber(user.bankInfo?.accountNumber || '');
    setIfscCode(user.bankInfo?.ifscCode || '');
    setUpiId(user.bankInfo?.upiId || '');
    setPanNumber(user.bankInfo?.panNumber || '');

    setPhotoUrl(user.profilePhoto || user.profileImageUrl || user.profileImage || '');
  }, [user]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await providerApi.uploadProfilePhoto(file, gender);
      if (!res.success || !res.url) {
        throw new Error(res.message || 'Portrait upload failed.');
      }
      setPhotoUrl(res.url);
      updateUserData({ profilePhoto: res.url, profileImageUrl: res.url });
      toast({ title: 'Portrait updated', description: 'Your new clinical portrait has been saved.' });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.message || 'Could not upload your portrait photo.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRefreshPortrait = async () => {
    setRefreshingPortrait(true);
    try {
      const res = await providerApi.refreshPortrait();
      if (!res.success) throw new Error(res.message || 'Could not refresh portrait.');
      if (res.url) {
        setPhotoUrl(res.url);
        updateUserData({ profilePhoto: res.url, profileImageUrl: res.url });
      }
      toast({ title: 'Portrait refreshed', description: 'Latest clinical portrait synced.' });
    } catch (err: any) {
      toast({
        title: 'Refresh failed',
        description: err?.message || 'Portrait refresh is currently unavailable.',
        variant: 'destructive',
      });
    } finally {
      setRefreshingPortrait(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'Invalid email', description: 'Enter a valid email address first.', variant: 'destructive' });
      return;
    }
    setOtpBusy(true);
    try {
      const res = await providerApi.sendEmailOTP(email.trim());
      if (!res.success) throw new Error(res.message || 'Could not send verification code.');
      setOtpSent(true);
      toast({ title: 'Verification code sent', description: `Check ${email.trim()} for your OTP.` });
    } catch (err: any) {
      toast({
        title: 'Could not send OTP',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setOtpBusy(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.trim().length < 4) return;
    setOtpBusy(true);
    try {
      const res = await providerApi.verifyEmailOTP(email.trim(), emailOtp.trim());
      if (!res.success) throw new Error(res.message || 'Invalid verification code.');
      setOtpSent(false);
      setEmailOtp('');
      await refreshProfile();
      toast({ title: 'Email verified', description: 'Your email address has been verified.' });
    } catch (err: any) {
      toast({
        title: 'Verification failed',
        description: err?.message || 'The code was not accepted.',
        variant: 'destructive',
      });
    } finally {
      setOtpBusy(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast({ title: 'First name required', description: 'Enter your first name to save.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await providerApi.editProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        name: fullName,
        email: email.trim(),
        gender,
        dob: dob || undefined,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        zipCode: zipCode.trim(),
        designation: designation.trim(),
        qualification: qualification.trim(),
        licenseNumber: licenseNumber.trim(),
        yearsOfExperience: experience.trim(),
        currentlyWorkingAt: currentlyWorkingAt.trim(),
        clinicName: clinicName.trim(),
        professionalInfo: {
          ...user?.professionalInfo,
          professionalRole: designation.trim(),
          qualification: qualification.trim(),
          yearOfExperience: experience.trim(),
          currentlyWorkingAt: currentlyWorkingAt.trim(),
          clinicName: clinicName.trim(),
        },
        bankInfo: {
          ...user?.bankInfo,
          accountHolderName: accountHolderName.trim(),
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          upiId: upiId.trim(),
          panNumber: panNumber.trim().toUpperCase(),
        },
      });

      if (!res.success) throw new Error(res.message || 'Could not update profile.');
      await refreshProfile();
      toast({ title: 'Profile updated', description: 'Your clinician profile changes have been saved.' });
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Unable to save profile changes.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resolvedPhoto = resolveProfileImage(photoUrl);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Edit Clinician Profile</h1>
          <p className="text-xs text-muted-foreground">
            Update your personal details, AI studio portrait, clinical credentials, and payout bank details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-10 rounded-2xl text-xs font-bold">
            <Link href="/app/profile/service-area">Service Area Settings</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-10 rounded-2xl text-xs font-bold">
            <Link href="/app/profile/digital-id">Digital ID Card</Link>
          </Button>
        </div>
      </div>

      {/* Studio Portrait Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          {resolvedPhoto ? (
            <img
              src={resolvedPhoto}
              alt={firstName || 'Clinician'}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-primary/30 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-primary/15 text-primary flex items-center justify-center text-3xl font-outfit font-black">
              {(firstName || 'C').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h2 className="text-base font-outfit font-extrabold">Professional Portrait</h2>
          <p className="text-xs text-muted-foreground max-w-lg">
            Upload a clear front-facing photo to generate your verified AriesXpert clinical portrait used on your Digital ID and patient booking cards.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              disabled={uploadingPhoto}
              onClick={() => fileRef.current?.click()}
              className="h-9 rounded-xl text-xs font-bold gap-1.5"
            >
              {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{uploadingPhoto ? 'Uploading…' : 'Upload New Photo'}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={refreshingPortrait}
              onClick={handleRefreshPortrait}
              className="h-9 rounded-xl text-xs font-bold gap-1.5"
            >
              {refreshingPortrait ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Refresh Portrait</span>
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Info */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Personal Information &amp; Address</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">First Name *</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10 rounded-xl" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Last Name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold">Email Address</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={otpBusy}
                  onClick={handleSendEmailOtp}
                  className="h-10 rounded-xl text-xs font-bold gap-1.5 shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{otpSent ? 'Resend OTP' : 'Verify Email'}</span>
                </Button>
              </div>
              {otpSent && (
                <div className="flex gap-2 pt-2">
                  <Input
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter email OTP"
                    className="h-10 rounded-xl max-w-[200px] font-mono"
                  />
                  <Button type="button" onClick={handleVerifyEmailOtp} disabled={otpBusy} className="h-10 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm OTP
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Gender</Label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Date of Birth</Label>
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold">Street Address</Label>
              <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">State &amp; Pincode</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} className="h-10 rounded-xl" />
                <Input placeholder="Pincode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="h-10 rounded-xl font-mono" />
              </div>
            </div>
          </div>
        </section>

        {/* Professional Info */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <span>Clinical Credentials</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Professional Role</Label>
              <Input value={designation} onChange={(e) => setDesignation(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Highest Qualification</Label>
              <Input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. BPT, MPT Orthopedics" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Council Registration / License No.</Label>
              <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="h-10 rounded-xl font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Years of Experience</Label>
              <Input value={experience} onChange={(e) => setExperience(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Currently Working At</Label>
              <Input value={currentlyWorkingAt} onChange={(e) => setCurrentlyWorkingAt(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Own Clinic Name (Optional)</Label>
              <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="h-10 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Banking */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Payout Bank Details</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Account Holder Name</Label>
              <Input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Bank Name</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Account Number</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="h-10 rounded-xl font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">IFSC / Routing Code</Label>
              <Input value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} className="h-10 rounded-xl font-mono uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">UPI ID</Label>
              <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">PAN / Tax ID</Label>
              <Input value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} className="h-10 rounded-xl font-mono uppercase" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Bank updates sync directly to your verified AriesXpert payout profile.
          </p>
        </section>

        <div className="flex justify-end gap-3">
          <Button asChild type="button" variant="outline" className="h-11 rounded-2xl text-xs font-bold">
            <Link href="/app/profile">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving} className="h-11 px-8 rounded-2xl text-xs font-extrabold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes…' : 'Save Profile Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
