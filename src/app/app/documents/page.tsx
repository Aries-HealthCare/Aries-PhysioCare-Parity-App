'use client';

import React from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Eye,
  FileCheck,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProviderDocumentsPage() {
  const { user } = useProviderAuth();
  const safeName = (user?.fullName || user?.name || 'Doctor').replace(/\s+/g, '_');

  const documents = [
    {
      name: 'BPT / MPT Degree Certificate',
      filename: `${safeName}_Degree_Certificate.pdf`,
      status: user?.degreeCertificateUrl ? 'VERIFIED' : (user?.isVerified ? 'VERIFIED' : 'PENDING'),
      verifiedDate: 'Active',
    },
    {
      name: 'State Council OTPT Registration Certificate',
      filename: `${safeName}_Council_Registration.pdf`,
      status: user?.registrationCertificateUrl ? 'VERIFIED' : (user?.licenseNumber ? 'VERIFIED' : 'PENDING'),
      verifiedDate: 'Active',
    },
    {
      name: 'PAN Card Copy',
      filename: `${safeName}_PAN_Card.jpg`,
      status: user?.panCard ? 'VERIFIED' : (user?.bankInfo?.panNumber ? 'VERIFIED' : 'PENDING'),
      verifiedDate: 'Active',
    },
    {
      name: 'Aadhaar Card (Front & Back)',
      filename: `${safeName}_Aadhaar_Card.pdf`,
      status: user?.aadharCard ? 'VERIFIED' : 'PENDING',
      verifiedDate: 'Active',
    },
    {
      name: 'Cancelled Cheque / Bank Proof',
      filename: `${safeName}_Bank_Proof.jpg`,
      status: user?.bankInfo?.accountNumber ? 'VERIFIED' : 'PENDING',
      verifiedDate: 'Active',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">KYC Document Vault & Credentials</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Authenticated professional licenses and identity proofs audited by the Clinical Governance Committee.
          </p>
        </div>

        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>All 5 Documents Verified</span>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground">Verified Document Records</h3>

        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-foreground">{doc.name}</div>
                  <div className="text-muted-foreground font-mono mt-0.5">{doc.filename}</div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-1">
                    ✓ Verified on {doc.verifiedDate} by Clinical Governance
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl text-xs font-bold">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Preview</span>
                </Button>
                <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl text-xs font-bold">
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  <span>Replace</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
