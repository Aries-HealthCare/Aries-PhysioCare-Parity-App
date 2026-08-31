'use client';

import dynamic from 'next/dynamic';
import { useRequestCallback } from '@/components/request-callback-provider';
import { Button, ButtonProps } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

interface BookAppointmentButtonProps extends ButtonProps {
  serviceSlug?: string;
  conditionSlug?: string;
  therapistId?: string;
  children: React.ReactNode;
}

// Use dynamic import to avoid useSearchParams issues during static generation
const BookAppointmentButtonContent = dynamic(
  () => import('./book-appointment-button-content'),
  { ssr: false }
);

export default function BookAppointmentButton({
  serviceSlug,
  conditionSlug,
  therapistId,
  children,
  ...props
}: BookAppointmentButtonProps) {
  const pathname = usePathname();

  return (
    <BookAppointmentButtonContent
      serviceSlug={serviceSlug}
      conditionSlug={conditionSlug}
      therapistId={therapistId}
      pathname={pathname}
      {...props}
    >
      {children}
    </BookAppointmentButtonContent>
  );
}
