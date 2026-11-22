'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  providerApi,
  type SOAPClinicalAssessment,
  type FinalizeVisitPayload,
} from '@/services/provider-api';
import { ApiError } from '@/services/api-transport';
import { useToast } from '@/hooks/use-toast';
import {
  Banknote,
  QrCode,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  Sparkles,
  Upload,
  ExternalLink,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PostVisitSettlementSummary {
  totalAmount: number;
  paymentMethod: string;
  paymentLinkUrl?: string | null;
  paymentStatus: string;
}

export interface PostVisitSettlementProps {
  appointment: any;
  baseFee: number;
  userCity?: string;
  soapNotes?: SOAPClinicalAssessment;
  onCompleted: (summary: PostVisitSettlementSummary) => void;
  onBack?: () => void;
}

interface NormalizedPackage {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  sessions: number;
  durationLabel: string;
  perSessionEstimate: number | null;
  isPopular: boolean;
}

const STANDARD_ADDONS: Array<{ name: string; price: number }> = [
  { name: 'Cupping', price: 500 },
  { name: 'Needling', price: 500 },
  { name: 'IASTM', price: 500 },
  { name: 'Kinesology Tapeing', price: 300 },
];

const ADDON_PRICE_MAP: Record<string, number> = {
  Cupping: 500,
  Needling: 500,
  IASTM: 500,
  'Kinesology Tapeing': 300,
};

type PaymentCategory = 'online' | 'cash';
type OnlineSubMode = 'qr' | 'link' | 'upi';
type SettlementPhase = 'configure' | 'online_link' | 'upload_proof';

function normalizePackage(raw: any): NormalizedPackage | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw._id || raw.id || '').trim();
  const name = String(raw.name || raw.title || raw.packageName || '').trim();
  const discounted = Number(raw.discountedPrice ?? 0);
  const listPrice = Number(raw.price ?? raw.totalPrice ?? raw.packagePrice ?? raw.amount ?? 0);
  const price =
    Number.isFinite(discounted) && discounted > 0
      ? discounted
      : Number.isFinite(listPrice)
        ? listPrice
        : 0;
  if (!id || !name || !Number.isFinite(price) || price <= 0) return null;

  const originalPrice =
    Number.isFinite(listPrice) && listPrice > price ? listPrice : null;

  const rawSessions = Number(
    raw.sessions ?? raw.totalSessions ?? raw.sessionCount ?? raw.numberOfSessions ?? 0
  );
  const rawDurationNum = Number(raw.duration);
  const sessions =
    Number.isFinite(rawSessions) && rawSessions > 0
      ? rawSessions
      : Number.isFinite(rawDurationNum) && rawDurationNum > 0
        ? rawDurationNum
        : 0;

  const durationLabel =
    sessions > 0
      ? `${sessions} Sessions`
      : typeof raw.duration === 'string' && raw.duration.trim()
        ? raw.duration.trim()
        : 'Package Plan';

  const perSessionEstimate = sessions > 0 ? Math.round(price / sessions) : null;
  const isPopular = Boolean(
    raw.isPopular ||
      raw.popular ||
      sessions === 15 ||
      /15[\s-]*(day|session)/i.test(name) ||
      /15[\s-]*(day|session)/i.test(durationLabel)
  );

  return {
    id,
    name,
    price,
    originalPrice,
    sessions,
    durationLabel,
    perSessionEstimate,
    isPopular,
  };
}

function normalizeQrImageSrc(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }
  return `data:image/png;base64,${trimmed}`;
}

