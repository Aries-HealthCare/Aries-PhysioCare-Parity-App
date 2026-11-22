'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Download,
  RefreshCw,
  Search,
  Receipt,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/ds';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import {
  buildTransactionsCsv,
  classifyLedgerCategory,
  filterEarningsLedger,
  type EarningsLedgerCategory,
  type EarningsLedgerRange,
  type EarningsLedgerType,
} from '@/lib/wave2-helpers';

function formatDateTime(raw?: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EarningsHistoryPage() {
  const { toast } = useToast();
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.getTransactions(), []);
  const transactions = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [category, setCategory] = useState<EarningsLedgerCategory>('all');
  const [txType, setTxType] = useState<EarningsLedgerType>('ALL');
  const [range, setRange] = useState<EarningsLedgerRange>('all');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const ledger = useMemo(
    () => filterEarningsLedger(transactions, { category, type: txType, range, search }),
    [transactions, category, txType, range, search]
  );

  const handleExportCsv = () => {
    if (!ledger.items.length) {
      toast({ title: 'Nothing to export', description: 'No transactions match your current filters.' });
      return;
    }
    const csv = buildTransactionsCsv(ledger.items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ariesxpert-earnings-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Statement exported', description: `${ledger.items.length} ledger rows downloaded as CSV.` });
  };

  if (loading) return <PageSkeleton rows={5} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/earnings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Earnings</span>
          </Link>
          <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Earnings &amp; Payout History</h1>
          <p className="text-xs text-muted-foreground">
            Complete audit trail of doorstep visit payouts, referral bonuses, adjustments, and withdrawals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={reload} className="h-10 rounded-2xl text-xs font-bold gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button type="button" size="sm" onClick={handleExportCsv} className="h-10 rounded-2xl text-xs font-bold gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground">Total Credits (Filtered)</p>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-500 mt-1">
            +₹{ledger.totalCredits.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground">Total Withdrawals / Debits</p>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-rose-500 mt-1">
            -₹{ledger.totalDebits.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground">Net Movement ({ledger.items.length} entries)</p>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-foreground mt-1">
            ₹{ledger.netAmount.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description, category, status, or transaction ID…"
              className="pl-9 h-10 rounded-xl text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'week', 'month', 'quarter'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  range === r ? 'bg-primary text-white' : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'all' ? 'All Time' : r === 'week' ? '7 Days' : r === 'month' ? 'This Month' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', label: 'All Categories' },
                { id: 'visits', label: 'Visit Payouts' },
                { id: 'bonuses', label: 'Bonuses & Referrals' },
                { id: 'withdrawals', label: 'Withdrawals' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  category === cat.id
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-background text-muted-foreground border-border/70 hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex rounded-xl overflow-hidden border border-border/70">
            {(['ALL', 'CREDIT', 'DEBIT'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTxType(t)}
                className={`px-3 py-1.5 text-[11px] font-bold ${
                  txType === t ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger List */}
      {ledger.items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No matching ledger transactions"
          description="Try widening your date range or clearing filters to inspect older payouts."
        />
      ) : (
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-5 py-3 font-outfit font-bold uppercase text-muted-foreground">Date</th>
                  <th className="px-5 py-3 font-outfit font-bold uppercase text-muted-foreground">Description</th>
                  <th className="px-5 py-3 font-outfit font-bold uppercase text-muted-foreground">Category</th>
                  <th className="px-5 py-3 font-outfit font-bold uppercase text-muted-foreground">Status</th>
                  <th className="px-5 py-3 font-outfit font-bold uppercase text-muted-foreground text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {ledger.items.map((tx: any, idx: number) => {
                  const isCredit = String(tx.type || '').toUpperCase() === 'CREDIT';
                  const bucket = classifyLedgerCategory(tx.category, tx.type);
                  return (
                    <tr
                      key={tx._id || tx.id || tx.transactionId || idx}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-muted-foreground whitespace-nowrap">
                        {formatDateTime(tx.createdAt || tx.date)}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-foreground">
                        {tx.description || tx.category || (isCredit ? 'Wallet Credit' : 'Wallet Debit')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase text-[10px]">
                          {bucket}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold capitalize text-foreground">{tx.status || 'Completed'}</span>
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-mono font-extrabold whitespace-nowrap ${
                          isCredit ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {isCredit ? '+' : '-'}₹{(Number(tx.amount) || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-border/70">
            {ledger.items.map((tx: any, idx: number) => {
              const isCredit = String(tx.type || '').toUpperCase() === 'CREDIT';
              return (
                <button
                  key={tx._id || tx.id || tx.transactionId || idx}
                  type="button"
                  onClick={() => setSelectedTx(tx)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {isCredit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        {tx.description || tx.category || (isCredit ? 'Credit' : 'Debit')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatDateTime(tx.createdAt || tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-mono font-extrabold ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isCredit ? '+' : '-'}₹{(Number(tx.amount) || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">{tx.status || 'Done'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-outfit font-extrabold">Ledger Receipt Details</h3>
              <button type="button" onClick={() => setSelectedTx(null)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Reference ID</dt>
                <dd className="font-mono font-bold truncate">{selectedTx.transactionId || selectedTx._id || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Timestamp</dt>
                <dd className="font-mono">{formatDateTime(selectedTx.createdAt || selectedTx.date)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-bold">{selectedTx.category || 'General'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-bold capitalize">{selectedTx.status || 'Completed'}</dd>
              </div>
              <div className="flex justify-between gap-2 pt-2 border-t border-border">
                <dt className="text-muted-foreground font-bold">Amount</dt>
                <dd className="font-mono text-base font-black text-primary">
                  ₹{(Number(selectedTx.amount) || 0).toLocaleString('en-IN')}
                </dd>
              </div>
              {selectedTx.description && (
                <div className="pt-2 border-t border-border">
                  <dt className="text-muted-foreground mb-1">Description</dt>
                  <dd className="text-foreground">{selectedTx.description}</dd>
                </div>
              )}
            </dl>
            <Button type="button" onClick={() => setSelectedTx(null)} className="w-full rounded-2xl h-10 text-xs font-bold">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
