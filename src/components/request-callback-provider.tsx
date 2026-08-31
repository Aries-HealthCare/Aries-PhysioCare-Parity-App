'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import RequestCallbackModal from '@/components/request-callback-modal';
import BookingModal from '@/components/booking-modal';

interface RequestCallbackContextType {
  openModal: (context?: Record<string, any>) => void;
  openBookingModal: (context?: Record<string, any>) => void;
}

const RequestCallbackContext = createContext<RequestCallbackContextType | undefined>(undefined);

export function RequestCallbackProvider({ children }: { children: ReactNode }) {
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [modalContext, setModalContext] = useState<Record<string, any> | undefined>();

  const openModal = (context?: Record<string, any>) => {
    setModalContext(context);
    setIsCallbackOpen(true);
  };
  
  const openBookingModal = (context?: Record<string, any>) => {
    setModalContext(context);
    setIsBookingOpen(true);
  };

  const closeCallbackModal = () => {
    setIsCallbackOpen(false);
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
  };

  return (
    <RequestCallbackContext.Provider value={{ openModal, openBookingModal }}>
      {children}
      <RequestCallbackModal isOpen={isCallbackOpen} onClose={closeCallbackModal} context={modalContext} />
      <BookingModal isOpen={isBookingOpen} onClose={closeBookingModal} context={modalContext} />
    </RequestCallbackContext.Provider>
  );
}

export function useRequestCallback() {
  const context = useContext(RequestCallbackContext);
  if (!context) {
    throw new Error('useRequestCallback must be used within a RequestCallbackProvider');
  }
  return context;
}
