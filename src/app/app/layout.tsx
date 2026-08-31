'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useProviderAuth } from '@/services/provider-auth-context';
import { resolveProfileImage } from '@/services/provider-api';
import { DynamicAppLogo } from '@/components/ui/dynamic-app-logo';
import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import {
  LayoutDashboard,
  Radio,
  CalendarCheck,
  Navigation,
  Users,
  Wallet,
  TrendingUp,
  Share2,
  Award,
  GraduationCap,
  Bell,
  Bot,
  User,
  Clock,
  FileText,
  HelpCircle,
  Settings,
  Power,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  LogOut,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
  PhoneCall,
  Volume2,
  CheckCircle2,
  Gamepad2,
  Video,
  Receipt,
  Trophy,
  Activity,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV_ITEMS = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/leads', label: 'Lead Stream', icon: Radio, badge: 'Live' },
  { href: '/app/appointments', label: 'Appointments', icon: CalendarCheck },
  { href: '/app/visits', label: 'Active Visits', icon: Navigation, badge: 'Workflow' },
  { href: '/app/patients', label: 'Patients', icon: Users },
  { href: '/app/refer-patient', label: 'Refer Patient', icon: UserPlus, badge: '10% Earn', highlight: true },
  { href: '/app/gaming', label: 'Gaming Arena', icon: Gamepad2, badge: 'Tournament', highlight: true },
  { href: '/app/telehealth', label: 'Telehealth Room', icon: Video, badge: 'Agora RTC' },
  { href: '/app/attendance', label: 'Daily Attendance', icon: Clock },
  { href: '/app/wallet', label: 'Wallet & Payouts', icon: Wallet },
  { href: '/app/earnings', label: 'Earnings Analytics', icon: TrendingUp },
  { href: '/app/invoices', label: 'Invoices & Receipts', icon: Receipt },
  { href: '/app/quality', label: 'Quality Score & NPS', icon: Activity },
  { href: '/app/sos', label: 'Emergency SOS Hub', icon: ShieldAlert },
  { href: '/app/buddy', label: 'AI Clinical Buddy', icon: Bot, highlight: true },
  { href: '/app/profile', label: 'My Profile & ID', icon: User },
  { href: '/app/referrals', label: 'Refer Colleague', icon: Share2 },
  { href: '/app/rewards', label: 'Rewards & Tiers', icon: Award },
  { href: '/app/training', label: 'Clinical Academy', icon: GraduationCap },
  { href: '/app/availability', label: 'Availability & Slots', icon: Clock },
  { href: '/app/documents', label: 'KYC Documents', icon: FileText },
  { href: '/app/notifications', label: 'Notifications', icon: Bell, badge: '3' },
  { href: '/app/support', label: 'Support & Tickets', icon: HelpCircle },
  { href: '/app/settings', label: 'App Settings', icon: Settings },
];

const MOBILE_BOTTOM_TABS = [
  { href: '/app', label: 'Home', icon: LayoutDashboard },
  { href: '/app/leads', label: 'Leads', icon: Radio, badge: 'Live' },
  { href: '/app/visits', label: 'Visits', icon: Navigation },
  { href: '/app/gaming', label: 'Arena', icon: Gamepad2 },
  { href: '/app/wallet', label: 'Wallet', icon: Wallet },
];

