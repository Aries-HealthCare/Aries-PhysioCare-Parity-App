'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, Lock, DollarSign, Check, ExternalLink } from 'lucide-react';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  country?: string;
}

export function LegalPoliciesModal({
  isOpen,
  onClose,
  onAccept,
  country = 'India',
}: LegalPoliciesModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'fees'>('terms');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl z-50">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-teal-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              AriesXpert Clinical Network Compliance
            </span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-white font-outfit">
            Legal Agreements, Code of Conduct & Fee Policy
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Please review the legal frameworks governing clinical practice, doorstep visit ethics, patient privacy, and earnings.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-bold font-outfit">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'terms'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fees')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'fees'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Fee & Payout Policy</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-72 overflow-y-auto pr-2 space-y-3 text-xs text-slate-300 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-slate-700">
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">1. Professional Accreditation & Council Verification</h4>
              <p>
                By enrolling as a practitioner in the AriesXpert Network ({country}), you affirm that all submitted educational degrees, medical council registrations, and clinical experience records are authentic and active. Any falsification of medical credentials will result in immediate disqualification and regulatory reporting.
              </p>
              <h4 className="font-bold text-white text-sm">2. Doorstep Clinical Protocol & Zero-Tolerance Safety</h4>
              <p>
                Practitioners are required to follow standardized evidence-based rehabilitation protocols. You agree to carry authorized portable modalities, maintain clinical hygiene, display your Digital ID Card upon arrival, and adhere to zero-tolerance anti-harassment policies.
              </p>
              <h4 className="font-bold text-white text-sm">3. Independence & Schedule Autonomy</h4>
              <p>
                You retain complete autonomy to set your operational territory, accepted pincodes, and time slots. Broadcasts may be accepted or declined based on your clinical availability.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">1. Patient Medical Data Protection (HIPAA & DISHA Compliance)</h4>
              <p>
                Patient clinical notes, SOAP assessments, and radiological reports are strictly confidential. You agree not to store, photograph, or distribute patient medical records on unauthorized personal devices or public cloud services.
              </p>
              <h4 className="font-bold text-white text-sm">2. Live Location Tracking During Active Visits</h4>
              <p>
                Location services are utilized exclusively during scheduled patient visits to compute accurate travel allowances, provide patients with real-time ETA updates, and trigger emergency SOS protocols when required.
              </p>
              <h4 className="font-bold text-white text-sm">3. Banking & Identity Security</h4>
              <p>
                Your submitted identity documents (Aadhaar, PAN, SSN, Passport, BRP) and banking coordinates are stored in encrypted vaults and used strictly for payout settlements and statutory compliance.
              </p>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">1. 60% Transparent Practitioner Revenue Share</h4>
              <p>
                Practitioners receive 60% of gross patient consultation fees, plus 100% of custom add-on clinical charges (such as specialized dry needling, cupping, or electrotherapy supplements).
              </p>
              <h4 className="font-bold text-white text-sm">2. Instant IMPS / Direct Settlement Cycles</h4>
              <p>
                Earnings are calculated upon successful completion of the digital visit SOAP assessment. Settlements are credited directly to your registered bank account or UPI ID with 2x expedited clearing.
              </p>
              <h4 className="font-bold text-white text-sm">3. One-Time Registration & Verification Fee</h4>
              <p>
                A nominal one-time verification fee covers criminal background checks, medical council licensing verification, clinical kit provisioning, and priority broadcast allocation.
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Accept All Policies & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
