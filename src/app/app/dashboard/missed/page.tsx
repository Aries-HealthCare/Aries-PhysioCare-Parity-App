'use client';

import { PageHeader, EmptyState, ErrorState, PageSkeleton, DataTable } from '@/components/ds';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';

export default function MissedLeadsPage() {
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.fetchMissedLeadsAnalysis(), []);
  const rows = data || [];
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="space-y-4">
      <PageHeader title="Missed leads" description="fetchMissLeadsAnalysis — missed broadcasts for this expert." />
      {!rows.length ? (
        <EmptyState title="No missed leads" description="Passed or expired broadcasts will list here." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(row) => String(row._id || row.id || row.patientName || 'missed')}
          columns={[
            { key: 'name', header: 'Lead', render: (row) => row.patientName || row.name || 'Lead' },
            { key: 'reason', header: 'Reason', render: (row) => row.reason || row.status || '—' },
          ]}
        />
      )}
    </div>
  );
}
