'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, ShieldAlert, X, CheckCircle2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { DynamicAppLogo } from '@/components/ui/dynamic-app-logo';
import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import { isNavActive, MOBILE_BOTTOM_TABS, NAV_GROUPS } from '@/components/ds/nav-config';
import { useProviderAuth } from '@/services/provider-auth-context';
import { ProviderRealtimeProvider, useProviderRealtime } from '@/services/provider-realtime';
import { providerApi, resolveProfileImage } from '@/services/provider-api';
import { APP_VERSION } from '@/lib/expert-session';
import { FlashAlertHost } from '@/components/alerts/flash-alert-host';
import { DesktopNotificationHost } from '@/components/alerts/desktop-notification-host';
import { ProductTour } from '@/components/onboarding/product-tour';
import { navLabel, readLocale } from '@/lib/i18n';
import { useLiveGpsSync } from '@/hooks/use-live-gps-sync';

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      prefetch={false}
      className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-outfit font-bold transition-all ${
        active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      {badge ? (
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase ${active ? 'bg-white/20' : 'bg-primary/15 text-primary'}`}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

const SIDEBAR_STORAGE_KEY = 'aries_sidebar_collapsed';

function ProviderAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, dutyStatus, toggleDutyStatus, logout, isAuthenticated, isLoading } = useProviderAuth();
  const { revision } = useProviderRealtime();

  // Keep Admin Live GPS & App Sync updated while the therapist is signed in and tracking is enabled
  useLiveGpsSync({
    therapistId: user?.id || user?._id || user?.uid || null,
    enabled: Boolean(isAuthenticated && user && user.isActivityTracking !== false),
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosTransmitted, setSosTransmitted] = useState(false);
  const [sosSession, setSosSession] = useState<{ id?: string; lat?: number; lng?: number } | null>(null);
  const [sosError, setSosError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored === '1' || stored === 'true') {
        setSidebarCollapsed(true);
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated, revision.new_flash_alert, revision.new_broadcast, revision.lead_approved]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isLoading, isAuthenticated, router]);

  const locale = typeof window !== 'undefined' ? readLocale() : 'en';
  const therapistName =
    user?.fullName || user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Provider');
  const axId = user?.axId || user?.ariesId || user?.therapistId || '—';
  const profileImg = resolveProfileImage(user?.profilePhoto || user?.profileImageUrl || user?.profileImage);
  const hasUnread = Boolean(unreadCount && unreadCount > 0);

  const triggerSOS = () => {
    setShowSOSModal(true);
    setSosTransmitted(false);
    setSosError(null);
    setSosSession(null);
    setSosCountdown(3);
  };

  const transmitSOS = useCallback(async () => {
    const position = await new Promise<GeolocationPosition | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition((pos) => resolve(pos), () => resolve(null), {
        enableHighAccuracy: true,
        timeout: 8000,
      });
    });
    const coords = position
      ? { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy }
      : undefined;
    try {
      const res = await providerApi.startSOS(coords);
      if (!res.success) {
        setSosError(res.message || 'The dispatch centre rejected the alert.');
        return;
      }
      setSosSession({ id: res.sosSessionId, lat: coords?.lat, lng: coords?.lng });
      setSosTransmitted(true);
      providerApi.setTherapistSOS(true).catch(() => {});
    } catch (err: any) {
      setSosError(err?.message || 'Could not reach the dispatch centre.');
    }
  }, []);

  useEffect(() => {
    if (sosCountdown === null) return;
    if (sosCountdown === 0) {
      setSosCountdown(null);
      void transmitSOS();
      return;
    }
    const timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [sosCountdown, transmitSOS]);

  const abortSOS = useCallback(() => {
    setSosCountdown(null);
    setShowSOSModal(false);
    setSosTransmitted(false);
    setSosError(null);
    setSosSession(null);
  }, []);

  useEffect(() => {
    if (!drawerOpen && !showSOSModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (drawerOpen) {
        setDrawerOpen(false);
        return;
      }
      if (showSOSModal && (sosCountdown !== null || sosTransmitted || sosError)) {
        abortSOS();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, showSOSModal, sosCountdown, sosTransmitted, sosError, abortSOS]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-mono text-muted-foreground tracking-wider">Verifying clinical credentials…</p>
      </div>
    );
  }

  const sidebar = (onNavigate?: () => void) => (
    <>
      <div className="p-4 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 space-y-2">
        <div className="flex items-center gap-3">
          {profileImg ? (
            <img src={profileImg} alt={therapistName} className="w-11 h-11 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-outfit font-extrabold shrink-0">
              {therapistName[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-outfit font-extrabold truncate">{therapistName}</p>
            <p className="text-[10px] font-mono text-primary font-bold truncate">{axId}</p>
          </div>
        </div>
      </div>
      <nav className="space-y-4 flex-1 overflow-y-auto pr-1" aria-label="Primary navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="px-3 mb-1 text-[10px] font-outfit font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={navLabel(item.href, item.label, locale)}
                  icon={item.icon}
                  badge={item.href === '/app/notifications' && hasUnread ? String(unreadCount) : item.badge}
                  active={isNavActive(pathname, item.href)}
                  onClick={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="pt-2 border-t border-border/80 space-y-2">
        <p className="px-3 text-[10px] text-muted-foreground font-mono">v{APP_VERSION}</p>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-outfit font-bold text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body antialiased">
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-card/90 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            className="lg:hidden p-2 rounded-2xl bg-muted/60 hover:bg-muted transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/app" prefetch={false} className="min-w-0 shrink">
            <DynamicAppLogo size={36} showText />
          </Link>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleDutyStatus}
            aria-label={dutyStatus ? 'On duty — switch to Off duty' : 'Off duty — switch to On duty'}
            aria-pressed={dutyStatus}
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-outfit font-extrabold transition-colors ${
              dutyStatus
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-muted/40 text-muted-foreground border-border/80'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${dutyStatus ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
            <span className="hidden sm:inline">{dutyStatus ? 'On duty' : 'Off duty'}</span>
          </button>
          <button
            type="button"
            onClick={triggerSOS}
            aria-label="Trigger Emergency SOS"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/15 transition-colors text-xs font-outfit font-extrabold"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SOS</span>
          </button>
          <Link
            href="/app/notifications"
            prefetch={false}
            aria-label={hasUnread ? `Notifications (${unreadCount} unread)` : 'Notifications'}
            className="relative p-2 rounded-2xl border border-border/80 bg-card hover:bg-muted/60 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {hasUnread ? (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[9px] font-outfit font-extrabold flex items-center justify-center leading-none shadow-sm"
              >
                {unreadCount! > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex min-w-0 overflow-hidden">
        <aside
          className={`hidden lg:flex flex-col shrink-0 border-r border-border/80 bg-card/60 backdrop-blur-md p-4 space-y-4 overflow-y-auto transition-all duration-200 ${
            sidebarCollapsed ? 'w-[76px]' : 'w-64 xl:w-72'
          }`}
        >
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="self-end p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
          {sidebarCollapsed ? (
            <nav className="space-y-2" aria-label="Primary navigation">
              {NAV_GROUPS.flatMap((group) => group.items).map((item) => {
                const Icon = item.icon;
                const label = navLabel(item.href, item.label, locale);
                const showUnreadDot = item.href === '/app/notifications' && hasUnread;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    title={label}
                    aria-label={showUnreadDot ? `${label} (${unreadCount} unread)` : label}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-colors ${
                      isNavActive(pathname, item.href) ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {showUnreadDot ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          ) : (
            sidebar()
          )}
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</main>
      </div>

      {drawerOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-card border-r border-border p-5 flex flex-col space-y-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <DynamicAppLogo size={34} showText />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebar(() => setDrawerOpen(false))}
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Mobile quick navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-2xl border-t border-border/80 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {MOBILE_BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.href === '/app/more' ? pathname === '/app/more' : isNavActive(pathname, tab.href);
            const showMoreBadge = tab.href === '/app/more' && hasUnread;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                aria-label={showMoreBadge ? `${tab.label} (${unreadCount} unread notifications)` : tab.label}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2.5 rounded-2xl transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" />
                  {showMoreBadge ? (
                    <span
                      aria-hidden="true"
                      className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-card"
                    />
                  ) : null}
                </span>
                <span className="text-[10px] font-outfit font-bold mt-1">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {showSOSModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-modal-title"
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-card border-2 border-destructive rounded-3xl w-full max-w-sm p-6 text-center space-y-4">
            <ShieldAlert className="w-10 h-10 text-destructive mx-auto" />
            <h2 id="sos-modal-title" className="text-xl font-outfit font-black text-destructive">
              {sosError ? 'SOS failed' : sosTransmitted ? 'SOS transmitted' : 'Emergency SOS'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {sosError ||
                (sosTransmitted
                  ? 'Dispatch notified. Location is sent only while this tab stays open.'
                  : 'Dispatching your live browser location to the emergency desk.')}
            </p>
            {sosCountdown !== null ? <div className="text-4xl font-black font-mono text-destructive">{sosCountdown}</div> : null}
            {sosTransmitted ? (
              <div className="p-3 bg-destructive/10 rounded-2xl text-xs text-destructive">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                {sosSession?.lat != null
                  ? `${sosSession.lat.toFixed(5)}, ${sosSession.lng?.toFixed(5)}`
                  : 'Alert sent without GPS (permission denied)'}
              </div>
            ) : null}
            <Button onClick={abortSOS} className="w-full rounded-2xl">
              {sosTransmitted || sosError ? 'Close' : 'Abort'}
            </Button>
          </div>
        </div>
      ) : null}

      <FlashAlertHost />
      <DesktopNotificationHost />
      <ProductTour />
      <PwaInstallPrompt />
    </div>
  );
}

export default function ProviderAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderRealtimeProvider>
      <ProviderAppShell>{children}</ProviderAppShell>
    </ProviderRealtimeProvider>
  );
}
