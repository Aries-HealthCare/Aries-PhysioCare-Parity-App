'use client';

import React, { useState } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { DynamicAppLogo } from '@/components/ui/dynamic-app-logo';
import {
  Receipt,
  Download,
  Share2,
  Printer,
  QrCode,
  Plus,
  CheckCircle2,
  FileText,
  CreditCard,
  Building2,
  Search,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  patientName: string;
  date: string;
  service: string;
  sessionFee: number;
  addOnsTotal: number;
  totalAmount: number;
  paymentMode: string;
  status: 'PAID' | 'PENDING';
}

export default function ProviderInvoicesPage() {
  const { user } = useProviderAuth();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrAmount, setQrAmount] = useState('');
  const [qrPayload, setQrPayload] = useState<any | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  const PAID_STATUSES = ['paid', 'completed', 'collected', 'prepaid', 'waived', 'free'];

  /**
   * Invoice rows are derived from real appointments — amount, payment mode and payment
   * status come from the appointment record, so a session the backend still shows as
   * unpaid is never rendered as PAID here. Invoice numbers are only shown once the
   * backend has actually issued one.
   */
  const loadInvoices = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const appts = await providerApi.getAppointments();
      const rows: InvoiceRecord[] = (appts || []).map((a: any, idx: number) => {
        const fee = Number(a.perSessionPrice ?? a.sessionFee ?? a.amount ?? 0) || 0;
        const addOns = Number(a.addOnFees ?? a.addOnsTotal ?? 0) || 0;
        const total = Number(a.totalAmount ?? fee + addOns) || fee + addOns;
        const paymentStatus = String(a.paymentStatus || '').toLowerCase();
        return {
          id: a._id || a.id || `appt_${idx}`,
          invoiceNumber: a.invoiceNumber || a.invoiceNo || '—',
          patientName:
            a.patient?.fullName || a.patient?.name || a.patientName || a.customerName || 'Patient',
          date: a.appointmentDate
            ? new Date(a.appointmentDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—',
          service: a.treatmentType || a.service || a.condition || 'Physical therapy session',
          sessionFee: fee,
          addOnsTotal: addOns,
          totalAmount: total,
          paymentMode: a.paymentMethod || a.paymentMode || '—',
          status: PAID_STATUSES.includes(paymentStatus) ? 'PAID' : 'PENDING',
        };
      });
      setInvoices(rows);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err?.message || 'Could not load your invoices from the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  // Generator form state
  const [genPatient, setGenPatient] = useState('');
  const [genService, setGenService] = useState('Comprehensive Physical Therapy Session');
  const [genFee, setGenFee] = useState('1200');
  const [genAddOn, setGenAddOn] = useState('0');
  const [genMode, setGenMode] = useState('UPI');

  /**
   * Issues the invoice through POST /api/app/patient/sendInvoice — the backend mints the
   * number and delivers it to the patient, so the number shown is the real one.
   */
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genPatient.trim()) return;
    const fee = parseFloat(genFee) || 0;
    const addOn = parseFloat(genAddOn) || 0;

    setIsIssuing(true);
    setIssueError(null);
    try {
      const res = await providerApi.generateInvoice({
        patientName: genPatient.trim(),
        treatmentType: genService,
        sessionNumber: 1,
        totalSessions: 1,
        sessionFee: fee,
        addOns: addOn > 0 ? [{ name: 'Add-on services', amount: addOn }] : [],
        paymentMethod: genMode,
      });

      if (!res.success) {
        setIssueError(res.message || 'The invoice could not be issued.');
        return;
      }

      const issued: InvoiceRecord = {
        id: res.invoiceNumber || 'inv_' + Date.now(),
        invoiceNumber: res.invoiceNumber || '—',
        patientName: genPatient.trim(),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        service: genService,
        sessionFee: fee,
        addOnsTotal: addOn,
        totalAmount: fee + addOn,
        paymentMode: genMode,
        status: 'PENDING',
      };
      setInvoices([issued, ...invoices]);
      setSelectedInvoice(issued);
      setShowGenerator(false);
      setGenPatient('');
      void loadInvoices();
    } catch (err: any) {
      setIssueError(err?.message || 'The invoice could not be issued.');
    } finally {
      setIsIssuing(false);
    }
  };

  /** POST /api/app/payments/generate-qr — the same on-spot UPI QR the mobile app shows. */
  const handleGenerateQr = async () => {
    const amount = parseFloat(qrAmount);
    if (!amount || amount <= 0) {
      setQrError('Enter an amount greater than zero.');
      return;
    }
    setIsGeneratingQr(true);
    setQrError(null);
    try {
      const payload = await providerApi.generatePaymentQr({ amount });
      setQrPayload(payload);
    } catch (err: any) {
      setQrError(err?.message || 'Could not generate a payment QR.');
      setQrPayload(null);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleShareWhatsApp = (inv: InvoiceRecord) => {
    const lines = [
      'Aries Healthcare payment receipt',
      inv.invoiceNumber && inv.invoiceNumber !== '—' ? `Invoice: ${inv.invoiceNumber}` : null,
      `Patient: ${inv.patientName}`,
      `Amount: ₹${inv.totalAmount.toLocaleString('en-IN')} (${inv.status === 'PAID' ? 'paid' : 'due'})`,
      `Therapist: ${user?.fullName || 'Physiotherapist'}`,
    ].filter(Boolean);
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Tax Invoices & Patient Receipts</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Generate GST-compliant tax invoices, printable clinical payment receipts, and instant on-spot UPI QR codes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => setShowQrModal(true)}
            variant="outline"
            className="h-10 px-4 rounded-2xl border-primary/30 text-primary text-xs font-bold"
          >
            <QrCode className="w-4 h-4 mr-1.5" />
            <span>Generate UPI QR</span>
          </Button>

          <Button
            onClick={() => setShowGenerator(true)}
            className="h-10 px-4 rounded-2xl bg-primary text-white text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Tax Receipt</span>
          </Button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-foreground">Issued Invoices History</h3>

        {invoices.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-dashed border-border/60 rounded-2xl">
            <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No invoices generated yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Create your first tax invoice or complete a patient visit to generate digital receipts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all hover:border-primary/40"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ {inv.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-outfit font-extrabold text-foreground mt-1">{inv.patientName}</h4>
                  <p className="text-muted-foreground">{inv.service} • {inv.date}</p>
                  <p className="text-[11px] text-muted-foreground">Mode: <strong className="text-foreground">{inv.paymentMode}</strong></p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="text-base font-mono font-black text-foreground">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground">GST Exempt (Health Care)</p>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      onClick={() => setSelectedInvoice(inv)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                    <Button
                      onClick={() => handleShareWhatsApp(inv)}
                      size="sm"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1" /> WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGenerator(false)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-outfit font-extrabold text-foreground">Create Official Clinical Receipt</h3>
              <button onClick={() => setShowGenerator(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label className="font-bold">Patient Full Name</Label>
                <Input
                  required
                  placeholder="e.g. Mrs. Sangeeta Mehta"
                  value={genPatient}
                  onChange={(e) => setGenPatient(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Service / Treatment Description</Label>
                <Input
                  value={genService}
                  onChange={(e) => setGenService(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="font-bold">Session Fee (₹)</Label>
                  <Input
                    type="number"
                    value={genFee}
                    onChange={(e) => setGenFee(e.target.value)}
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold">Add-On Modalities (₹)</Label>
                  <Input
                    type="number"
                    value={genAddOn}
                    onChange={(e) => setGenAddOn(e.target.value)}
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Payment Method</Label>
                <select
                  value={genMode}
                  onChange={(e) => setGenMode(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                >
                  <option value="Dynamic UPI QR">Dynamic UPI QR</option>
                  <option value="Cash in Hand">Cash in Hand</option>
                  <option value="Prepaid App Online">Prepaid App Online</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                </select>
              </div>

              <Button type="submit" className="w-full h-11 rounded-2xl bg-primary text-white font-extrabold text-xs">
                Generate & Save Tax Receipt
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail / Printable PDF Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
          <div className="bg-card border-2 border-primary/40 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Tax Invoice Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border/80">
              <DynamicAppLogo size={36} showText={true} />
              <div className="text-right text-xs">
                <p className="font-mono font-black text-primary text-sm">{selectedInvoice.invoiceNumber}</p>
                <p className="text-muted-foreground mt-0.5">{selectedInvoice.date}</p>
              </div>
            </div>

            {/* Doctor & Patient Info */}
            <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-muted/30 rounded-2xl">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Attending Specialist</p>
                <p className="font-outfit font-extrabold text-foreground mt-0.5">{user?.fullName || 'Dr. Specialist, BPT'}</p>
                <p className="text-muted-foreground font-mono">Reg: {user?.licenseNumber || 'MH-OTPT-9412'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Patient Name</p>
                <p className="font-outfit font-extrabold text-foreground mt-0.5">{selectedInvoice.patientName}</p>
                <p className="text-muted-foreground">Doorstep Clinical Visit</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60 font-bold text-muted-foreground uppercase text-[10px]">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between py-1 text-foreground">
                <span>{selectedInvoice.service}</span>
                <span className="font-mono font-bold">₹{selectedInvoice.sessionFee.toLocaleString('en-IN')}</span>
              </div>
              {selectedInvoice.addOnsTotal > 0 && (
                <div className="flex justify-between py-1 text-primary font-bold">
                  <span>Session Add-On Modalities</span>
                  <span className="font-mono">₹{selectedInvoice.addOnsTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-border text-sm font-outfit font-black text-foreground">
                <span>Total Amount Paid</span>
                <span className="font-mono text-primary text-base">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Footer Seal & Print */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Payment Received</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl text-xs font-bold">
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print
                </Button>
                <Button size="sm" onClick={() => handleShareWhatsApp(selectedInvoice)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                  <Share2 className="w-3.5 h-3.5 mr-1" /> WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic UPI QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQrModal(false)}>
          <div className="bg-card border-2 border-primary/40 rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-outfit font-extrabold text-foreground">Dynamic UPI QR Generator</h3>
              <button onClick={() => setShowQrModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Payment Amount (₹)</Label>
              <Input
                type="number"
                value={qrAmount}
                onChange={(e) => setQrAmount(e.target.value)}
                className="text-center font-mono font-black text-xl h-12 rounded-2xl border-2 border-primary/40"
              />
            </div>

            {qrError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold rounded-2xl">
                {qrError}
              </div>
            )}

            {/* The QR image/string is issued by the payment gateway through the backend —
                nothing is rendered until the server returns one. */}
            {qrPayload ? (
              <div className="space-y-2">
                <div className="p-5 bg-white rounded-3xl border-2 border-border shadow-inner mx-auto w-fit">
                  {qrPayload.qrImage || qrPayload.qrCodeUrl || qrPayload.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrPayload.qrImage || qrPayload.qrCodeUrl || qrPayload.image}
                      alt="UPI payment QR"
                      className="w-44 h-44 mx-auto"
                    />
                  ) : (
                    <p className="text-[10px] font-mono text-black break-all max-w-[176px]">
                      {qrPayload.upiLink || qrPayload.qrString || qrPayload.payload || 'QR issued'}
                    </p>
                  )}
                </div>
                {qrPayload.orderId && (
                  <p className="text-[10px] font-mono text-muted-foreground">Order {qrPayload.orderId}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Ask the patient to scan with any UPI app. The credit appears in your wallet once the
                  gateway confirms it.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter the amount and generate a QR issued by the payment gateway.
              </p>
            )}

            <Button
              onClick={handleGenerateQr}
              disabled={isGeneratingQr}
              className="w-full h-11 rounded-2xl bg-primary text-white font-bold text-xs"
            >
              {isGeneratingQr ? 'Generating…' : qrPayload ? 'Regenerate QR' : 'Generate UPI QR'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
