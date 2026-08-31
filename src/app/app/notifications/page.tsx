'use client';

import React, { useState } from 'react';
import { providerApi } from '@/services/provider-api';
import {
  Bell,
  CheckCircle2,
  Radio,
  Wallet,
  Clock,
  Navigation,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'LEAD' | 'PAYOUT' | 'VISIT' | 'SYSTEM';
  isRead: boolean;
}

export default function ProviderNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  React.useEffect(() => {
    providerApi.getNotifications().then((notifs) => {
      if (Array.isArray(notifs) && notifs.length > 0) {
        setNotifications(notifs.map((n: any, idx: number) => ({
          id: n.id || n._id || `notif_${idx}`,
          title: n.title || 'System Notification',
          desc: n.message || n.desc || n.body || '',
          time: n.time || 'Recent',
          type: (n.type || 'SYSTEM') as any,
          isRead: !!n.isRead,
        })));
      }
    });
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Notifications & Alerts</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time updates on incoming leads, session payouts, and operations dispatches.
          </p>
        </div>

        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="rounded-xl text-xs font-bold"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
            <span>Mark All Read</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-card border border-dashed border-border/80 rounded-3xl">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No new notifications</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">You're all caught up. Inbound patient broadcasts and payout alerts will appear here.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-3xl border transition-all flex items-start gap-3.5 ${
                n.isRead ? 'border-border/60 bg-card/60' : 'border-primary/30 bg-primary/5 shadow-sm'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'LEAD'
                    ? 'bg-accent/10 text-accent'
                    : n.type === 'PAYOUT'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : n.type === 'VISIT'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-sky-500/10 text-sky-500'
                }`}
              >
                {n.type === 'LEAD' ? (
                  <Radio className="w-4 h-4" />
                ) : n.type === 'PAYOUT' ? (
                  <Wallet className="w-4 h-4" />
                ) : n.type === 'VISIT' ? (
                  <Navigation className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground">{n.title}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
