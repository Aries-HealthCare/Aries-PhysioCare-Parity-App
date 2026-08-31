'use client';

import { useRequestCallback } from '@/components/request-callback-provider';
import { Button, ButtonProps } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

interface BookAppointmentButtonContentProps extends ButtonProps {
  serviceSlug?: string;
  conditionSlug?: string;
  therapistId?: string;
  pathname: string;
  children: React.ReactNode;
}

export default function BookAppointmentButtonContent({
  serviceSlug,
  conditionSlug,
  therapistId,
  pathname,
  children,
  ...props
}: BookAppointmentButtonContentProps) {
  const { openBookingModal } = useRequestCallback();
  const searchParams = useSearchParams();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    openBookingModal({
      service: serviceSlug || searchParams.get('service') || '',
      condition: conditionSlug || searchParams.get('condition') || '',
      therapist: therapistId || searchParams.get('therapist') || '',
      sourcePath: pathname,
    });
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
