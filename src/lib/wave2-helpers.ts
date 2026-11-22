export type EarningsLedgerCategory = 'all' | 'visits' | 'bonuses' | 'withdrawals';
export type EarningsLedgerType = 'ALL' | 'CREDIT' | 'DEBIT';
export type EarningsLedgerRange = 'all' | 'week' | 'month' | 'quarter';

export interface EarningsLedgerFilter {
  category?: EarningsLedgerCategory;
  type?: EarningsLedgerType;
  range?: EarningsLedgerRange;
  search?: string;
  now?: Date;
}

export interface EarningsLedgerResult<T = any> {
  items: T[];
  totalCredits: number;
  totalDebits: number;
  netAmount: number;
}

export function classifyLedgerCategory(category?: string, type?: string): Exclude<EarningsLedgerCategory, 'all'> {
  const cat = String(category || '').toUpperCase();
  const txType = String(type || '').toUpperCase();
  if (cat.includes('WITHDRAWAL') || txType === 'DEBIT') return 'withdrawals';
  if (cat.includes('REFERRAL') || cat.includes('BONUS') || cat.includes('REWARD') || cat.includes('ADJUST')) {
    return 'bonuses';
  }
  return 'visits';
}

export function filterEarningsLedger<T extends Record<string, any>>(
  transactions: T[],
  filter: EarningsLedgerFilter = {}
): EarningsLedgerResult<T> {
  const {
    category = 'all',
    type = 'ALL',
    range = 'all',
    search = '',
    now = new Date(),
  } = filter;

  let cutoff: Date | null = null;
  if (range === 'week') {
    cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  } else if (range === 'month') {
    cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === 'quarter') {
    cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  }

  const query = search.trim().toLowerCase();

  const items = (transactions || []).filter((tx) => {
    const txType = String(tx?.type || '').toUpperCase();
    if (type !== 'ALL' && txType !== type) return false;

    if (category !== 'all') {
      const bucket = classifyLedgerCategory(tx?.category, tx?.type);
      if (bucket !== category) return false;
    }

    if (cutoff) {
      const rawDate = tx?.createdAt || tx?.date;
      const d = rawDate ? new Date(rawDate) : null;
      if (!d || Number.isNaN(d.getTime()) || d < cutoff) return false;
    }

    if (query) {
      const haystack = [
        tx?.description,
        tx?.category,
        tx?.transactionId,
        tx?._id,
        tx?.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  let totalCredits = 0;
  let totalDebits = 0;
  for (const tx of items) {
    const amt = Number(tx?.amount) || 0;
    if (String(tx?.type || '').toUpperCase() === 'CREDIT') {
      totalCredits += amt;
    } else if (String(tx?.type || '').toUpperCase() === 'DEBIT') {
      totalDebits += amt;
    }
  }

  return {
    items,
    totalCredits,
    totalDebits,
    netAmount: totalCredits - totalDebits,
  };
}

function escapeCsvCell(value: unknown): string {
  const raw = String(value ?? '');
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  if (/[",\r\n]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

export function buildTransactionsCsv(transactions: Array<Record<string, any>>): string {
  const headers = ['Date', 'Transaction ID', 'Type', 'Category', 'Description', 'Amount (INR)', 'Status'];
  const lines = [headers.map(escapeCsvCell).join(',')];
  for (const tx of transactions || []) {
    const dateVal = tx?.createdAt || tx?.date || '';
    const row = [
      dateVal ? new Date(dateVal).toISOString().slice(0, 10) : '',
      tx?.transactionId || tx?._id || tx?.id || '',
      String(tx?.type || '').toUpperCase(),
      tx?.category || '',
      tx?.description || '',
      Number(tx?.amount) || 0,
      tx?.status || '',
    ];
    lines.push(row.map(escapeCsvCell).join(','));
  }
  return lines.join('\n');
}

export type WebPermissionStatus = 'granted' | 'prompt' | 'denied' | 'unsupported';

export interface PermissionHealthSummary {
  score: number;
  grantedCount: number;
  totalSupported: number;
  statusLabel: 'Optimal' | 'Attention Needed' | 'Action Required';
}

export function computePermissionHealth(
  statuses: Record<string, WebPermissionStatus>
): PermissionHealthSummary {
  const values = Object.values(statuses || {});
  const supported = values.filter((s) => s !== 'unsupported');
  const grantedCount = supported.filter((s) => s === 'granted').length;
  const totalSupported = supported.length;
  const score = totalSupported > 0 ? Math.round((grantedCount / totalSupported) * 100) : 100;
  const statusLabel: PermissionHealthSummary['statusLabel'] =
    score >= 75 ? 'Optimal' : score >= 50 ? 'Attention Needed' : 'Action Required';
  return { score, grantedCount, totalSupported, statusLabel };
}

export type SupportTicketStatus = 'open' | 'pending' | 'resolved';
export type SupportTicketPriority = 'urgent' | 'high' | 'medium' | 'low';

export function normalizeSupportTicketStatus(raw?: string): SupportTicketStatus {
  const s = String(raw || '').trim().toLowerCase();
  if (s === 'resolved' || s === 'closed' || s === 'completed') return 'resolved';
  if (s === 'pending' || s === 'in_progress' || s === 'in progress' || s === 'waiting') return 'pending';
  return 'open';
}

export function normalizeSupportTicketPriority(raw?: string): SupportTicketPriority {
  const p = String(raw || '').trim().toLowerCase();
  if (p === 'urgent' || p === 'critical') return 'urgent';
  if (p === 'high') return 'high';
  if (p === 'low') return 'low';
  return 'medium';
}

export function extractFaqCategories(faqs: Array<Record<string, any>>): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const faq of faqs || []) {
    const raw = String(faq?.category || 'General').trim();
    const label = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'General';
    const key = label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      categories.push(label);
    }
  }
  return categories;
}

/** Deterministic 21x21 verification badge pattern keyed off therapist Aries ID for Digital ID visual verification. */
export function buildDigitalIdPattern(seed: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = border || inner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  const text = seed || 'ARIESXPERT';
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      grid[r][c] = (hash >>> 0) % 2 === 0;
    }
  }
  return grid;
}
