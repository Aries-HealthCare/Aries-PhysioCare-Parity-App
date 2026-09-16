'use client';

import { PageHeader, EmptyState, ErrorState, PageSkeleton, DataTable } from '@/components/ds';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';

export default function LeadsTakenPage() {
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.fetchLeadsTakenAnalysis(), []);
  const rows = data?.leads || [];
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="space-y-4">
      <PageHeader title="Leads taken" description="fetchLeadsTekenAnalysis — same spelling as the mobile RPC." />
      {!rows.length ? (
        <EmptyState title="No acquired leads" description="Leads you marked interested appear after HQ approval." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(row) => String(row._id || row.id || row.patientName || 'lead')}
          columns={[
            { key: 'name', header: 'Patient', render: (row) => row.patientName || row.name || 'Lead' },
            { key: 'city', header: 'City', render: (row) => row.city || row.location || '—' },
            { key: 'status', header: 'Status', render: (row) => row.status || row.therapistResponse || '—' },
          ]}
        />
      )}
    </div>
  );
}
