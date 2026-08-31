'use client';

import React, { useState, useEffect } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  UserPlus,
  Users,
  Coins,
  TrendingUp,
  Share2,
  Phone,
  MapPin,
  Calendar,
  Clock,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Package,
  ArrowRight,
  DollarSign,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReferredPatientItem {
  id: string;
  patientName: string;
  patientPhone: string;
  condition: string;
  city: string;
  area: string;
  dateReferred: string;
  visitsDone: number;
  totalVisits: number;
  status: 'Lead Assigned' | 'In Treatment' | 'Treatment Completed' | 'Pending First Visit';
  earningsGenerated: number;
}

export default function ProviderReferPatientPage() {
  const { user } = useProviderAuth();
  const [referredList, setReferredList] = useState<ReferredPatientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReferForm, setShowReferForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [pincode, setPincode] = useState('400092');
  const [condition, setCondition] = useState('Post-TKR Knee Joint Mobilization');
  const [selectedPackage, setSelectedPackage] = useState('10-Session Comprehensive Recovery Pack (₹7,800)');
  const [preferredDate, setPreferredDate] = useState('Tomorrow');
  const [preferredTime, setPreferredTime] = useState('10:00 AM - 11:00 AM');
  const [patientConfirmed, setPatientConfirmed] = useState(true);

  // Load real referred patients from backend
  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const data = await providerApi.fetchReferrals(user?._id);
      if (data.referPatients && data.referPatients.length > 0) {
        const mapped: ReferredPatientItem[] = data.referPatients.map((p: any, idx: number) => ({
          id: p._id || p.id || 'ref_' + idx,
          patientName: p.patientName || p.name || 'Patient',
          patientPhone: p.patientMobile || p.phone || '',
          condition: p.patientCondition || p.condition || 'General Physiotherapy',
          city: p.city || user?.city || 'Mumbai',
          area: p.patientAddress || p.area || '',
          dateReferred: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
          visitsDone: p.visitsDone || 0,
          totalVisits: p.totalVisits || 10,
          status: p.status === 'Completed' ? 'Treatment Completed' : p.status === 'In Progress' ? 'In Treatment' : 'Lead Assigned',
          earningsGenerated: (p.visitsDone || 0) * 78,
        }));
        setReferredList(mapped);
      } else {
        setReferredList([]);
      }
    } catch (_) {
      setReferredList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, [user?._id]);

  // Live Earning calculations
  const totalReferred = referredList.length;
  const completedTreatments = referredList.filter((p) => p.status === 'Treatment Completed').length;
  const totalEarned = referredList.reduce((acc, curr) => acc + curr.earningsGenerated, 0);

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) {
      alert('Please fill patient name and mobile number.');
      return;
    }
    if (!patientConfirmed) {
      alert('Please confirm that the patient is aware and agrees to the doorstep consultation.');
      return;
    }

    setIsSubmitting(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const payload = {
      therapist: user?._id || user?.id || 'therapist_' + Date.now(),
      patientName: fullName,
      patientMobile: phone.trim(),
      patientAddress: `${address} ${landmark} ${area} ${pincode}`.trim(),
      patientCondition: condition,
      city: city || user?.city || 'Mumbai',
    };

    const res = await providerApi.createReferPatient(payload);
    setIsSubmitting(false);

    if (res.success !== false) {
      setShowReferForm(false);
      setSuccessFeedback(`🎉 Patient ${fullName} referred successfully! You will earn 10% commission on every session completed.`);
      // Reset form
      setFirstName('');
      setLastName('');
      setPhone('');
      setAge('');
      setAddress('');
      setLandmark('');
      loadReferrals();
    } else {
      alert(res.message || 'Failed to submit patient referral. Please try again.');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Book Certified Expert Doorstep Physical Therapy with Aries HealthCare! Top Physiotherapists with hospital-grade protocols in your city. Link: https://ariesphysiocare.com/book-appointment?ref=${user?.axId || 'AX-IND'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Patient Referral Program</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Refer patients needing doorstep physiotherapy and earn a recurring <strong>10% commission</strong> on every visit completed.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={handleShareWhatsApp}
            variant="outline"
            className="h-10 px-4 rounded-2xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            <span>Share WhatsApp Link</span>
          </Button>

          <Button
            onClick={() => setShowReferForm(true)}
            className="h-10 px-5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Refer New Patient</span>
          </Button>
        </div>
      </div>

      {successFeedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successFeedback}</span>
        </div>
      )}

      {/* 3 Metric Cards matching referralStatsProvider in refer_patient_page.dart */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">Total Referred Patients</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">{totalReferred} Patients</div>
          <div className="text-[11px] text-muted-foreground mt-1">Active under Aries Care</div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">Completed Rehab Packages</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-500">{completedTreatments} Packages</div>
          <div className="text-[11px] text-emerald-500 font-bold mt-1">100% full course recovery</div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">Referral Commission Earned</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-500">₹{totalEarned.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Directly credited to Wallet</div>
        </div>
      </div>

      {/* Commission Economics Formula Card */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-purple-500/10 border border-primary/20 rounded-3xl p-5 shadow-sm space-y-2 text-xs">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Sparkles className="w-4 h-4" />
          <span>How Patient Referral Commission Works:</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          For every doorstep session completed by your referred patient, you receive <strong className="text-foreground">10% recurring commission</strong> after statutory deductions (e.g. ₹800 visit ➔ <strong>₹78/session</strong>). When a patient finishes a 10-session package, you earn <strong>₹780 passive income</strong> automatically credited to your Aries Wallet!
        </p>
      </div>

      {/* Referred Patients List Table */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 className="text-base font-outfit font-extrabold text-foreground">Referred Patients Roster</h3>
            <p className="text-xs text-muted-foreground">Live tracking of patient recovery progress and your earnings</p>
          </div>
        </div>

        <div className="space-y-3">
          {referredList.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-border/60 bg-muted/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs hover:border-primary/40 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-outfit font-extrabold text-foreground">{item.patientName}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.status === 'Treatment Completed'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : item.status === 'In Treatment'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-primary font-bold">{item.condition}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-[11px] pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>{item.area}, {item.city}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span>{item.patientPhone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Referred on {item.dateReferred}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-5 self-end lg:self-auto border-t lg:border-t-0 pt-2 lg:pt-0 border-border/40">
                <div className="text-left lg:text-right">
                  <p className="text-muted-foreground font-bold">Sessions Completed</p>
                  <p className="font-mono font-black text-foreground text-sm mt-0.5">
                    {item.visitsDone} / {item.totalVisits} visits
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-muted-foreground font-bold">Your Earnings</p>
                  <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base mt-0.5">
                    ₹{item.earningsGenerated.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── REFER PATIENT INTAKE FORM MODAL (matches ReferPatientPage in mobile app) ── */}
      {showReferForm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowReferForm(false)}
        >
          <div
            className="bg-card border-2 border-primary/30 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-outfit font-extrabold text-foreground">Refer Patient for Doorstep Care</h3>
              </div>
              <button onClick={() => setShowReferForm(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitReferral} className="space-y-4 text-xs">
              {/* Patient Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="font-bold">Patient First Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Meenakshi"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold">Patient Last Name</Label>
                  <Input
                    placeholder="e.g. Rao"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <Label className="font-bold">Mobile Number *</Label>
                  <Input
                    required
                    type="tel"
                    placeholder="+91 98200 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold">Age (Years)</Label>
                  <Input
                    type="number"
                    placeholder="65"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold">Gender</Label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-1">
                <Label className="font-bold">Flat / Building / Street Address *</Label>
                <Input
                  required
                  placeholder="e.g. Flat 402, Sea Green Heights, IC Colony"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="font-bold">Landmark</Label>
                  <Input
                    placeholder="Near IC Church"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold">Area / Locality</Label>
                  <Input
                    placeholder="Borivali West"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold">Pincode (6-Digits)</Label>
                  <Input
                    maxLength={6}
                    placeholder="400103"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Medical Condition & Package */}
              <div className="space-y-1">
                <Label className="font-bold">Clinical Diagnosis / Condition *</Label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                >
                  <option value="Post-TKR Knee Joint Mobilization">Post-TKR Knee Joint Mobilization & Rehab</option>
                  <option value="Stroke Hemiplegia Neuro Gait Training">Stroke Hemiplegia Neuro Gait Training</option>
                  <option value="Lumbar Canal Stenosis & Sciatica">Lumbar Canal Stenosis & Sciatica Relief</option>
                  <option value="Cervical Spondylosis & Posture Rehab">Cervical Spondylosis & Posture Rehab</option>
                  <option value="Frozen Shoulder Capsular Stretching">Frozen Shoulder (Adhesive Capsulitis)</option>
                  <option value="Parkinsons Balance & Fall Prevention">Parkinson's Disease Balance & Coordination</option>
                  <option value="Sports ACL / Meniscus Recovery">Sports ACL / Meniscus Post-Op Recovery</option>
                  <option value="Pediatric Cerebral Palsy Milestones">Pediatric Cerebral Palsy Milestones</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="font-bold">Recommended Treatment Package</Label>
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                  >
                    <option value="10-Session Comprehensive Recovery Pack (₹7,800)">10-Session Recovery Pack (₹7,800) • Earn ₹780</option>
                    <option value="15-Session Advanced Neuro Rehab Pack (₹11,700)">15-Session Neuro Pack (₹11,700) • Earn ₹1,170</option>
                    <option value="5-Session Acute Pain Relief Pack (₹3,900)">5-Session Acute Pack (₹3,900) • Earn ₹390</option>
                    <option value="Single Assessment & First Visit (₹800)">Single Session (₹800) • Earn ₹78</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="font-bold">Preferred Time Slot</Label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                  >
                    <option value="09:00 AM - 10:00 AM">Morning (09:00 AM - 10:00 AM)</option>
                    <option value="11:30 AM - 12:30 PM">Late Morning (11:30 AM - 12:30 PM)</option>
                    <option value="02:00 PM - 03:00 PM">Afternoon (02:00 PM - 03:00 PM)</option>
                    <option value="05:00 PM - 06:00 PM">Evening (05:00 PM - 06:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/80 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="confirmVisit"
                  checked={patientConfirmed}
                  onChange={(e) => setPatientConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="confirmVisit" className="text-[11px] text-foreground font-medium cursor-pointer">
                  I confirm that the patient has requested physical therapy care and is ready for an Aries verified specialist to visit their residence.
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-outfit font-extrabold text-xs shadow-xl shadow-primary/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1.5" />}
                <span>Submit Referral & Reserve 10% Commission ➔</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
