'use client';

import { useEffect, useRef } from 'react';
import { providerApi } from '@/services/provider-api';
import { providerSocket } from '@/services/provider-socket';

interface UseLiveGpsSyncOptions {
  therapistId: string | null | undefined;
  enabled: boolean;
}

async function readBrowserPermission(
  name: 'geolocation' | 'microphone' | 'camera' | 'notifications',
): Promise<'granted' | 'denied' | 'unknown'> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'unknown';
  try {
    const status = await navigator.permissions.query({ name: name as PermissionName });
    if (status.state === 'granted') return 'granted';
    if (status.state === 'denied') return 'denied';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

async function readBatteryLevel(): Promise<number | undefined> {
  if (typeof navigator === 'undefined') return undefined;
  const nav = navigator as Navigator & { getBattery?: () => Promise<{ level?: number }> };
  if (typeof nav.getBattery !== 'function') return undefined;
  try {
    const battery = await nav.getBattery();
    if (typeof battery?.level === 'number' && Number.isFinite(battery.level)) {
      return Math.round(battery.level * 100);
    }
  } catch {
    // Battery API unavailable or restricted
  }
  return undefined;
}

function readNetworkStrength(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  if (navigator.onLine === false) return 'none';
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; type?: string };
  };
  const eff = nav.connection?.effectiveType || nav.connection?.type;
  return typeof eff === 'string' && eff.trim() ? eff.toUpperCase() : 'ONLINE';
}

/**
 * Maintains continuous live GPS telemetry and device permission sync for authenticated
 * Web-Native Parity App users, and responds immediately to Admin `request_device_sync`
 * and `remote_hardware_command` socket events.
 */
export function useLiveGpsSync({ therapistId, enabled }: UseLiveGpsSyncOptions) {
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled || !therapistId || typeof window === 'undefined') return;

    let cancelled = false;
    let watchId: number | null = null;
    let lastTransmittedAt = 0;

    const collectPermissions = async () => {
      const [location, mic, camera] = await Promise.all([
        readBrowserPermission('geolocation'),
        readBrowserPermission('microphone'),
        readBrowserPermission('camera'),
      ]);
      return {
        location,
        mic,
        camera,
        speaker: 'granted',
        contacts: 'unknown',
        gallery: 'unknown',
        files: 'granted',
      };
    };

    const pushDevicePermissions = async () => {
      try {
        const [permissions, batteryLevel] = await Promise.all([
          collectPermissions(),
          readBatteryLevel(),
        ]);
        if (cancelled) return;
        const networkStrength = readNetworkStrength();
        providerSocket.emitPermissionStatus(therapistId, permissions);
        await providerApi.syncDeviceStatus({
          permissions,
          batteryLevel,
          networkStrength,
          devicePlatform: 'web',
        });
      } catch {
        // Non-blocking sync
      }
    };

    const transmitCoordinates = async (pos: GeolocationPosition, force = false) => {
      const now = Date.now();
      if (!force && now - lastTransmittedAt < 25_000) return;
      if (inFlightRef.current) return;
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return;

      inFlightRef.current = true;
      lastTransmittedAt = now;
      try {
        const [batteryLevel, permissions] = await Promise.all([
          readBatteryLevel(),
          collectPermissions(),
        ]);
        if (cancelled) return;
        const networkStrength = readNetworkStrength();
        const accuracy = Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : undefined;
        const heading =
          typeof pos.coords.heading === 'number' && Number.isFinite(pos.coords.heading)
            ? pos.coords.heading
            : undefined;
        const speed =
          typeof pos.coords.speed === 'number' && Number.isFinite(pos.coords.speed)
            ? pos.coords.speed
            : undefined;

        providerSocket.emitMobileLocation({
          therapistId,
          lat,
          lng,
          accuracy,
          batteryLevel,
          networkStrength,
          heading,
          speed,
        });

        await providerApi.trackLiveLocation({
          lat,
          lng,
          accuracy,
          batteryLevel,
          networkStrength,
          heading,
          speed,
          platform: 'web',
          permissions,
        });
      } catch {
        // Non-blocking telemetry failure
      } finally {
        inFlightRef.current = false;
      }
    };

    const captureSingleFix = async (allowPrompt = false, force = false) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return;
      const geoPerm = await readBrowserPermission('geolocation');
      if (geoPerm === 'denied') return;
      // Avoid unsolicited permission prompts on initial passive load; only capture if already granted
      // or explicitly triggered by an admin sync ping.
      if (!allowPrompt && geoPerm !== 'granted') return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) void transmitCoordinates(pos, force);
        },
        () => undefined,
        { enableHighAccuracy: true, timeout: 12_000, maximumAge: 15_000 },
      );
    };

    const startWatcherIfGranted = async () => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return;
      const geoPerm = await readBrowserPermission('geolocation');
      if (cancelled || geoPerm !== 'granted') return;

      void captureSingleFix(false, true);
      if (watchId === null) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (!cancelled) void transmitCoordinates(pos, false);
          },
          () => undefined,
          { enableHighAccuracy: true, timeout: 20_000, maximumAge: 20_000 },
        );
      }
    };

    void pushDevicePermissions();
    void startWatcherIfGranted();

    // Periodic heartbeat every 45s while tab is visible
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      void pushDevicePermissions();
      void captureSingleFix(false, false);
    }, 45_000);

    // Re-check when tab returns to foreground (e.g. user just granted location permission)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void pushDevicePermissions();
        void startWatcherIfGranted();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Respond immediately when Admin clicks "Ping Device / Ping Live GPS"
    const unsubSync = providerSocket.on('request_device_sync', () => {
      void pushDevicePermissions();
      void captureSingleFix(false, true);
    });

    // Acknowledge Admin remote hardware commands cleanly
    const unsubCmd = providerSocket.on('remote_hardware_command', (payload) => {
      const cmd = String(payload?.command || '');
      if (cmd) {
        providerSocket.emitHardwareAck(therapistId, cmd, 'delivered');
      }
    });

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      unsubSync();
      unsubCmd();
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [therapistId, enabled]);
}
