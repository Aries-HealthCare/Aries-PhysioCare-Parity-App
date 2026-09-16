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
  ShieldAlert,
  Gamepad2,
  Video,
  Receipt,
  Activity,
  UserPlus,
  MessageSquare,
  Map,
  Sparkles,
  BadgeCheck,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'work',
    label: 'Work',
    items: [
      { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/app/leads', label: 'Leads', icon: Radio, badge: 'Live' },
      { href: '/app/appointments', label: 'Appointments', icon: CalendarCheck },
      { href: '/app/visits', label: 'Visits', icon: Navigation },
      { href: '/app/map', label: 'Live map', icon: Map },
      { href: '/app/telehealth', label: 'Telehealth', icon: Video },
      { href: '/app/sos', label: 'SOS', icon: ShieldAlert },
    ],
  },
  {
    id: 'patients',
    label: 'Patients',
    items: [
      { href: '/app/patients', label: 'Patients', icon: Users },
      { href: '/app/refer-patient', label: 'Refer patient', icon: UserPlus },
      { href: '/app/chat', label: 'Chat', icon: MessageSquare },
    ],
  },
  {
    id: 'money',
    label: 'Money',
    items: [
      { href: '/app/wallet', label: 'Wallet', icon: Wallet },
      { href: '/app/earnings', label: 'Earnings', icon: TrendingUp },
      { href: '/app/invoices', label: 'Invoices', icon: Receipt },
      { href: '/app/documents', label: 'Documents', icon: FileText },
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    items: [
      { href: '/app/gaming', label: 'Arena', icon: Gamepad2 },
      { href: '/app/rewards', label: 'Rewards', icon: Award },
      { href: '/app/training', label: 'Academy', icon: GraduationCap },
      { href: '/app/quality', label: 'Quality', icon: Activity },
      { href: '/app/buddy', label: 'Buddy', icon: Bot },
      { href: '/app/ai', label: 'Intelligence', icon: Sparkles },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { href: '/app/profile', label: 'Profile', icon: User },
      { href: '/app/profile/digital-id', label: 'Digital ID', icon: BadgeCheck },
      { href: '/app/availability', label: 'Availability', icon: Clock },
      { href: '/app/notifications', label: 'Notifications', icon: Bell },
      { href: '/app/support', label: 'Support', icon: HelpCircle },
      { href: '/app/settings', label: 'Settings', icon: Settings },
      { href: '/app/referrals', label: 'Refer colleague', icon: Share2 },
    ],
  },
];

export const MOBILE_BOTTOM_TABS: NavItem[] = [
  { href: '/app', label: 'Home', icon: LayoutDashboard },
  { href: '/app/appointments', label: 'Appts', icon: CalendarCheck },
  { href: '/app/leads', label: 'Leads', icon: Radio, badge: 'Live' },
  { href: '/app/sos', label: 'SOS', icon: ShieldAlert },
  { href: '/app/more', label: 'More', icon: Settings },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(`${href}/`);
}
