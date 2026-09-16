'use client';

import Link from 'next/link';
import { NAV_GROUPS } from '@/components/ds/nav-config';
import { PageHeader } from '@/components/ds';
import { useProviderAuth } from '@/services/provider-auth-context';

export default function MorePage() {
  const { logout } = useProviderAuth();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="More" description="All modules. On desktop these live in the sidebar." />
      {NAV_GROUPS.map((group) => (
        <section key={group.id} className="space-y-2">
          <h2 className="text-[11px] font-outfit font-bold uppercase tracking-widest text-muted-foreground">{group.label}</h2>
          <div className="rounded-3xl border border-border bg-card divide-y divide-border">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} prefetch={false} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-outfit font-bold">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <button onClick={logout} className="w-full rounded-2xl border border-destructive/30 text-destructive py-3 text-sm font-bold">
        Logout
      </button>
    </div>
  );
}
