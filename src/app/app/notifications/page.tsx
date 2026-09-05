'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { providerApi } from '@/services/provider-api';
import { useRealtimeEvent } from '@/services/provider-realtime';
import {
  Bell,
  Radio,
  Wallet,
  Navigation,
  ShieldCheck,
  CheckCheck,
  Loader2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Clinical notification inbox — the same records the mobile `NotificationProvider` reads:
 *   POST /api/app/notification/fetchNotifications  { expert, limit }
 *   PUT  /api/app/notification/mark-read/:id
 *   POST /api/app/notification/mark-all-read       { expert }
 *   POST /api/app/notification/removeNotification  { notificationId }
 * Reads and deletions are persisted, so an item cleared on the phone is cleared here too.
 */

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  createdAt?: string;
  type: 'LEAD' | 'PAYOUT' | 'VISIT' | 'SYSTEM' | string;
  isRead: boolean;
}

function normalise(raw: any, index: number): NotificationItem {
  return {
    id: raw._id || raw.id || `notif_${index}`,
    title: raw.title || raw.heading || 'System Notification',
    desc: raw.message || raw.body || raw.desc || raw.description || '',
    createdAt: raw.createdAt || raw.time || raw.date,
    type: String(raw.type || 'SYSTEM').toUpperCase(),
    isRead: raw.isRead === true || raw.read === true,
  };
}

function formatWhen(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ProviderNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await providerApi.getNotifications();
      setNotifications(list.map(normalise));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load your notifications from the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Anything the backend pushes into this provider's room can produce a notification.
  useRealtimeEvent(
    ['new_flash_alert', 'new_broadcast', 'lead_approved', 'payment_success', 'therapist_wallet_update'],
    () => {
      void load();
    }
  );

  const handleMarkAllRead = async () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      const res = await providerApi.markAllNotificationsRead();
      if (!res.success) throw new Error(res.message);
      await load();
    } catch (err: any) {
      setNotifications(previous);
      setError(err?.message || 'Could not mark your notifications as read.');
    }
  };

  const handleMarkRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await providerApi.markNotificationRead(id);
    } catch (err: any) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
      setError(err?.message || 'Could not mark that notification as read.');
    }
  };

  const handleRemove = async (id: string) => {
    setBusyId(id);
    const previous = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const res = await providerApi.removeNotification(id);
      if (!res.success) throw new Error(res.message);
    } catch (err: any) {
      setNotifications(previous);
      setError(err?.message || 'Could not remove that notification.');
    } finally {
      setBusyId(null);
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Notifications &amp; Alerts</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {unread > 0
              ? `${unread} unread · live updates on leads, payouts and dispatches.`
              : 'Live updates on incoming leads, session payouts, and operations dispatches.'}
          </p>
        </div>

        {notifications.length > 0 && unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="rounded-xl text-xs font-bold">
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
            <span>Mark All Read</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/30">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center bg-card border border-dashed border-border/80 rounded-3xl">
            <Loader2 className="w-6 h-6 text-muted-foreground mx-auto mb-2 animate-spin" />
            <p className="text-xs font-bold text-foreground">Loading notifications…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center bg-card border border-dashed border-border/80 rounded-3xl">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No new notifications</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              You&apos;re all caught up. Inbound patient broadcasts and payout alerts will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 rounded-3xl border transition-all flex items-start gap-3.5 cursor-pointer ${
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
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {formatWhen(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleRemove(n.id);
                }}
                disabled={busyId === n.id}
                className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                aria-label="Remove notification"
              >
                {busyId === n.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
