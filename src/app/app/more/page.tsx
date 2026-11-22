'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, LogOut, MapPin, Search, ShieldCheck, X } from 'lucide-react';
import { isNavActive, NAV_GROUPS } from '@/components/ds/nav-config';
import { EmptyState, PageHeader } from '@/components/ds';
import { Input } from '@/components/ui/input';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi, resolveProfileImage } from '@/services/provider-api';
import { APP_VERSION } from '@/lib/expert-session';
import { navLabel, readLocale } from '@/lib/i18n';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function MorePage() {
  const pathname = usePathname();
  const { user, dutyStatus, toggleDutyStatus, logout } = useProviderAuth();
  const [query, setQuery] = useState('');
  const [togglingDuty, setTogglingDuty] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    providerApi
      .getUnreadNotificationCount()
      .then((count) => {
        if (!cancelled) setUnreadCount(count);
      })
      .catch(() => {
        if (!cancelled) setUnreadCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const locale = typeof window !== 'undefined' ? readLocale() : 'en';
  const therapistName =
    user?.fullName ||
    user?.name ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Provider');
  const axId = user?.axId || user?.ariesId || user?.therapistId || '—';
  const designation =
    user?.designation ||
    user?.professionalInfo?.professionalRole ||
    user?.specialization ||
    'Clinical Specialist';
  const city = user?.city || user?.areaOfServiceInfo?.city || '';
  const profileImg = resolveProfileImage(user?.profilePhoto || user?.profileImageUrl || user?.profileImage);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => {
      const groupMatches = normalizedQuery.length > 0 && group.label.toLowerCase().includes(normalizedQuery);
      const items = group.items.filter((item) => {
        if (!normalizedQuery || groupMatches) return true;
        const localized = navLabel(item.href, item.label, locale).toLowerCase();
        return (
          item.label.toLowerCase().includes(normalizedQuery) ||
          localized.includes(normalizedQuery) ||
          (item.badge?.toLowerCase().includes(normalizedQuery) ?? false)
        );
      });
      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  }, [normalizedQuery, locale]);

  const handleToggleDuty = async () => {
    if (togglingDuty) return;
    setTogglingDuty(true);
    try {
      await toggleDutyStatus();
    } finally {
      setTogglingDuty(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Workspace Directory"
        title="All Modules"
        description="Quick access to every clinical workflow, patient tool, earnings ledger, and account preference."
      />

      {/* Profile Summary & Live Duty Toggle */}
      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/app/profile" prefetch={false} className="flex items-center gap-4 min-w-0 group">
            {profileImg ? (
              <img
                src={profileImg}
                alt={therapistName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-primary/25 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-outfit text-lg sm:text-xl font-extrabold shrink-0 shadow-md shadow-primary/20">
                {getInitials(therapistName)}
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-outfit text-base sm:text-lg font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
                  {therapistName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-mono font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  {axId}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="truncate">{designation}</span>
                {city ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      {city}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleToggleDuty}
            disabled={togglingDuty}
            aria-pressed={dutyStatus}
            aria-label={dutyStatus ? 'Currently On Duty. Click to switch Off Duty' : 'Currently Off Duty. Click to switch On Duty'}
            className={`inline-flex items-center justify-center gap-2.5 px-4 py-2.5 min-h-[44px] rounded-2xl border text-xs sm:text-sm font-outfit font-extrabold transition-all shrink-0 disabled:opacity-60 ${
              dutyStatus
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 hover:bg-emerald-500/20'
                : 'bg-muted/60 text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                dutyStatus ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
              }`}
            />
            <span>{togglingDuty ? 'Updating…' : dutyStatus ? 'On Duty' : 'Off Duty'}</span>
          </button>
        </div>
      </section>

      {/* Quick Module Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search modules (e.g. Visits, Wallet, Telehealth, SOS, Patients)…"
          aria-label="Search modules"
          className="h-11 pl-10 pr-10 rounded-2xl bg-card border-border/80"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Grouped Responsive Module Grid */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No modules found"
          description={`No clinical workspace or setting matched "${query.trim()}". Try another keyword or clear your filter.`}
          actionLabel="Clear search"
          onAction={() => setQuery('')}
        />
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <section key={group.id} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-outfit font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.label}
                </h2>
                <span className="text-[11px] font-mono text-muted-foreground">{group.items.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const label = navLabel(item.href, item.label, locale);
                  const active = isNavActive(pathname, item.href);
                  const isSos = item.href === '/app/sos';
                  const chip =
                    item.href === '/app/notifications' && unreadCount && unreadCount > 0
                      ? unreadCount > 99
                        ? '99+'
                        : String(unreadCount)
                      : item.badge;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className={`group relative flex flex-col justify-between gap-3 rounded-3xl border p-4 min-h-[104px] transition-all active:scale-[0.98] ${
                        active
                          ? 'border-primary bg-primary/10 shadow-sm shadow-primary/15'
                          : isSos
                            ? 'border-destructive/25 bg-card hover:border-destructive/50 hover:bg-destructive/5'
                            : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                            active
                              ? 'bg-primary text-white'
                              : isSos
                                ? 'bg-destructive/10 text-destructive group-hover:bg-destructive/15'
                                : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {chip ? (
                          <span
                            className={`text-[10px] font-outfit font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              item.href === '/app/notifications'
                                ? 'bg-primary text-white'
                                : 'bg-primary/15 text-primary'
                            }`}
                          >
                            {chip}
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                      <span className="text-sm font-outfit font-bold text-foreground leading-snug">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Footer Logout */}
      <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs font-mono text-muted-foreground">AriesXpert Provider Portal · v{APP_VERSION}</p>
        <button
          type="button"
          onClick={logout}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 active:scale-[0.99] transition-all text-sm font-outfit font-bold"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
