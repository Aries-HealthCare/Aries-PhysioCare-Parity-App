'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getNextPayoutDate(): string {
  const now = new Date();
  const targetMonth = now.getDate() >= 5
    ? (now.getMonth() + 1) % 12
    : now.getMonth();
  const year = now.getDate() >= 5 && now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  return `5 ${MONTH_NAMES[targetMonth]} ${year}`;
}

export default function ProviderWalletPage() {
  const { user } = useProviderAuth();
  const [walletData, setWalletData] = useState({
    availableBalance: 0,
    pendingBalance: 0,
    walletStatus: 'Active',
    isEligibleForPayout: false,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

  const expertId = user?.therapistId || user?.uid || user?._id || '';

  // Compute KPIs from transaction history (matches wallet.dart logic)
  let totalEarned = 0;
  let totalPaidOut = 0;
  let pendingFromTx = 0;
  for (const tx of transactions) {
    if (tx.type === 'CREDIT') {
      const s = (tx.status || '').toLowerCase();
      if (s === 'completed' || s === 'success') totalEarned += tx.amount;
      else if (s === 'pending') pendingFromTx += tx.amount;
    } else if (tx.type === 'DEBIT' && (tx.category || '').toUpperCase().includes('WITHDRAWAL')) {
      const s = (tx.status || '').toLowerCase();
      if (s === 'completed' || s === 'success') totalPaidOut += tx.amount;
    }
  }
  const available = walletData.availableBalance > 0 ? walletData.availableBalance
    : (user?.walletAmount ?? user?.walletBalance ?? 0);
  const pending = pendingFromTx > 0 ? pendingFromTx : walletData.pendingBalance;
  const totalEarnedFinal = totalEarned > 0 ? (totalEarned + pending) : (available + pending + totalPaidOut);

  // 6-month earnings chart data (matches wallet.dart monthlyEarnings)
  const monthlyEarnings: Record<string, number> = {};
  const chartMonths: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = MONTH_NAMES[d.getMonth()];
    if (!chartMonths.includes(key)) chartMonths.push(key);
    monthlyEarnings[key] = 0;
  }
  for (const tx of transactions) {
    if (tx.type === 'CREDIT' && ['completed', 'success'].includes((tx.status || '').toLowerCase())) {
      const d = new Date(tx.createdAt || tx.date || '');
      if (!isNaN(d.getTime())) {
        const key = MONTH_NAMES[d.getMonth()];
        if (key in monthlyEarnings) monthlyEarnings[key] += tx.amount;
      }
    }
  }
  const maxEarning = Math.max(...Object.values(monthlyEarnings), 1);

  const loadWalletData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const [balanceData, txData] = await Promise.all([
        providerApi.getWalletBalance(),
        expertId ? providerApi.getTransactions(expertId) : Promise.resolve([]),
      ]);
      setWalletData(balanceData);
      setTransactions(txData);
    } catch (e) {
      console.warn('Wallet load error', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [expertId]);

  useEffect(() => { loadWalletData(); }, [loadWalletData]);

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > available) {
      setWithdrawFeedback({ type: 'error', text: `Enter a valid amount (max ₹${available.toLocaleString('en-IN')})` });
      return;
    }
    setIsWithdrawing(true);
    try {
      const res = await providerApi.requestWithdrawal(amount);
      if (res.success) {
        setWithdrawFeedback({ type: 'success', text: `Withdrawal request of ₹${amount.toLocaleString('en-IN')} submitted. Funds credited by ${getNextPayoutDate()}.` });
        setWithdrawAmount('');
        loadWalletData(true);
      } else {
        setWithdrawFeedback({ type: 'error', text: res.message || 'Withdrawal request failed.' });
      }
    } catch {
      setWithdrawFeedback({ type: 'error', text: 'Unable to process withdrawal. Please try again.' });
    } finally {
      setIsWithdrawing(false);
      setTimeout(() => setWithdrawFeedback(null), 8000);
    }
  };

  const filteredTx = transactions.filter((tx) => {
    if (filterType === 'CREDIT') return tx.type === 'CREDIT';
    if (filterType === 'DEBIT') return tx.type === 'DEBIT';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">My Wallet</h1>
          <p className="text-xs text-muted-foreground mt-1">Balance, earnings history & payout requests</p>
        </div>
        <button
          onClick={() => loadWalletData(true)}
          disabled={refreshing}
          className="w-10 h-10 rounded-2xl border border-border/80 bg-card flex items-center justify-center hover:bg-muted transition-colors"
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Wallet Balance Card — matches wallet.dart hero card */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Available Balance</p>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                    ₹{available.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    Status: <span className="font-bold opacity-100">{walletData.walletStatus}</span>
                    {' · '}Next payout: <span className="font-bold opacity-100">{getNextPayoutDate()}</span>
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Wallet className="w-7 h-7" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3">
                  <p className="text-[10px] opacity-70 uppercase tracking-wider">Pending</p>
                  <p className="text-lg font-bold mt-0.5">₹{pending.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3">
                  <p className="text-[10px] opacity-70 uppercase tracking-wider">Total Earned</p>
                  <p className="text-lg font-bold mt-0.5">₹{totalEarnedFinal.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3">
                  <p className="text-[10px] opacity-70 uppercase tracking-wider">Total Paid Out</p>
                  <p className="text-lg font-bold mt-0.5">₹{totalPaidOut.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Request */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold mb-1">Request Withdrawal</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Funds are transferred to your registered bank account by the 5th of each month.
            </p>
            {withdrawFeedback && (
              <div className={`mb-4 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                withdrawFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-red-500/10 text-red-600 border border-red-500/30'
              }`}>
                {withdrawFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {withdrawFeedback.text}
              </div>
            )}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                <Input
                  type="number"
                  placeholder={`Max ₹${available.toLocaleString('en-IN')}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-7 h-11 rounded-xl text-sm"
                  min={100}
                  max={available}
                />
              </div>
              <Button
                onClick={handleWithdrawal}
                disabled={isWithdrawing || available <= 0}
                className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm"
              >
                {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Withdraw'}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Secured by Aries Finance Gateway. IMPS / UPI transfer within 24 hours of 5th.
            </div>
          </div>

          {/* 6-Month Earnings Chart — matches wallet.dart line chart */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold">6-Month Earnings Trend</h2>
              </div>
            </div>
            <div className="flex items-end gap-2 h-24">
              {chartMonths.map((month) => {
                const val = monthlyEarnings[month] || 0;
                const heightPct = (val / maxEarning) * 100;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[9px] font-bold text-muted-foreground">
                      {val > 0 ? `₹${(val / 1000).toFixed(1)}K` : ''}
                    </div>
                    <div
                      className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden"
                      style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: '4px' }}
                    >
                      <div className="absolute inset-0 bg-primary rounded-t-lg" style={{ height: `${heightPct}%`, bottom: 0, top: 'auto' }} />
                    </div>
                    <div className="text-[9px] text-muted-foreground">{month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold">Transaction History</h2>
              <div className="flex rounded-xl overflow-hidden border border-border/60">
                {(['ALL', 'CREDIT', 'DEBIT'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-3 py-1.5 text-[10px] font-bold transition-colors ${
                      filterType === f ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredTx.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTx.map((tx: any, i: number) => {
                  const isCredit = tx.type === 'CREDIT';
                  const txStatus = (tx.status || '').toLowerCase();
                  const isPending = txStatus === 'pending';
                  const isFailed = txStatus === 'failed';
                  const date = formatDate(tx.createdAt || tx.date);
                  const txId = tx._id || tx.id || tx.transactionId || `tx_${i}`;
                  return (
                    <div key={txId} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {isCredit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{tx.description || tx.category || (isCredit ? 'Credit' : 'Debit')}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isCredit ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isCredit ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                        </p>
                        <p className={`text-[10px] font-bold mt-0.5 ${
                          isPending ? 'text-amber-500' : isFailed ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                          {isPending ? '● Pending' : isFailed ? '✕ Failed' : '✓ Done'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