export function PostVisitSettlement({
  appointment,
  baseFee,
  userCity,
  soapNotes,
  onCompleted,
  onBack,
}: PostVisitSettlementProps) {
  const { toast } = useToast();
  const appointmentId = String(appointment?._id || appointment?.id || '');
  const patientId = appointment?.patientId || appointment?.patient?._id || appointment?.patient?.id;
  const patientName =
    appointment?.patientName ||
    appointment?.patient?.name ||
    appointment?.patientDetails?.name ||
    'Patient';
  const patientPhone = String(
    appointment?.patientPhone ||
      appointment?.patient?.phone ||
      appointment?.patient?.mobileNo ||
      ''
  ).replace(/\D/g, '');

  // Packages
  const [packages, setPackages] = useState<NormalizedPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [otherSelected, setOtherSelected] = useState(false);
  const [otherAddOnName, setOtherAddOnName] = useState('');
  const [otherAddOnAmountStr, setOtherAddOnAmountStr] = useState('');
  const [noneSelected, setNoneSelected] = useState(true);

  // Payment mode
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>('online');
  const [onlineSubMode, setOnlineSubMode] = useState<OnlineSubMode>('qr');
  const [upiId, setUpiId] = useState('');

  // QR Scanner state
  const [qrLoading, setQrLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const [qrAmount, setQrAmount] = useState<number | null>(null);
  const [qrPaid, setQrPaid] = useState(false);
  const [qrPolling, setQrPolling] = useState(false);
  const qrPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Finalize & post-finalize states
  const [phase, setPhase] = useState<SettlementPhase>('configure');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [finalizedPaymentMethod, setFinalizedPaymentMethod] = useState<'cash' | 'upi_qr' | 'online'>(
    'upi_qr'
  );
  const [finalizedTotal, setFinalizedTotal] = useState<number>(0);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Proof upload state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Fetch packages on mount
  useEffect(() => {
    let active = true;
    setPackagesLoading(true);
    providerApi
      .fetchPackages(userCity)
      .then((rawList) => {
        if (!active) return;
        const normalized = (Array.isArray(rawList) ? rawList : [])
          .map(normalizePackage)
          .filter((p): p is NormalizedPackage => p !== null);
        setPackages(normalized);
      })
      .catch(() => {
        if (active) setPackages([]);
      })
      .finally(() => {
        if (active) setPackagesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userCity]);

  // Clean up proof preview object URL
  useEffect(() => {
    if (!proofFile) {
      setProofPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) || null,
    [packages, selectedPackageId]
  );

  const parsedOtherAmount = useMemo(() => {
    if (!otherSelected) return 0;
    const n = Number(otherAddOnAmountStr);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  }, [otherSelected, otherAddOnAmountStr]);

  const effectiveBaseFee = selectedPackage ? selectedPackage.price : Math.max(0, Number(baseFee) || 0);
  const standardAddOnTotal = useMemo(
    () => selectedAddOns.reduce((sum, name) => sum + (ADDON_PRICE_MAP[name] || 0), 0),
    [selectedAddOns]
  );
  const totalAddOnFees = standardAddOnTotal + parsedOtherAmount;
  const totalAmount = effectiveBaseFee + totalAddOnFees;

  const resolvedPaymentMethod: 'cash' | 'upi_qr' | 'online' =
    paymentCategory === 'cash'
      ? 'cash'
      : onlineSubMode === 'qr'
        ? 'upi_qr'
        : 'online';

  // Poll Cashfree QR payment status every 5 seconds while QR is active and unpaid
  useEffect(() => {
    const clearPoll = () => {
      if (qrPollRef.current) {
        clearInterval(qrPollRef.current);
        qrPollRef.current = null;
      }
      setQrPolling(false);
    };

    if (
      phase !== 'configure' ||
      paymentCategory !== 'online' ||
      onlineSubMode !== 'qr' ||
      !qrOrderId ||
      qrPaid
    ) {
      clearPoll();
      return;
    }

    let cancelled = false;
    setQrPolling(true);

    const checkStatus = async () => {
      try {
        const res = await providerApi.getPaymentStatus(qrOrderId);
        if (cancelled) return;
        const statusStr = String(
          res?.status || res?.paymentStatus || res?.order_status || res?.data?.status || ''
        )
          .trim()
          .toLowerCase();
        if (['paid', 'success', 'completed'].includes(statusStr)) {
          setQrPaid(true);
          clearPoll();
          toast({
            title: 'Payment Received!',
            description: `UPI QR order ${qrOrderId} confirmed as paid. You can now submit & finish the visit.`,
          });
        }
      } catch {
        /* ignore transient polling failure */
      }
    };

    qrPollRef.current = setInterval(() => {
      void checkStatus();
    }, 5000);

    return () => {
      cancelled = true;
      clearPoll();
    };
  }, [phase, paymentCategory, onlineSubMode, qrOrderId, qrPaid, toast]);

  const handleToggleStandardAddOn = (name: string) => {
    setNoneSelected(false);
    setSelectedAddOns((prev) => {
      const next = prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name];
      if (next.length === 0 && !otherSelected) {
        setNoneSelected(true);
      }
      return next;
    });
  };

  const handleToggleOther = () => {
    setOtherSelected((prev) => {
      const next = !prev;
      if (next) {
        setNoneSelected(false);
      } else {
        setOtherAddOnName('');
        setOtherAddOnAmountStr('');
        if (selectedAddOns.length === 0) {
          setNoneSelected(true);
        }
      }
      return next;
    });
  };

  const handleSelectNone = () => {
    setSelectedAddOns([]);
    setOtherSelected(false);
    setOtherAddOnName('');
    setOtherAddOnAmountStr('');
    setNoneSelected(true);
  };

  const handleGenerateQr = async () => {
    if (!appointmentId) return;
    if (totalAmount <= 0) {
      setErrorBanner('Session total must be greater than ₹0 before generating a QR code.');
      return;
    }
    setQrLoading(true);
    setErrorBanner(null);
    setQrPaid(false);
    try {
      const qr = await providerApi.generatePaymentQr({
        appointmentId,
        amount: totalAmount,
      });
      const img = normalizeQrImageSrc(
        qr?.qrImage || qr?.qrCode || qr?.qr || qr?.image || qr?.data?.qrImage || qr?.data?.qr
      );
      const orderId = String(
        qr?.orderId || qr?.order_id || qr?.cfOrderId || qr?.data?.orderId || ''
      ).trim();

      if (!img && !orderId) {
        throw new Error('Payment gateway did not return a QR code. Try again or use Payment Link.');
      }
      setQrImage(img);
      setQrOrderId(orderId || null);
      setQrAmount(totalAmount);
      toast({
        title: 'UPI QR Generated',
        description: `Ask ${patientName} to scan and pay ₹${totalAmount.toLocaleString('en-IN')}. Checking status every 5s.`,
      });
    } catch (err: any) {
      const msg = err?.message || 'Could not generate UPI QR code.';
      setErrorBanner(msg);
      toast({
        variant: 'destructive',
        title: 'QR Generation Failed',
        description: msg,
      });
    } finally {
      setQrLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!appointmentId) return;
    if (totalAmount <= 0) {
      const msg =
        'This appointment has no valid fee on record. Ask operations to set the price or select a package before finalizing.';
      setErrorBanner(msg);
      toast({ variant: 'destructive', title: 'Invalid Amount', description: msg });
      return;
    }
    if (otherSelected && otherAddOnAmountStr.trim() !== '' && parsedOtherAmount <= 0) {
      const msg = 'Please enter a positive numeric amount for the custom add-on.';
      setErrorBanner(msg);
      toast({ variant: 'destructive', title: 'Invalid Add-On Amount', description: msg });
      return;
    }

    setIsSubmitting(true);
    setErrorBanner(null);

    const cleanAddOns = selectedAddOns.filter((a) => a !== 'None' && a !== 'Other');
    const payload: FinalizeVisitPayload = {
      appointmentId,
      paymentMethod: resolvedPaymentMethod,
      totalAmount,
      patientId,
      sessionFee: effectiveBaseFee,
      addOnFees: totalAddOnFees,
      addOns: cleanAddOns,
      selectedAddOns: cleanAddOns,
      ...(selectedPackage
        ? { packageId: selectedPackage.id, packageName: selectedPackage.name }
        : {}),
      ...(otherSelected && parsedOtherAmount > 0 ? { otherAddOnAmount: parsedOtherAmount } : {}),
      soapNotes,
      completedAt: new Date().toISOString(),
    };

    try {
      const res = await providerApi.finalizeVisit(payload);
      if (!res.success) {
        throw new Error(res.message || 'The visit could not be finalized. Nothing has been charged.');
      }

      // Referral earnings computed server-side fire-and-forget
      if (patientId) {
        void providerApi.calculateReferralEarning(String(patientId), totalAmount, appointmentId);
      }

      setFinalizedPaymentMethod(resolvedPaymentMethod);
      setFinalizedTotal(totalAmount);

      const returnedLink =
        res.data?.paymentLinkUrl ||
        res.data?.paymentLink ||
        res.data?.shortUrl ||
        null;

      if (resolvedPaymentMethod === 'online') {
        if (returnedLink) {
          setPaymentLinkUrl(String(returnedLink));
          setPhase('online_link');
          toast({
            title: 'Payment Link Ready',
            description: 'Share the payment link with the patient to complete online payment.',
          });
          return;
        }
        toast({
          title: 'Visit Finalized',
          description: `₹${totalAmount.toLocaleString('en-IN')} recorded (Pending Verification).`,
        });
        onCompleted({
          totalAmount,
          paymentMethod: resolvedPaymentMethod,
          paymentLinkUrl: null,
          paymentStatus: 'Pending Verification',
        });
        return;
      }

      // For `cash` or `upi_qr`, open the receipt / proof upload step (FIN-09)
      setPhase('upload_proof');
      toast({
        title: 'Visit Finalized — Upload Receipt',
        description:
          'Settlement submitted as Pending Verification. Attach a receipt photo or choose Upload Later.',
      });
    } catch (err: any) {
      const isAmountMismatch =
        (err instanceof ApiError && err.code === 'AMOUNT_MISMATCH') ||
        err?.code === 'AMOUNT_MISMATCH' ||
        (err?.statusCode === 409 && /mismatch/i.test(String(err?.message || '')));

      const msg = isAmountMismatch
        ? 'Fee mismatch detected against the latest server pricing (AMOUNT_MISMATCH). Please refresh the appointment and retry.'
        : err?.message || 'The visit could not be finalized. Please retry.';

      setErrorBanner(msg);
      toast({
        variant: 'destructive',
        title: isAmountMismatch ? 'Price Mismatch — Refresh Required' : 'Finalization Failed',
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!paymentLinkUrl) return;
    try {
      await navigator.clipboard.writeText(paymentLinkUrl);
      setCopiedLink(true);
      toast({ title: 'Payment link copied', description: 'Ready to paste and send to the patient.' });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Please copy the payment link manually.',
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!paymentLinkUrl) return;
    const text = `Hello ${patientName}, thank you for your AriesXpert Physiotherapy session. Please complete your payment of ₹${finalizedTotal.toLocaleString('en-IN')} using this secure link: ${paymentLinkUrl}`;
    const phonePrefix = patientPhone.length === 10 ? `91${patientPhone}` : patientPhone;
    const url = phonePrefix
      ? `https://wa.me/${phonePrefix}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleUploadProof = async () => {
    if (!proofFile || !appointmentId) return;
    setIsUploadingProof(true);
    setErrorBanner(null);
    try {
      const fd = new FormData();
      fd.append('paymentMethod', finalizedPaymentMethod);
      fd.append('amount', String(finalizedTotal));
      fd.append('appointmentId', appointmentId);
      fd.append('image', proofFile);
      fd.append('file', proofFile);

      const res = await providerApi.uploadPaymentProof(appointmentId, fd);
      if (!res.success) {
        throw new Error(res.message || 'Could not upload payment proof.');
      }

      toast({
        title: 'Payment Proof Uploaded',
        description: 'Receipt submitted for finance verification (Pending Verification).',
      });
      onCompleted({
        totalAmount: finalizedTotal,
        paymentMethod: finalizedPaymentMethod,
        paymentLinkUrl: null,
        paymentStatus: 'Pending Verification',
      });
    } catch (err: any) {
      const msg = err?.message || 'Could not upload receipt photo. You can retry or upload later.';
      setErrorBanner(msg);
      toast({
        variant: 'destructive',
        title: 'Proof Upload Failed',
        description: msg,
      });
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleUploadLater = () => {
    toast({
      title: 'Visit Completed',
      description: 'Recorded as Pending Verification. You can upload payment proof later if needed.',
    });
    onCompleted({
      totalAmount: finalizedTotal,
      paymentMethod: finalizedPaymentMethod,
      paymentLinkUrl: null,
      paymentStatus: 'Pending Verification',
    });
  };

  // ── PHASE: ONLINE PAYMENT LINK RESULT ──
  if (phase === 'online_link' && paymentLinkUrl) {
    return (
      <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto space-y-6 shadow-md">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-outfit font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pending Verification
          </span>
          <h3 className="text-lg font-outfit font-extrabold text-foreground">
            Online Payment Link Generated
          </h3>
          <p className="text-xs text-muted-foreground">
            Share this secure link with <span className="font-bold text-foreground">{patientName}</span> to collect{' '}
            <span className="font-mono font-bold text-foreground">
              ₹{finalizedTotal.toLocaleString('en-IN')}
            </span>
            .
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 break-all font-mono text-xs text-foreground">
          {paymentLinkUrl}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(paymentLinkUrl, '_blank', 'noopener,noreferrer')}
            className="h-11 rounded-2xl text-xs font-outfit font-bold flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Payment Link</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyPaymentLink}
            className="h-11 rounded-2xl text-xs font-outfit font-bold flex items-center justify-center gap-1.5"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleShareWhatsApp}
            className="h-11 rounded-2xl text-xs font-outfit font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </Button>
        </div>

        <Button
          type="button"
          onClick={() =>
            onCompleted({
              totalAmount: finalizedTotal,
              paymentMethod: finalizedPaymentMethod,
              paymentLinkUrl,
              paymentStatus: 'Pending Verification',
            })
          }
          className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-outfit font-extrabold text-xs shadow-lg shadow-emerald-600/20"
        >
          Done & Finish Visit
        </Button>
      </div>
    );
  }

  // ── PHASE: UPLOAD PAYMENT PROOF (CASH / UPI QR) ──
  if (phase === 'upload_proof') {
    return (
      <div className="bg-card border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto space-y-6 shadow-md">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Upload className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-outfit font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pending Verification
          </span>
          <h3 className="text-lg font-outfit font-extrabold text-foreground">
            Upload Payment Proof / Receipt
          </h3>
          <p className="text-xs text-muted-foreground">
            Visit finalized for{' '}
            <span className="font-mono font-bold text-foreground">
              ₹{finalizedTotal.toLocaleString('en-IN')}
            </span>{' '}
            via{' '}
            <span className="font-bold text-foreground uppercase">
              {finalizedPaymentMethod === 'upi_qr' ? 'UPI QR' : 'Cash'}
            </span>
            . Upload a screenshot or cash receipt photo for finance reconciliation.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 cursor-pointer transition-colors text-center">
            <Upload className="w-6 h-6 text-primary" />
            <span className="text-xs font-outfit font-bold text-foreground">
              {proofFile ? proofFile.name : 'Tap to capture or choose receipt image'}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Supports JPG, PNG, WebP photos
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            />
          </label>

          {proofPreviewUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/30 p-2">
              <img
                src={proofPreviewUrl}
                alt="Selected payment receipt preview"
                className="max-h-56 mx-auto rounded-xl object-contain"
              />
              <button
                type="button"
                aria-label="Remove selected receipt"
                onClick={() => setProofFile(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {errorBanner && (
          <div className="p-3.5 rounded-2xl text-xs font-bold bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isUploadingProof}
            onClick={handleUploadLater}
            className="w-full sm:w-auto sm:flex-1 h-12 rounded-2xl text-xs font-outfit font-bold"
          >
            Upload Later
          </Button>
          <Button
            type="button"
            disabled={!proofFile || isUploadingProof}
            onClick={handleUploadProof}
            className="w-full sm:w-auto sm:flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-outfit font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            {isUploadingProof ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Receipt...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Upload Proof & Finish</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── PHASE: CONFIGURE SETTLEMENT ──
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Packages, Add-Ons & Payment Mode */}
      <div className="lg:col-span-8 space-y-6">
        {/* Subscription Packages (gracefully hidden if empty/error) */}
        {!packagesLoading && packages.length > 0 && (
          <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-outfit font-extrabold text-foreground">
                    Convert to Subscription Package
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Optional — selecting a plan replaces the single-session fee with the full package price.
                  </p>
                </div>
              </div>
              {selectedPackage && (
                <button
                  type="button"
                  onClick={() => setSelectedPackageId(null)}
                  className="text-[11px] font-bold text-primary hover:underline shrink-0"
                >
                  Clear Plan
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() =>
                      setSelectedPackageId((prev) => (prev === pkg.id ? null : pkg.id))
                    }
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-primary/10 border-2 border-primary shadow-sm'
                        : 'bg-muted/25 border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="inline-flex items-center gap-1 self-start text-[10px] font-outfit font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                      </span>
                    )}
                    <div>
                      <p className="text-xs font-outfit font-extrabold text-foreground">
                        {pkg.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {pkg.durationLabel}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/60 flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-mono font-black text-base text-primary">
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                        {pkg.originalPrice !== null && (
                          <span className="font-mono text-[11px] text-muted-foreground line-through">
                            ₹{pkg.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {pkg.perSessionEstimate !== null && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ~₹{pkg.perSessionEstimate}/visit
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Advanced Add-Ons */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-outfit font-extrabold text-foreground">
              Advanced Modalities & Add-Ons
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Select any additional clinical modalities performed during this session.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STANDARD_ADDONS.map((addon) => {
              const isSelected = selectedAddOns.includes(addon.name);
              return (
                <button
                  key={addon.name}
                  type="button"
                  onClick={() => handleToggleStandardAddOn(addon.name)}
                  className={`px-3.5 py-2.5 min-h-[42px] rounded-2xl border text-xs font-outfit font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-muted/30 border-border/80 text-foreground hover:bg-muted/60'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{addon.name}</span>
                  <span
                    className={`font-mono text-[11px] ${
                      isSelected ? 'text-white/90' : 'text-muted-foreground'
                    }`}
                  >
                    +₹{addon.price}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleToggleOther}
              className={`px-3.5 py-2.5 min-h-[42px] rounded-2xl border text-xs font-outfit font-bold transition-all flex items-center gap-1.5 ${
                otherSelected
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-muted/30 border-border/80 text-foreground hover:bg-muted/60'
              }`}
            >
              {otherSelected && <Check className="w-3.5 h-3.5" />}
              <span>Other</span>
            </button>

            <button
              type="button"
              onClick={handleSelectNone}
              className={`px-3.5 py-2.5 min-h-[42px] rounded-2xl border text-xs font-outfit font-bold transition-all flex items-center gap-1.5 ${
                noneSelected
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/60'
              }`}
            >
              {noneSelected && <Check className="w-3.5 h-3.5" />}
              <span>None</span>
            </button>
          </div>

          {otherSelected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60 animate-in fade-in">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Custom Add-On Name</Label>
                <Input
                  value={otherAddOnName}
                  onChange={(e) => setOtherAddOnName(e.target.value)}
                  placeholder="e.g. Shockwave Therapy"
                  className="h-10 rounded-2xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Custom Amount (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={otherAddOnAmountStr}
                  onChange={(e) => setOtherAddOnAmountStr(e.target.value)}
                  placeholder="e.g. 400"
                  className="h-10 rounded-2xl text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Collection Mode */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-outfit font-extrabold text-foreground">
              Payment Collection Mode
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Choose how the patient is settling this visit.
            </p>
          </div>

          {/* Primary Category: Online vs Cash */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentCategory('online')}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                paymentCategory === 'online'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-muted/30 border-border/80 text-foreground hover:bg-muted/60'
              }`}
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-outfit font-extrabold">Online Payment</p>
                <p
                  className={`text-[10px] ${
                    paymentCategory === 'online' ? 'text-white/80' : 'text-muted-foreground'
                  }`}
                >
                  QR, Payment Link, or UPI
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentCategory('cash')}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                paymentCategory === 'cash'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-muted/30 border-border/80 text-foreground hover:bg-muted/60'
              }`}
            >
              <Banknote className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-outfit font-extrabold">Cash Collection</p>
                <p
                  className={`text-[10px] ${
                    paymentCategory === 'cash' ? 'text-white/80' : 'text-muted-foreground'
                  }`}
                >
                  Cash in hand + proof upload
                </p>
              </div>
            </button>
          </div>

          {/* Online Sub-Modes */}
          {paymentCategory === 'online' && (
            <div className="space-y-4 pt-2 border-t border-border/60">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'qr' as const, label: 'QR Scanner', sub: 'Dynamic UPI QR', icon: QrCode },
                  {
                    id: 'link' as const,
                    label: 'Online Payment Link',
                    sub: 'Shareable checkout URL',
                    icon: ExternalLink,
                  },
                  {
                    id: 'upi' as const,
                    label: 'UPI Payment',
                    sub: 'UPI link / handle',
                    icon: Smartphone,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = onlineSubMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOnlineSubMode(opt.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                        active
                          ? 'bg-primary/10 border-2 border-primary text-primary'
                          : 'bg-muted/20 border-border/80 text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-outfit font-extrabold truncate">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{opt.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* QR Scanner Panel */}
              {onlineSubMode === 'qr' && (
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="text-left">
                      <p className="text-xs font-outfit font-extrabold text-foreground">
                        Cashfree Dynamic UPI QR
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Generate a live QR code for ₹{totalAmount.toLocaleString('en-IN')} and auto-check payment status.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={qrLoading || totalAmount <= 0}
                      onClick={handleGenerateQr}
                      className="rounded-xl text-xs font-outfit font-bold shrink-0 flex items-center gap-1.5"
                    >
                      {qrLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : qrImage ? (
                        <RefreshCw className="w-3.5 h-3.5" />
                      ) : (
                        <QrCode className="w-3.5 h-3.5" />
                      )}
                      <span>{qrImage ? 'Regenerate QR' : 'Generate UPI QR'}</span>
                    </Button>
                  </div>

                  {qrAmount !== null && qrAmount !== totalAmount && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                      Total changed from ₹{qrAmount.toLocaleString('en-IN')} to ₹
                      {totalAmount.toLocaleString('en-IN')}. Regenerate QR before scanning.
                    </div>
                  )}

                  {qrImage && (
                    <div className="space-y-2.5 pt-2">
                      <div className="inline-block p-3 rounded-2xl bg-white border border-border shadow-sm">
                        <img
                          src={qrImage}
                          alt="Cashfree UPI QR Code"
                          className="w-44 h-44 object-contain"
                        />
                      </div>
                      {qrOrderId && (
                        <p className="text-[11px] font-mono text-muted-foreground">
                          Order ID: {qrOrderId}
                        </p>
                      )}
                      {qrPaid ? (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-outfit font-extrabold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Payment Received!</span>
                        </div>
                      ) : qrPolling ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Listening for UPI confirmation (checks every 5s)...</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* UPI Payment Optional UPI ID Input */}
              {onlineSubMode === 'upi' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Patient UPI ID (Optional)</Label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. patientname@okhdfcbank"
                    className="h-10 rounded-2xl text-xs font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Finalizing will generate a secure online payment link you can open or share via WhatsApp.
                  </p>
                </div>
              )}

              {onlineSubMode === 'link' && (
                <p className="text-[11px] text-muted-foreground bg-muted/30 rounded-2xl p-3 border border-border/60">
                  Clicking <span className="font-bold text-foreground">Submit & Finish Visit</span>{' '}
                  will generate a Razorpay/Cashfree payment link ready to copy or share on WhatsApp.
                </p>
              )}
            </div>
          )}

          {paymentCategory === 'cash' && (
            <p className="text-[11px] text-muted-foreground bg-muted/30 rounded-2xl p-3 border border-border/60">
              After submitting settlement, you will be prompted to upload a cash receipt photo (or choose Upload Later). All settlements are tracked as{' '}
              <span className="font-bold text-foreground">Pending Verification</span> until finance clears them.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Itemized Breakdown & Submit CTA */}
      <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
        <div className="bg-card border-2 border-primary/25 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
            <h3 className="text-sm font-outfit font-extrabold text-foreground">
              Settlement Summary
            </h3>
            <span className="text-[10px] font-outfit font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
              Pending Verification
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start justify-between gap-2 text-muted-foreground">
              <span>
                {selectedPackage ? `Package: ${selectedPackage.name}` : 'Session Fee'}
              </span>
              <span className="font-mono font-bold text-foreground shrink-0">
                ₹{effectiveBaseFee.toLocaleString('en-IN')}
              </span>
            </div>

            {selectedAddOns.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between gap-2 text-primary font-bold"
              >
                <span>+ {name}</span>
                <span className="font-mono shrink-0">
                  ₹{(ADDON_PRICE_MAP[name] || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}

            {otherSelected && parsedOtherAmount > 0 && (
              <div className="flex items-center justify-between gap-2 text-primary font-bold">
                <span className="truncate">+ {otherAddOnName.trim() || 'Other Add-On'}</span>
                <span className="font-mono shrink-0">
                  ₹{parsedOtherAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60 text-muted-foreground">
              <span>Collection Mode</span>
              <span className="font-outfit font-bold text-foreground">
                {paymentCategory === 'cash'
                  ? 'Cash'
                  : onlineSubMode === 'qr'
                    ? 'UPI QR'
                    : onlineSubMode === 'upi'
                      ? 'Online UPI'
                      : 'Payment Link'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/80 text-sm font-outfit font-black text-foreground">
              <span>Total Payable</span>
              <span className="font-mono text-lg text-primary">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {errorBanner && (
            <div className="p-3 rounded-2xl text-xs font-bold bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorBanner}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <Button
              type="button"
              disabled={isSubmitting || totalAmount <= 0}
              onClick={handleFinalize}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-outfit font-extrabold text-xs shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizing Settlement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Finish Visit</span>
                </>
              )}
            </Button>

            {onBack && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={onBack}
                className="w-full h-10 rounded-2xl text-xs font-outfit font-bold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Clinical Assessment</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
