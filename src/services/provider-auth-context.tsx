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

  const loginWithPhoneOtp = async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    const res = await providerApi.verifyOTP(phone, otp);
    setIsLoading(false);
    if (res.success) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const userData: MobileExpertProfile = res.result || {
        _id: 'exp_' + cleanPhone,
        fullName: '',
        phone: cleanPhone,
        city: '',
        onboardingStatus: 'pending',
        onboardingStep: 0,
        status: 'Active',
        isTherapistActive: true,
      };
      setUser(userData);
      setDutyStatus(!!userData.isTherapistActive);
      localStorage.setItem('expert_user_data', JSON.stringify(userData));

      const isPending =
        userData.onboardingStatus === 'pending' ||
        (userData.onboardingStep !== undefined && userData.onboardingStep < 4) ||
        !userData.licenseNumber ||
        !userData.city;

      if (isPending) {
        router.push('/onboarding');
      } else {
        router.push('/app');
      }
      return true;
    }
    return false;
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const res = await providerApi.loginFromEmail(email, pass);
    setIsLoading(false);
    if (res.success) {
      const userData: MobileExpertProfile = res.result || {
        _id: 'exp_' + Date.now(),
        email,
        fullName: 'Provider',
        city: '',
        onboardingStatus: 'pending',
        onboardingStep: 0,
        status: 'Active',
        isTherapistActive: true,
      };
      setUser(userData);
      setDutyStatus(!!userData.isTherapistActive);
      localStorage.setItem('expert_user_data', JSON.stringify(userData));

      const isPending =
        userData.onboardingStatus === 'pending' ||
        (userData.onboardingStep !== undefined && userData.onboardingStep < 4) ||
        !userData.licenseNumber ||
        !userData.city;

      if (isPending) {
        router.push('/onboarding');
      } else {
        router.push('/app');
      }
      return true;
    }
    return false;
  };

  const toggleDutyStatus = async () => {
    const next = !dutyStatus;
    setDutyStatus(next);
    if (user?._id) {
      await providerApi.setTherapistActive(user._id, next);
      const updated = { ...user, isTherapistActive: next };
      setUser(updated);
      localStorage.setItem('expert_user_data', JSON.stringify(updated));
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
