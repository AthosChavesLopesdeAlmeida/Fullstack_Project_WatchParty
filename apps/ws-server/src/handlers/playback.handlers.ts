import { WebSocket } from "ws";
import { getRoomState, setRoomState } from "../state/room_state";
import { broadcastToRoom } from "../connections";

interface PlaybackMessage {
  type: "play" | "pause" | "seek";
  roomId: string;
  position: number; // posição atual do vídeo, em segundos
}

export async function handlePlaybackEvent(
  socket: WebSocket,
  userId: string,
  message: PlaybackMessage
) {
  const { type, roomId, position } = message;

  const state = await getRoomState(roomId);
  if (!state) {
    socket.send(JSON.stringify({ type: "error", message: "Room without initialized state" }));
    return;
  }

  // regra de negócio: só o host controla a reprodução
  if (state.hostId !== userId) {
    socket.send(JSON.stringify({ type: "error", message: "Only the host can control the reproduction" }));
    return;
  }

  const updatedState = {
    ...state,
    isPlaying: type === "play" ? true : type === "pause" ? false : state.isPlaying,
    position,
    updatedAt: Date.now(),
  };

  await setRoomState(roomId, updatedState);

  // retransmite pra todo mundo NA SALA, incluindo quem mandou
  // (o próprio host também precisa confirmar que o comando foi aceito)
  broadcastToRoom(roomId, {
    type,
    userId,
    position,
  });
}