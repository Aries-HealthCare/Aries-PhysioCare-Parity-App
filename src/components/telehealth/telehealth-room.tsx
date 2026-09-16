'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface TelehealthRoomProps {
  appId?: string;
  channel?: string;
  token?: string | null;
  uid?: string | number;
}

export function TelehealthRoom({ appId, channel, token, uid }: TelehealthRoomProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!appId || !channel) {
      setError('The backend did not return an Agora app id and channel. Use the meet link fallback.');
      return;
    }
    let cancelled = false;
    let client: any;
    (async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        await client.join(appId, channel, token || null, uid || null);
        const mic = await AgoraRTC.createMicrophoneAudioTrack();
        const cam = await AgoraRTC.createCameraVideoTrack();
        if (cancelled) {
          mic.close();
          cam.close();
          return;
        }
        cam.play(localRef.current!);
        await client.publish([mic, cam]);
        client.on('user-published', async (user: any, mediaType: string) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video') user.videoTrack?.play(remoteRef.current);
          if (mediaType === 'audio') user.audioTrack?.play();
        });
        setJoined(true);
      } catch (err: any) {
        setError(err?.message || 'Could not join the in-browser video room.');
      }
    })();
    return () => {
      cancelled = true;
      client?.leave?.().catch(() => {});
    };
  }, [appId, channel, token, uid]);

  if (error) {
    return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">{error}</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="aspect-video rounded-2xl bg-black overflow-hidden" ref={localRef} />
      <div className="aspect-video rounded-2xl bg-black overflow-hidden" ref={remoteRef} />
      {!joined ? <p className="text-xs text-muted-foreground col-span-full">Joining encrypted video room…</p> : null}
    </div>
  );
}

export function LeaveCallButton({ onLeave }: { onLeave: () => void }) {
  return (
    <Button variant="destructive" className="rounded-2xl" onClick={onLeave}>
      End in-browser call
    </Button>
  );
}
