'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { persistBrowserSession } from '@/lib/expert-session';
import { isOnboardingPendingReview, needsOnboarding } from '@/lib/onboarding-gate';
import { MobileExpertProfile, providerApi } from './provider-api';

export { isOnboardingPendingReview, needsOnboarding };

interface ProviderAuthContextType {
  user: MobileExpertProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  dutyStatus: boolean;
  toggleDutyStatus: () => Promise<void>;
  loginWithPhoneOtp: (phone: string, otp: string) => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  loginWithEmailOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  updateUserData: (data: Partial<MobileExpertProfile>) => void;
  refreshProfile: () => Promise<void>;
  routeAfterAuth: (userData: MobileExpertProfile) => void;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

function persistUser(userData: MobileExpertProfile) {
  try {
    localStorage.setItem('expert_user_data', JSON.stringify(userData));
    const phone = userData.phone || userData.mobileNo;
    const email = userData.email;
    if (phone || email) {
      localStorage.setItem('cached_active_session', JSON.stringify({ phone, email }));
    }
  } catch {
    /* ignore */
  }
}

export function ProviderAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MobileExpertProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dutyStatus, setDutyStatus] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const applyUser = (userData: MobileExpertProfile | null) => {
    setUser(userData);
    setDutyStatus(!!userData?.isTherapistActive);
    if (userData) persistUser(userData);
  };

  const routeAfterAuth = (userData: MobileExpertProfile) => {
    applyUser(userData);
    if (isOnboardingPendingReview(userData)) {
      router.replace('/onboarding-status');
      return;
    }
    if (needsOnboarding(userData)) {
      router.replace('/onboarding');
      return;
    }
    const next = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null;
    router.replace(next && next.startsWith('/') ? next : '/app');
  };

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const token = providerApi.getToken();
      const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem('expert_user_data') : null;
      let cached: MobileExpertProfile | null = null;
      if (cachedRaw) {
        try {
          cached = JSON.parse(cachedRaw);
        } catch {
          cached = null;
        }
      }

      if (token) {
        await persistBrowserSession(token);
      }

      if (cached?._id) {
        applyUser(cached);
      }

      try {
        if (token && cached?._id) {
          const res = await providerApi.refreshUser(cached._id);
          if (!cancelled && res.success && res.result) applyUser(res.result);
        } else if (!token) {
          const sessionRaw = localStorage.getItem('cached_active_session');
          if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            const res = await providerApi.autoLogin({ email: session.email, phone: session.phone });
            if (!cancelled && res.success && res.result) applyUser(res.result);
          }
        }
      } catch {
        /* keep cached shell; screens will error if the backend is down */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshProfile = async () => {
    if (!user?._id) return;
    const res = await providerApi.refreshUser(user._id);
    if (res.success && res.result) applyUser(res.result);
  };

  const loginWithPhoneOtp = async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await providerApi.verifyOTP(phone, otp);
      if (!res.success) return false;
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      let userData = res.result;
      if (!userData) {
        const status = await providerApi.checkOnboardingStatus(cleanPhone).catch(() => null);
        userData = status?.result;
      }
      if (!userData?._id && !userData?.phone) return false;
      if (res.token) await persistBrowserSession(res.token);
      routeAfterAuth(userData as MobileExpertProfile);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await providerApi.loginFromEmail(email, pass);
      if (!res.success || !res.result) return false;
      if (res.token) await persistBrowserSession(res.token);
      routeAfterAuth(res.result);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmailOtp = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const verified = await providerApi.verifyEmailOTP(email, otp);
      if (!verified.success) return false;
      if (verified.token && verified.result) {
        await persistBrowserSession(verified.token);
        routeAfterAuth(verified.result);
        return true;
      }
      const restored = await providerApi.autoLogin({ email });
      if (!restored.success || !restored.result) return false;
      if (restored.token) await persistBrowserSession(restored.token);
      routeAfterAuth(restored.result);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDutyStatus = async () => {
    if (!user?._id) return;
    const next = !dutyStatus;
    setDutyStatus(next);
    try {
      const res = await providerApi.setTherapistActive(user._id, next);
      if (!res.success) throw new Error(res.message || 'Duty status update rejected');
      applyUser({ ...user, isTherapistActive: next });
    } catch {
      setDutyStatus(!next);
    }
  };

  const updateUserData = (data: Partial<MobileExpertProfile>) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...data } as MobileExpertProfile;
      persistUser(updated);
      return updated;
    });
  };

  const logout = () => {
    providerApi.clearToken();
    setUser(null);
    setDutyStatus(false);
    router.push('/login?force=1');
  };

  useEffect(() => {
    if (isLoading || !user) return;
if ((pathname === '/login' || pathname === '/verify' || pathname === '/reset-password') && typeof window !== 'undefined') {
      const force = new URLSearchParams(window.location.search).get('force');
      if (!force) routeAfterAuth(user);
      return;
    }
    if (pathname?.startsWith('/app')) {
      if (isOnboardingPendingReview(user) && pathname !== '/onboarding-status') {
        router.replace('/onboarding-status');
      } else if (needsOnboarding(user) && !pathname.startsWith('/onboarding')) {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, user, pathname, router]);

  return (
    <ProviderAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        dutyStatus,
        toggleDutyStatus,
        loginWithPhoneOtp,
        loginWithEmail,
        loginWithEmailOtp,
        logout,
        updateUserData,
        refreshProfile,
        routeAfterAuth,
      }}
    >
      {children}
    </ProviderAuthContext.Provider>
  );
}

export function useProviderAuth(): ProviderAuthContextType {
  const context = useContext(ProviderAuthContext);
  if (!context) {
    throw new Error('useProviderAuth must be used within ProviderAuthProvider');
  }
  return context;
}
