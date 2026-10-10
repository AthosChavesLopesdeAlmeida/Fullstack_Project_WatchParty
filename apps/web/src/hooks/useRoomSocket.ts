"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Estado da sala e do vídeo
export type RoomState = { hostId: string; isPlaying: boolean; position: number };
export type PlaybackEvent = { type: "play" | "pause" | "seek"; position: number };

// Tipos de mensagens que são transmitidas baseadas nas ações na sala
type ServerMessage =
  | { type: "room-state"; state: RoomState; participants: string[] }
  | { type: "user-joined"; userId: string }
  | { type: "user-left"; userId: string }
  | { type: "host-changed"; newHostId: string }
  | { type: "play" | "pause" | "seek"; userId: string; position: number }
  | { type: "error"; message: string };

export function useRoomSocket(roomId: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [lastPlayback, setLastPlayback] = useState<PlaybackEvent | null>(null);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    socketRef.current = socket;

    // só dá pra enviar depois do onopen; antes disso o send() lança erro
    socket.onopen = () => socket.send(JSON.stringify({ type: "join-room", roomId }));

    // O que acontece no caso de cada mensagem
    socket.onmessage = (event) => {
      const msg: ServerMessage = JSON.parse(event.data);
      switch (msg.type) {
        case "room-state":
          setRoomState(msg.state);
          setOnlineIds(msg.participants);
          break;
        case "user-joined":
          setOnlineIds((prev) => [...new Set([...prev, msg.userId])]);
          break;
        case "user-left":
          setOnlineIds((prev) => prev.filter((id) => id !== msg.userId));
          break;
        case "host-changed":
          setRoomState((prev) => (prev ? { ...prev, hostId: msg.newHostId } : prev));
          break;
        // caso o estado do vídeo mude (está rodando, pausado ou procurando um momento específico)
        case "play":
        case "pause":
        case "seek":
          setRoomState((prev) =>
            prev ? { ...prev, position: msg.position, isPlaying: msg.type === "play" ? true : msg.type === "pause" ? false : prev.isPlaying } : prev
          );
          setLastPlayback({ type: msg.type, position: msg.position }); // objeto novo a cada evento
          break;
        case "error":
          console.error("WS:", msg.message);
          break;
      }
    };

    return () => socket.close(); // sem isso, cada navegação deixa uma conexão aberta
  }, [roomId]);

  const sendPlayback = useCallback(
    (type: PlaybackEvent["type"], position: number) => {
      socketRef.current?.send(JSON.stringify({ type, roomId, position }));
    },
    [roomId]
  );

  // Retorna estados, membros online, última ação sobre o vídeo e este playback acima
  return { roomState, onlineIds, lastPlayback, sendPlayback };
}