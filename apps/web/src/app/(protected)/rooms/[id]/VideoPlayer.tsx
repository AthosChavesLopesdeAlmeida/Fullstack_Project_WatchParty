"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { RoomState, PlaybackEvent } from "@/hooks/useRoomSocket";

interface VideoPlayerProps {
  streamUrl: string | null;
  isHost: boolean;
  roomState: RoomState | null;
  lastPlayback: PlaybackEvent | null;
  sendPlayback: (type: PlaybackEvent["type"], position: number) => void;
}

const DRIFT_TOLERANCE = 0.5; // segundos

const VideoPlayer = ({
  streamUrl,
  isHost,
  roomState,
  lastPlayback,
  sendPlayback,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const didInitialSync = useRef(false);
  const [metadataReady, setMetadataReady] = useState(false);
  const [needsClick, setNeedsClick] = useState(false);

  function tryPlay(video: HTMLVideoElement) {
    video.play().catch((err) => {
      // o navegador bloqueou o autoplay: precisa de um clique do usuário
      if (err.name === "NotAllowedError") setNeedsClick(true);
      // AbortError (um pause() chegou antes do play() resolver) é esperado
    });
  }

  // 1) Sincronização inicial: roda uma única vez, quando o estado da sala
  //    e os metadados do vídeo já chegaram
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !roomState || !metadataReady || didInitialSync.current) return;

    didInitialSync.current = true;
    video.currentTime = roomState.position;
    if (roomState.isPlaying) tryPlay(video);
  }, [roomState, metadataReady]);

  // 2) Eventos do host: só os espectadores aplicam
  useEffect(() => {
    const video = videoRef.current;
    if (isHost || !video || !lastPlayback) return;

    if (Math.abs(video.currentTime - lastPlayback.position) > DRIFT_TOLERANCE) {
      video.currentTime = lastPlayback.position;
    }

    if (lastPlayback.type === "play") tryPlay(video);
    if (lastPlayback.type === "pause") video.pause();
  }, [lastPlayback]);

  function handleSyncClick() {
    const video = videoRef.current;
    if (!video || !roomState) return;
    video.currentTime = roomState.position;
    if (roomState.isPlaying) video.play().catch(() => {});
    setNeedsClick(false);
  }

  const currentTime = () => videoRef.current?.currentTime ?? 0;

  if (!streamUrl) {
    return (
      <div className="aspect-video w-full flex items-center justify-center bg-zinc-900 text-zinc-400">
        No video available yet
      </div>
    );
  }


  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        src={streamUrl}
        controls={isHost}
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black"
        onLoadedMetadata={() => setMetadataReady(true)}
        onPlay={() => isHost && sendPlayback("play", currentTime())}
        onPause={() => isHost && sendPlayback("pause", currentTime())}
        onSeeked={() => isHost && sendPlayback("seek", currentTime())}
      />

      {needsClick && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Button onClick={handleSyncClick}>Click to join the playback</Button>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer