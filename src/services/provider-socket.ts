/**
 * Real-time provider socket — a 1:1 port of the Flutter `SocketService`
 * (`ariesxpertv2/lib/core/network/socket_service.dart`).
 *
 * Both clients connect to the same Socket.io server on the backend origin, join the
 * same `therapist-<id>` room via `join_therapist_room`, and listen for the same events.
 * That is what makes the two apps stay in step: when the backend pushes a new lead,
 * a wallet credit, a payment or an SOS dispatch to the mobile app, the parity web app
 * receives the identical event and refreshes the same data.
 *
 * Backend emitters (verified in ariesxpert-backend):
 *   new_broadcast .............. adminModule/broadcasts/broadcasts.service.ts
 *   lead_approved .............. adminModule/treatments/treatments.service.ts
 *   therapist_status_changed ... adminModule/therapists/therapists.service.ts
 *   therapist_wallet_update .... adminModule/finance/wallet.engine.ts
 *   payment_success ............ adminModule/finance/cashfree.service.ts
 *   new_flash_alert ............ adminModule/flash-alerts/flash-alerts.controller.ts
 *   peer_sos_alert ............. adminModule/sos/sos.gateway.ts
 *   sos_backup_dispatch ........ adminModule/sos/sos.gateway.ts
 *   new_message (/chats ns) .... adminModule/chats/chats.gateway.ts
 */

import { io, Socket } from 'socket.io-client';
import { getSocketOrigin } from '@/lib/backend-api-config';
import { readToken } from './api-transport';

export type ProviderSocketEvent =
  | 'lead_approved'
  | 'therapist_status_changed'
  | 'payment_success'
  | 'new_broadcast'
  | 'new_flash_alert'
  | 'peer_sos_alert'
  | 'sos_backup_dispatch'
  | 'therapist_wallet_update'
  | 'new_message'
  | 'connection_state';

export type SocketPayload = Record<string, any>;
type Listener = (payload: SocketPayload) => void;

const ROOT_EVENTS: ProviderSocketEvent[] = [
  'lead_approved',
  'therapist_status_changed',
  'payment_success',
  'new_broadcast',
  'new_flash_alert',
  'peer_sos_alert',
  'sos_backup_dispatch',
  'therapist_wallet_update',
];

class ProviderSocketService {
  private socket: Socket | null = null;
  private chatSocket: Socket | null = null;
  private activeChatRoomId: string | null = null;
  private therapistId: string | null = null;
  private listeners = new Map<ProviderSocketEvent, Set<Listener>>();

  get isConnected() {
    return !!this.socket?.connected;
  }

  /** Mirrors `SocketService.connect(therapistId)`. Safe to call repeatedly. */
  connect(therapistId: string) {
    if (typeof window === 'undefined' || !therapistId) return;

    this.therapistId = therapistId;
    const token = readToken();
    const origin = getSocketOrigin();

    // ─── ROOT SOCKET (/) ───
    if (this.socket?.connected) {
      this.joinRoom(therapistId);
    } else if (!this.socket) {
      this.socket = io(origin, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: token ? { token } : undefined,
        extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 5000,
        reconnectionDelayMax: 15000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        this.emitLocal('connection_state', { connected: true, scope: 'root' });
        if (this.therapistId) this.joinRoom(this.therapistId);
      });

      this.socket.on('disconnect', (reason: string) => {
        this.emitLocal('connection_state', { connected: false, scope: 'root', reason });
      });

      this.socket.on('connect_error', (err: any) => {
        console.warn('[ProviderSocket] connect_error:', err?.message || err);
        this.emitLocal('connection_state', {
          connected: false,
          scope: 'root',
          error: err?.message || String(err),
        });
      });

      for (const event of ROOT_EVENTS) {
        this.socket.on(event, (data: SocketPayload) => {
          this.emitLocal(event, data ?? {});
        });
      }
    }

    // ─── CHAT SOCKET (/chats) ───
    if (this.chatSocket?.connected) {
      if (this.activeChatRoomId) {
        this.chatSocket.emit('join_chat', { roomId: this.activeChatRoomId });
      }
    } else if (!this.chatSocket) {
      this.chatSocket = io(`${origin}/chats`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: token ? { token } : undefined,
        extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 5000,
        reconnectionDelayMax: 15000,
        timeout: 20000,
      });

      this.chatSocket.on('connect', () => {
        this.emitLocal('connection_state', { connected: true, scope: 'chats' });
        if (this.activeChatRoomId) {
          this.chatSocket?.emit('join_chat', { roomId: this.activeChatRoomId });
        }
      });

      this.chatSocket.on('new_message', (data: SocketPayload) => {
        this.emitLocal('new_message', data ?? {});
      });

      this.chatSocket.on('connect_error', (err: any) => {
        console.warn('[ProviderSocket:/chats] connect_error:', err?.message || err);
      });
    }
  }

  private joinRoom(therapistId: string) {
    // The backend expects the raw id string (socket/index.ts → join_therapist_room).
    this.socket?.emit('join_therapist_room', therapistId);
  }

  /** Mirrors `SocketService.joinChat(roomId)`. */
  joinChat(roomId: string) {
    this.activeChatRoomId = roomId;
    if (this.chatSocket?.connected) {
      this.chatSocket.emit('join_chat', { roomId });
    }
  }

  /** Mirrors `SocketService.leaveChat(roomId)`. */
  leaveChat(roomId: string) {
    if (this.activeChatRoomId === roomId) this.activeChatRoomId = null;
    if (this.chatSocket?.connected) {
      this.chatSocket.emit('leave_chat', { roomId });
    }
  }

  /** Mirrors `SocketService.sendChatMessage(roomId, content)`. */
  sendChatMessage(roomId: string, content: string) {
    if (!this.chatSocket?.connected) return false;
    this.chatSocket.emit('send_message', { roomId, content, type: 'text' });
    return true;
  }

  on(event: ProviderSocketEvent, listener: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  private emitLocal(event: ProviderSocketEvent, payload: SocketPayload) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      try {
        listener(payload);
      } catch (err) {
        console.warn(`[ProviderSocket] listener for "${event}" threw:`, err);
      }
    }
  }

  /** Mirrors `SocketService.disconnect()`. */
  disconnect() {
    this.activeChatRoomId = null;
    this.therapistId = null;
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.chatSocket?.removeAllListeners();
    this.chatSocket?.disconnect();
    this.chatSocket = null;
  }
}

export const providerSocket = new ProviderSocketService();