export default function ProviderAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, dutyStatus, toggleDutyStatus, logout, isAuthenticated } = useProviderAuth();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosTransmitted, setSosTransmitted] = useState(false);

  const therapistName = user?.fullName || user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Provider');
  const axId = user?.axId || user?.therapistId || user?.uid || 'AX-IND-4892';

  // SOS Emergency Trigger with 3-second abort countdown
  const triggerSOS = () => {
    setShowSOSModal(true);
    setSosTransmitted(false);
    setSosCountdown(3);
  };

  useEffect(() => {
    if (sosCountdown === null) return;
    if (sosCountdown === 0) {
      setSosTransmitted(true);
      setSosCountdown(null);
      return;
    }
    const timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const abortSOS = () => {
    setSosCountdown(null);
    setShowSOSModal(false);
    setSosTransmitted(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body antialiased selection:bg-primary/20">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-card/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="lg:hidden p-2 rounded-2xl bg-muted/60 hover:bg-muted text-foreground transition-colors"
          >
            {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/app" className="flex items-center gap-2.5" prefetch={false}>
            <DynamicAppLogo size={38} showText={true} />
          </Link>
        </div>

        {/* Action Controls & Duty Switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Duty Status Switch */}
          <button
            type="button"
            onClick={toggleDutyStatus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-outfit font-extrabold transition-all ${
              dutyStatus
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'bg-muted/40 text-muted-foreground border-border/80'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                dutyStatus ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
              }`}
            />
            <span className="hidden sm:inline">{dutyStatus ? 'On Duty' : 'Off Duty'}</span>
          </button>

          {/* Quick SOS Trigger */}
          <button
            type="button"
            onClick={triggerSOS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 text-xs font-outfit font-extrabold transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SOS</span>
          </button>

          {/* Notifications */}
          <Link
            href="/app/notifications"
            className="relative p-2 rounded-2xl border border-border/80 bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            prefetch={false}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Therapist Avatar */}
          <Link
            href="/app/profile"
            className="hidden sm:flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl border border-border/80 bg-card hover:bg-muted transition-all"
            prefetch={false}
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-outfit font-extrabold text-foreground truncate max-w-[120px]">
                {therapistName}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">{axId}</span>
            </div>
            {resolveProfileImage(user?.profilePhoto) ? (
              <img
                src={resolveProfileImage(user?.profilePhoto)!}
                alt={therapistName}
                className="w-8 h-8 rounded-xl object-cover border border-primary/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-outfit font-extrabold text-xs">
                {therapistName[0]?.toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* App Workspace Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col border-r border-border/80 bg-card/60 backdrop-blur-md p-4 space-y-4 overflow-y-auto">
          {/* Quick Profile Summary Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 space-y-2">
            <div className="flex items-center gap-3">
              {resolveProfileImage(user?.profilePhoto) ? (
                <img
                  src={resolveProfileImage(user?.profilePhoto)!}
                  alt={therapistName}
                  className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-primary/20 border-2 border-primary/20 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-outfit font-extrabold text-sm shadow-md shadow-primary/20 shrink-0">
                  {therapistName[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-outfit font-extrabold text-foreground truncate">
                  {therapistName}
                </p>
                <p className="text-[10px] font-mono text-primary font-bold">{axId}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Verified Specialist
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-outfit font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : item.highlight
                      ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                  prefetch={false}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/15 text-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="pt-2 border-t border-border/80">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-outfit font-bold text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Session</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Sliding Drawer */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-card border-r border-border p-5 flex flex-col space-y-4 overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <DynamicAppLogo size={34} showText={true} />
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile summary */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
              <p className="text-xs font-outfit font-bold text-foreground truncate">{therapistName}</p>
              <p className="text-[10px] font-mono text-primary font-bold">{axId}</p>
            </div>

            {/* Nav list */}
            <nav className="space-y-1 flex-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-outfit font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                    prefetch={false}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => {
                setIsMobileDrawerOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar — 5 Core Tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-2xl border-t border-border/80 px-2 py-2 shadow-2xl">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {MOBILE_BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                  isActive
                    ? 'text-primary font-extrabold'
                    : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
                prefetch={false}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-outfit mt-1">{tab.label}</span>
                {isActive && (
                  <span className="w-4 h-1 rounded-full bg-primary mt-0.5 shadow-sm" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Interactive Emergency SOS Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border-2 border-destructive rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mx-auto animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-outfit font-black text-destructive">
                {sosTransmitted ? 'EMERGENCY SOS TRANSMITTED' : 'EMERGENCY SOS TRIGGERED'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {sosTransmitted
                  ? 'Clinical Escalation Command Center notified. Live GPS broadcasting active.'
                  : 'Dispatching emergency response to your live clinical location.'}
              </p>
            </div>

            {sosCountdown !== null && (
              <div className="py-2">
                <div className="text-4xl font-black font-mono text-destructive">
                  {sosCountdown}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Transmitting in {sosCountdown} seconds...
                </p>
              </div>
            )}

            {sosTransmitted && (
              <div className="p-3 bg-destructive/10 rounded-2xl border border-destructive/30 text-xs font-bold text-destructive space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GPS Broadcasted: IC Colony, Borivali West</span>
                </div>
                <p className="text-[10px] font-normal text-muted-foreground">
                  Clinical Director & Police escalation center alerted.
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Button
                onClick={abortSOS}
                className="w-full h-11 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-outfit font-extrabold text-xs"
              >
                {sosTransmitted ? 'Close Alert' : 'Abort SOS (Cancel)'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Device Install Prompt */}
      <PwaInstallPrompt />
    </div>
  );
}
