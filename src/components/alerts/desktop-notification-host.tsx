'use client';

import { useProviderRealtime } from '@/services/provider-realtime';
import { showBrowserNotification } from '@/lib/browser-notify';
import { useEffect, useRef } from 'react';

export function DesktopNotificationHost() {
  const { lastEvent } = useProviderRealtime();
  const seen = useRef<number>(0);

  useEffect(() => {
    if (!lastEvent || lastEvent.at === seen.current) return;
    seen.current = lastEvent.at;
    const payload = lastEvent.payload || {};
    const title =
      lastEvent.name === 'new_broadcast'
        ? 'New lead nearby'
        : lastEvent.name === 'peer_sos_alert'
          ? 'Peer SOS'
          : lastEvent.name === 'new_flash_alert'
            ? 'HQ flash alert'
            : lastEvent.name === 'new_message'
              ? 'New chat message'
              : null;
    if (!title) return;
    showBrowserNotification(
      title,
      String(payload.message || payload.title || payload.body || 'Open AriesXpert to review.'),
      lastEvent.name === 'new_broadcast' ? '/app/leads' : '/app/notifications'
    );
  }, [lastEvent]);

  return null;
}
