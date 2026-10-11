"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import VideoPlayer  from "./VideoPlayer";
import ParticipantsSidebar, { type  RoomMember }  from "./ParticipantsSidebar";

interface RoomViewProps {
  roomId: string;
  roomName: string;
  initialHostId: string;
  currentUserId: string;
  members: RoomMember[];
  videoId: string | null;
  streamUrl: string | null;
}

export function RoomView({
  roomId,
  roomName,
  initialHostId,
  currentUserId,
  members,
  videoId,
  streamUrl,
}: RoomViewProps) {
  const router = useRouter();
  const { roomState, onlineIds, lastPlayback, sendPlayback } = useRoomSocket(roomId);

  // o hostId do WebSocket é o que vale depois do primeiro room-state;
  // até lá, usa o que a página carregou
  const hostId = roomState?.hostId ?? initialHostId;
  const isHost = hostId === currentUserId;

  // Congela a URL do vídeo. A URL assinada muda a cada router.refresh(),
  // e trocar o src de um <video> em reprodução reinicia a mídia.
  // Só atualiza se o vídeo da sala mudar, ou se ele ainda não tinha URL.
  const [stream, setStream] = useState({ videoId, url: streamUrl });
  if (stream.videoId !== videoId || (!stream.url && streamUrl)) {
    setStream({ videoId, url: streamUrl });
  }

  // Alguém online que não está em `members` (aceitou o convite depois que a
  // página carregou): pede os dados de novo ao servidor, uma vez por id.
  const refreshedFor = useRef<Set<string>>(new Set());
  useEffect(() => {
    const known = new Set(members.map((m) => m.userId));
    const unknown = onlineIds.filter(
      (id) => !known.has(id) && !refreshedFor.current.has(id)
    );
    if (unknown.length === 0) return;

    unknown.forEach((id) => refreshedFor.current.add(id));
    router.refresh();
  }, [onlineIds, members, router]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{roomName}</h1>
        {isHost && <span className="text-xs text-amber-400">You are the host</span>}
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        <main className="flex-1 min-w-0 flex flex-col gap-2">
          <VideoPlayer
            key={stream.videoId ?? "no-video"}
            streamUrl={stream.url}
            isHost={isHost}
            roomState={roomState}
            lastPlayback={lastPlayback}
            sendPlayback={sendPlayback}
          />
          {!roomState && (
            <p className="text-sm text-zinc-400">Connecting to the room...</p>
          )}
        </main>

        <ParticipantsSidebar
          members={members}
          onlineIds={onlineIds}
          hostId={hostId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}