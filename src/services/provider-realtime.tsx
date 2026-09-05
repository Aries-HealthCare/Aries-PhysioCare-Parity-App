'use client';

/**
 * React binding for the provider real-time socket.
 *
 * Mounted once inside the authenticated `/app` shell. It connects to the same
 * `therapist-<id>` room the Flutter app joins, so any backend push that reaches the
 * mobile app also reaches this one. Pages subscribe with `useRealtimeEvent(...)` to
 * re-fetch the affected data — the socket is the change signal, the REST endpoint
 * (identical to mobile's) remains the source of truth.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { providerSocket, ProviderSocketEvent, SocketPayload } from './provider-socket';
import { useProviderAuth } from './provider-auth-context';

interface RealtimeContextValue {
  connected: boolean;
  /** Increments whenever an event of the given kind arrives — usable as an effect dep. */
  revision: Record<ProviderSocketEvent, number>;
  lastEvent: { name: ProviderSocketEvent; payload: SocketPayload; at: number } | null;
  subscribe: (event: ProviderSocketEvent, listener: (payload: SocketPayload) => void) => () => void;
  joinChat: (roomId: string) => void;
  leaveChat: (roomId: string) => void;
  sendChatMessage: (roomId: string, content: string) => boolean;
}

const EMPTY_REVISION = {} as Record<ProviderSocketEvent, number>;

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  revision: EMPTY_REVISION,
  lastEvent: null,
  subscribe: () => () => {},
  joinChat: () => {},
  leaveChat: () => {},
  sendChatMessage: () => false,
});

const TRACKED_EVENTS: ProviderSocketEvent[] = [
  'lead_approved',
  'therapist_status_changed',
  'payment_success',
  'new_broadcast',
  'new_flash_alert',
  'peer_sos_alert',
  'sos_backup_dispatch',
  'therapist_wallet_update',
  'new_message',
];

export function ProviderRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useProviderAuth();
  const therapistId = user?.therapistId || user?._id || user?.id || null;

  const [connected, setConnected] = useState(false);
  const [revision, setRevision] = useState<Record<ProviderSocketEvent, number>>(EMPTY_REVISION);
  const [lastEvent, setLastEvent] =
    useState<{ name: ProviderSocketEvent; payload: SocketPayload; at: number } | null>(null);

  useEffect(() => {
    if (!therapistId) return;
    providerSocket.connect(therapistId);

    const unsubscribers = [
      providerSocket.on('connection_state', (payload) => {
        if (payload.scope === 'root') setConnected(!!payload.connected);
      }),
      ...TRACKED_EVENTS.map((event) =>
        providerSocket.on(event, (payload) => {
          setRevision((prev) => ({ ...prev, [event]: (prev[event] ?? 0) + 1 }));
          setLastEvent({ name: event, payload, at: Date.now() });
        })
      ),
    ];

    return () => {
      unsubscribers.forEach((off) => off());
    };
  }, [therapistId]);

  // Tear the socket down on sign-out so a subsequent login re-authenticates.
  useEffect(() => {
    if (therapistId) return;
    providerSocket.disconnect();
    setConnected(false);
  }, [therapistId]);

  const subscribe = useCallback(
    (event: ProviderSocketEvent, listener: (payload: SocketPayload) => void) =>
      providerSocket.on(event, listener),
    []
  );

  const value = useMemo<RealtimeContextValue>(
    () => ({
      connected,
      revision,
      lastEvent,
      subscribe,
      joinChat: (roomId: string) => providerSocket.joinChat(roomId),
      leaveChat: (roomId: string) => providerSocket.leaveChat(roomId),
      sendChatMessage: (roomId: string, content: string) =>
        providerSocket.sendChatMessage(roomId, content),
    }),
    [connected, revision, lastEvent, subscribe]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useProviderRealtime() {
  return useContext(RealtimeContext);
}

/**
 * Run `handler` whenever one of `events` arrives from the backend.
 * Typical use: `useRealtimeEvent(['new_broadcast', 'lead_approved'], reloadLeads)`.
 */
export function useRealtimeEvent(
  events: ProviderSocketEvent | ProviderSocketEvent[],
  handler: (payload: SocketPayload, event: ProviderSocketEvent) => void
) {
  const { subscribe } = useProviderRealtime();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const list = Array.isArray(events) ? events : [events];
  const key = list.join('|');

  useEffect(() => {
    const offs = key
      .split('|')
      .filter(Boolean)
      .map((event) =>
        subscribe(event as ProviderSocketEvent, (payload) =>
          handlerRef.current(payload, event as ProviderSocketEvent)
        )
      );
    return () => offs.forEach((off) => off());
  }, [key, subscribe]);
}
