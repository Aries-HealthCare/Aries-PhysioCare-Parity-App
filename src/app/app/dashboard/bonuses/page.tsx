'use client';

import { PageHeader, EmptyState, ErrorState, PageSkeleton, DataTable } from '@/components/ds';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';

export default function BonusesPage() {
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.getBonusOffers(), []);
  const rows = data || [];
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="space-y-4">
      <PageHeader title="Bonuses" description="GET /api/app/gaming/bonus-offers — claim from Rewards uses the same list." />
      {!rows.length ? (
        <EmptyState title="No bonus offers" description="HQ bonus campaigns appear when the gaming module returns them." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(row) => String(row._id || row.id || row.title || 'bonus')}
          columns={[
            { key: 'title', header: 'Offer', render: (row) => row.title || row.name },
            { key: 'amount', header: 'Amount', render: (row) => row.amount || row.coins || '—' },
          ]}
        />
      )}
    </div>
  );
}
