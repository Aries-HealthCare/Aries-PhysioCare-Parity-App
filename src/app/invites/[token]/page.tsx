import type { Metadata } from 'next';
import { DispatchClaimView } from '@/components/dispatch/dispatch-claim-view';

export const metadata: Metadata = {
  title: 'Secure Visit Assignment',
  description: 'Review and claim your AriesXpert dispatch visit assignment securely.',
};

interface InviteTokenPageProps {
  params: Promise<{ token: string }>;
}

export default async function InviteTokenPage({ params }: InviteTokenPageProps) {
  const { token } = await params;
  return <DispatchClaimView token={token} />;
}
