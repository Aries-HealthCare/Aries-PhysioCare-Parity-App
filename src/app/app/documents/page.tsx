'use client';

import React, { useMemo } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { resolveProfileImage } from '@/services/provider-api';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * KYC Document Vault.
 *
 * Every row is derived from the provider's own record — the same document URLs the
 * mobile app resolves in `UserModel.fromJson` (`_normalizeUrl` over `professionalInfo`,
 * `bankInfo` and the root document fields). A document is only shown as uploaded when
 * the record actually carries a file; nothing is asserted as "verified" unless the
 * backend says the profile is verified.
 */

interface DocumentRow {
  name: string;
  url?: string;
  required: boolean;
  note: string;
}

export default function ProviderDocumentsPage() {
  const { user } = useProviderAuth();

  const documents: DocumentRow[] = useMemo(
    () => [
      {
        name: 'BPT / MPT Degree Certificate',
        url: user?.degreeCertificateUrl || user?.professionalInfo?.degreeCertificate,
        required: true,
        note: 'Proof of your physiotherapy qualification.',
      },
      {
        name: 'State Council Registration Certificate',
        url: user?.registrationCertificateUrl || user?.professionalInfo?.registrationCertificate,
        required: true,
        note: user?.licenseNumber
          ? `Council registration ${user.licenseNumber}`
          : 'Council registration number not on file yet.',
      },
      {
        name: 'CV / Résumé',
        url: user?.cvResumeUrl || user?.professionalInfo?.cvResume,
        required: false,
        note: 'Optional — strengthens your public profile.',
      },
      {
        name: 'PAN Card',
        url: user?.panCardUrl,
        required: true,
        note: user?.bankInfo?.panNumber ? `PAN on file: ${user.bankInfo.panNumber}` : 'Required for payouts.',
      },
      {
        name: 'Aadhaar Card (Front)',
        url: user?.aadharCardUrl,
        required: true,
        note: user?.aadharNumber ? 'Identity proof on file.' : 'Government identity proof.',
      },
      {
        name: 'Aadhaar Card (Back)',
        url: user?.aadharCardBackUrl,
        required: false,
        note: 'Reverse side of your Aadhaar card.',
      },
      {
        name: 'Cancelled Cheque / Bank Proof',
        url: user?.bankCancelledChequeUrl || user?.bankInfo?.cancelledCheque,
        required: true,
        note: user?.bankInfo?.accountNumber
          ? `Payout account ending ${String(user.bankInfo.accountNumber).slice(-4)}`
          : 'Required before IMPS payouts can be released.',
      },
      {
        name: 'Bank Statement',
        url: user?.bankStatementUrl,
        required: false,
        note: 'Optional secondary banking proof.',
      },
      {
        name: 'Driving Licence',
        url: user?.drivingLicenseUrl,
        required: false,
        note: user?.drivingLicenseNumber
          ? `Licence ${user.drivingLicenseNumber}`
          : 'Needed for two-wheeler field commute approval.',
      },
    ],
    [user]
  );

  const extraCertifications = user?.extraCertificationsUrls || [];
  const uploaded = documents.filter((doc) => !!doc.url);
  const missingRequired = documents.filter((doc) => doc.required && !doc.url);
  const isVerified = user?.isVerified === true || user?.status === 'Approved';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">KYC Document Vault &amp; Credentials</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Professional licences and identity proofs held on your provider record.
          </p>
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${
            isVerified
              ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
              : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
          }`}
        >
          {isVerified ? <ShieldCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span>
            {isVerified ? 'Credentials verified' : 'Verification pending'} · {uploaded.length}/{documents.length}{' '}
            uploaded
          </span>
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-2xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div>{missingRequired.length} required document(s) are still missing.</div>
            <div className="font-normal mt-0.5">
              {missingRequired.map((doc) => doc.name).join(', ')} — upload these from your{' '}
              <Link href="/app/profile" className="underline">
                profile
              </Link>{' '}
              or the mobile app to complete onboarding.
            </div>
          </div>
        </div>
      )}

      {/* Documents list */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground">Document Records</h3>

        <div className="space-y-3">
          {documents.map((doc) => {
            const href = doc.url ? resolveProfileImage(doc.url) : null;
            return (
              <div
                key={doc.name}
                className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-foreground">
                      {doc.name}
                      {!doc.required && (
                        <span className="ml-1.5 text-[10px] font-bold text-muted-foreground uppercase">Optional</span>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-0.5">{doc.note}</div>
                    <div
                      className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
                        href ? 'text-emerald-500' : doc.required ? 'text-amber-500' : 'text-muted-foreground'
                      }`}
                    >
                      {href ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isVerified ? 'On file · credentials verified' : 'On file · awaiting review'}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{doc.required ? 'Not uploaded — required' : 'Not uploaded'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl text-xs font-bold">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>View</span>
                      </Button>
                    </a>
                  ) : (
                    <Link href="/app/profile">
                      <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl text-xs font-bold">
                        <span>Upload in profile</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional certifications */}
      {extraCertifications.length > 0 && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-foreground">Additional Certifications</h3>
          <div className="space-y-2">
            {extraCertifications.map((url, index) => {
              const href = resolveProfileImage(url);
              return (
                <div
                  key={`${url}-${index}`}
                  className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">Certification {index + 1}</span>
                  </div>
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
