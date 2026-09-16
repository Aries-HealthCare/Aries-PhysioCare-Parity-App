'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { providerApi } from '@/services/provider-api';
import { useRealtimeEvent } from '@/services/provider-realtime';

export function FlashAlertHost() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const load = async () => {
    try {
      const items = await providerApi.getFlashAlerts();
      setAlerts(Array.isArray(items) ? items : []);
    } catch {
      setAlerts([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useRealtimeEvent(['new_flash_alert'], () => {
    void load();
  });

  const visible = alerts.filter((alert) => {
    const id = alert._id || alert.id;
    return id && !dismissed.includes(id);
  });
  if (!visible.length) return null;

  const alert = visible[0];
  const id = alert._id || alert.id;

  return (
    <div className="fixed top-20 inset-x-4 z-50 mx-auto max-w-lg rounded-3xl border border-amber-500/40 bg-amber-500/15 backdrop-blur-xl p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-outfit font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
            Flash alert
          </p>
          <p className="font-outfit font-extrabold text-sm">{alert.title || 'HQ message'}</p>
          <p className="text-xs text-muted-foreground mt-1">{alert.message || alert.body}</p>
          {alert.link ? (
            <Link
              href={alert.link}
              className="text-xs text-primary font-bold mt-2 inline-block"
              onClick={() => providerApi.trackFlashAlertClick(id).catch(() => {})}
            >
              Open
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          className="p-1 rounded-lg hover:bg-black/10"
          onClick={() => setDismissed((prev) => [...prev, id])}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
