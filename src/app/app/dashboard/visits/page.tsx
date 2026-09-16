'use client';

import { PageHeader, EmptyState, ErrorState, PageSkeleton, DataTable, StatusBadge } from '@/components/ds';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';
import { useRouter } from 'next/navigation';

export default function DashboardVisitsPage() {
  const router = useRouter();
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.getAppointments(), []);
  const rows = data || [];
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="space-y-4">
      <PageHeader title="Visit history" description="Same appointment collection Flutter’s visits KPI drill-down reads." />
      {!rows.length ? (
        <EmptyState title="No visits yet" description="Completed and upcoming visits appear after assignment." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(row) => row._id || row.id}
          onRowClick={(row) => router.push(`/app/appointments/${row._id || row.id}`)}
          columns={[
            { key: 'patient', header: 'Patient', render: (row) => row.patientName || row.patient?.fullName || 'Patient' },
            { key: 'date', header: 'Date', render: (row) => row.appointmentDate || row.scheduledDate || '—' },
            { key: 'type', header: 'Type', render: (row) => row.visitType || row.type || '—' },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status || row.appointmentStatus} /> },
          ]}
        />
      )}
    </div>
  );
}
