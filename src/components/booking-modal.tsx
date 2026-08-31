'use client';

import * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import BookingForm from '@/components/booking-form';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: Record<string, any>;
}

export default function BookingModal({ isOpen, onClose, context }: BookingModalProps) {
  const isMobile = useIsMobile();
  const [key, setKey] = useState(Date.now()); // Used to reset the form state

  const handleClose = () => {
    onClose();
    // Reset form by changing key after a delay
    setTimeout(() => setKey(Date.now()), 300);
  };
  
  const formProps = {
    service: context?.service || '',
    therapist: context?.therapist || '',
    condition: context?.condition || '',
    onSubmitted: handleClose,
    isModal: true,
  };
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onClose={handleClose}>
        <DrawerContent className="max-h-[92vh] p-0 bg-background/98 backdrop-blur-2xl border-t border-white/15 rounded-t-[2rem] flex flex-col overflow-hidden">
          <DrawerTitle className="sr-only">Book an Appointment</DrawerTitle>
          <DrawerDescription className="sr-only">Fill in the details below to request a home visit.</DrawerDescription>
          <div className="flex-1 overflow-hidden flex flex-col">
            <BookingForm key={key} {...formProps} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden bg-background/98 backdrop-blur-2xl border border-white/10 dark:border-white/15 rounded-[2rem] shadow-2xl shadow-black/80 max-h-[92vh] flex flex-col outline-none">
        <DialogTitle className="sr-only">Book an Appointment</DialogTitle>
        <DialogDescription className="sr-only">Fill in the details below to request a home visit.</DialogDescription>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <BookingForm key={key} {...formProps} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
