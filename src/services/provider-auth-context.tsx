'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { providerApi, MobileExpertProfile } from './provider-api';

interface ProviderAuthContextType {
  user: MobileExpertProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  dutyStatus: boolean;
  toggleDutyStatus: () => Promise<void>;
  loginWithPhoneOtp: (phone: string, otp: string) => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUserData: (data: Partial<MobileExpertProfile>) => void;
  refreshProfile: () => Promise<void>;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

export function ProviderAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MobileExpertProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dutyStatus, setDutyStatus] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Restore session on mount
    const token = providerApi.getToken();
    const cached = typeof window !== 'undefined' ? localStorage.getItem('expert_user_data') : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setDutyStatus(!!parsed.isTherapistActive);
        // Silently refresh from server in background
        if (token && parsed._id) {
          providerApi.refreshUser(parsed._id).then((res) => {
            if (res.success && res.result) {
              setUser(res.result);
              setDutyStatus(!!res.result.isTherapistActive);
              localStorage.setItem('expert_user_data', JSON.stringify(res.result));
            }
          }).catch(() => {});
        }
      } catch (_) {}
    }
    setIsLoading(false);
  }, []);

  const refreshProfile = async () => {
    if (!user?._id) return;
    const res = await providerApi.refreshUser(user._id);
    if (res.success && res.result) {
      setUser(res.result);
      setDutyStatus(!!res.result.isTherapistActive);
      localStorage.setItem('expert_user_data', JSON.stringify(res.result));
    }
  };

  const routeAfterLogin = (userData: MobileExpertProfile) => {
    setUser(userData);
    setDutyStatus(!!userData.isTherapistActive);
    localStorage.setItem('expert_user_data', JSON.stringify(userData));

    const isPending =
      userData.onboardingStatus === 'pending' ||
      (userData.onboardingStep !== undefined && userData.onboardingStep < 4) ||
      !userData.licenseNumber ||
      !userData.city;

    router.push(isPending ? '/onboarding' : '/app');
  };

  const loginWithPhoneOtp = async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await providerApi.verifyOTP(phone, otp);
      if (!res.success) return false;

      const cleanPhone = phone.replace(/\D/g, '').slice(-10);

      // The OTP endpoint returns the expert document for an existing provider. For a
      // number the backend has not onboarded yet it may not, so we ask for the record
      // instead of minting one locally — a synthetic id matches nothing server-side and
      // every screen would then read empty while looking signed in.
      let userData = res.result;
      if (!userData) {
        const status = await providerApi.checkOnboardingStatus(cleanPhone).catch(() => null);
        userData = status?.result;
      }
      if (!userData) {
        userData = {
          _id: '',
          phone: cleanPhone,
          mobileNo: cleanPhone,
          onboardingStatus: 'pending',
          onboardingStep: 0,
        } as MobileExpertProfile;
      }

      routeAfterLogin(userData);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await providerApi.loginFromEmail(email, pass);
      // Without an expert document there is no session to render — report the failure
      // rather than signing the user into an empty shell.
      if (!res.success || !res.result) return false;

      routeAfterLogin(res.result);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Duty toggle. Mirrors `DashboardNotifier.toggleAvailability` — the switch reverts if
   * the backend rejects the change, so the UI never claims a duty state the dispatcher
   * does not have.
   */
  const toggleDutyStatus = async () => {
    if (!user?._id) return;
    const next = !dutyStatus;
    setDutyStatus(next);
    try {
      const res = await providerApi.setTherapistActive(user._id, next);
      if (!res.success) throw new Error(res.message || 'Duty status update rejected');
      const updated = { ...user, isTherapistActive: next };
      setUser(updated);
      localStorage.setItem('expert_user_data', JSON.stringify(updated));
    } catch (err) {
      console.warn('[auth] duty toggle failed, reverting:', err);
      setDutyStatus(!next);
    }
  };

  const updateUserData = (data: Partial<MobileExpertProfile>) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...data } as MobileExpertProfile;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('expert_user_data', JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
  };

  const logout = () => {
    providerApi.clearToken();
    setUser(null);
    setDutyStatus(false);
    router.push('/login');
  };

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
        logout,
        updateUserData,
        refreshProfile,
      }}
    >
      {children}
    </ProviderAuthContext.Provider>
  );
}

export function useProviderAuth(): ProviderAuthContextType {
  const context = useContext(ProviderAuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      dutyStatus: false,
      toggleDutyStatus: async () => {},
      loginWithPhoneOtp: async (phone: string, otp: string) => {
        const res = await providerApi.verifyOTP(phone, otp);
        return res.success;
      },
      loginWithEmail: async (email: string, pass: string) => {
        const res = await providerApi.loginFromEmail(email, pass);
        return res.success;
      },
      logout: () => {},
      updateUserData: () => {},
      refreshProfile: async () => {},
    };
  }
  return context;
}
