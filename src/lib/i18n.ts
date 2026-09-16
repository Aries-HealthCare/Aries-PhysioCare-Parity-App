export const LOCALES = ['en', 'hi', 'ar', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_STORAGE_KEY = 'ax_locale';

const DICT: Record<Locale, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.leads': 'Leads',
    'nav.appointments': 'Appointments',
    'nav.visits': 'Visits',
    'nav.map': 'Live map',
    'nav.telehealth': 'Telehealth',
    'nav.sos': 'SOS',
    'nav.patients': 'Patients',
    'nav.chat': 'Chat',
    'nav.wallet': 'Wallet',
    'nav.settings': 'Settings',
    'common.save': 'Save',
    'common.retry': 'Retry',
    'notify.enabled': 'Browser alerts on',
    'notify.denied': 'Browser alerts blocked',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.leads': 'लीड्स',
    'nav.appointments': 'अपॉइंटमेंट',
    'nav.visits': 'विजिट',
    'nav.map': 'लाइव मैप',
    'nav.telehealth': 'टेलीहेल्थ',
    'nav.sos': 'SOS',
    'nav.patients': 'मरीज़',
    'nav.chat': 'चैट',
    'nav.wallet': 'वॉलेट',
    'nav.settings': 'सेटिंग्स',
    'common.save': 'सेव',
    'common.retry': 'फिर कोशिश',
    'notify.enabled': 'ब्राउज़र अलर्ट चालू',
    'notify.denied': 'ब्राउज़र अलर्ट बंद',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.leads': 'العملاء',
    'nav.appointments': 'المواعيد',
    'nav.visits': 'الزيارات',
    'nav.map': 'الخريطة',
    'nav.telehealth': 'التطبيب عن بعد',
    'nav.sos': 'SOS',
    'nav.patients': 'المرضى',
    'nav.chat': 'الدردشة',
    'nav.wallet': 'المحفظة',
    'nav.settings': 'الإعدادات',
    'common.save': 'حفظ',
    'common.retry': 'إعادة',
    'notify.enabled': 'تنبيهات المتصفح مفعلة',
    'notify.denied': 'تنبيهات المتصفح محظورة',
  },
  es: {
    'nav.dashboard': 'Panel',
    'nav.leads': 'Leads',
    'nav.appointments': 'Citas',
    'nav.visits': 'Visitas',
    'nav.map': 'Mapa',
    'nav.telehealth': 'Teleconsulta',
    'nav.sos': 'SOS',
    'nav.patients': 'Pacientes',
    'nav.chat': 'Chat',
    'nav.wallet': 'Billetera',
    'nav.settings': 'Ajustes',
    'common.save': 'Guardar',
    'common.retry': 'Reintentar',
    'notify.enabled': 'Alertas del navegador activas',
    'notify.denied': 'Alertas del navegador bloqueadas',
  },
};

export function readLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && LOCALES.includes(stored as Locale)) return stored as Locale;
  return 'en';
}

export function t(key: string, locale: Locale = 'en'): string {
  return DICT[locale]?.[key] || DICT.en[key] || key;
}

export function navLabel(href: string, fallback: string, locale: Locale): string {
  const map: Record<string, string> = {
    '/app': 'nav.dashboard',
    '/app/leads': 'nav.leads',
    '/app/appointments': 'nav.appointments',
    '/app/visits': 'nav.visits',
    '/app/map': 'nav.map',
    '/app/telehealth': 'nav.telehealth',
    '/app/sos': 'nav.sos',
    '/app/patients': 'nav.patients',
    '/app/chat': 'nav.chat',
    '/app/wallet': 'nav.wallet',
    '/app/settings': 'nav.settings',
  };
  const key = map[href];
  return key ? t(key, locale) : fallback;
}
