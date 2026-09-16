'use client';

import { PageHeader, EmptyState, ErrorState, PageSkeleton, DataTable } from '@/components/ds';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';
import { useRouter } from 'next/navigation';

export default function DashboardPatientsPage() {
  const router = useRouter();
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.getPatients(), []);
  const rows = data || [];
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="space-y-4">
      <PageHeader title="Patients attended" description="POST /api/app/patient/fetchPatients — the KPI source." />
      {!rows.length ? (
        <EmptyState title="No patients yet" description="Patients assigned to you appear here." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(row) => row._id || row.id}
          onRowClick={(row) => router.push(`/app/patients/${row._id || row.id}`)}
          columns={[
            { key: 'name', header: 'Name', render: (row) => row.fullName || row.name || [row.firstName, row.lastName].filter(Boolean).join(' ') },
            { key: 'phone', header: 'Phone', render: (row) => row.phone || '—' },
            { key: 'city', header: 'City', render: (row) => row.city || row.address?.city || '—' },
          ]}
        />
      )}
    </div>
  );
}
