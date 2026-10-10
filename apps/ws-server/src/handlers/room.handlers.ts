import { WebSocket } from "ws";
import {
  joinRoom,
  leaveRoom,
  broadcastToRoom,
  getRoomParticipants,
  pickRandomParticipant,
} from "../connections";
import { getRoomState, setRoomState } from "../state/room_state";
import { handlePlaybackEvent } from "./playback.handlers";
import { roomRepository, roomParticipantsRepository } from "@watch-party/db";

export async function handleMessage(socket: WebSocket, userId: string, message: any) {
  switch (message.type) {
    case "join-room":
      await handleJoinRoom(socket, userId, message.roomId);
      break;

    case "play":
    case "pause":
    case "seek":
      await handlePlaybackEvent(socket, userId, message);
      break;

    default:
      socket.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
  }
}

async function handleJoinRoom(socket: WebSocket, userId: string, roomId: string) {
  // a sala é buscada sempre, não só quando o Redis está vazio
  const room = await roomRepository.findById(roomId);
  if (!room) {
    socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
    return;
  }

  // a comparação com room.hostId cobre salas criadas antes do item 3
  const allowed =
    room.hostId === userId || (await roomParticipantsRepository.isAcceptedParticipant(userId, roomId));
  if (!allowed) {
    socket.send(JSON.stringify({ type: "error", message: "Not allowed to enter this room" }));
    return;
  }

  let state = await getRoomState(roomId);
  if (!state) {
    state = { hostId: room.hostId, isPlaying: false, position: 0, updatedAt: Date.now() };
    await setRoomState(roomId, state);
  }

  const elapsed = (Date.now() - (state.updatedAt ?? Date.now())) / 1000; // o ?? cobre estados antigos do Redis
  const livePosition = state.isPlaying ? state.position + elapsed : state.position;

  joinRoom(roomId, socket, userId);
  broadcastToRoom(roomId, { type: "user-joined", userId }, socket);
  socket.send(
    JSON.stringify({
      type: "room-state",
      state: { ...state, position: livePosition },
      participants: getRoomParticipants(roomId),
    })
  );
}
// chamado quando um socket desconecta (a partir do server.ts)
export async function handleDisconnect(socket: WebSocket) {
  const meta = leaveRoom(socket);
  if (!meta) return;

  const { roomId, userId } = meta;

  broadcastToRoom(roomId, { type: "user-left", userId });

  const state = await getRoomState(roomId);
  if (!state) return;

  // se quem saiu era o host, transfere pra um participante aleatório
  if (state.hostId === userId) {
    const newHostId = pickRandomParticipant(roomId, userId);

    if (newHostId) {
      await roomRepository.setHost(roomId, newHostId);
      await setRoomState(roomId, { ...state, hostId: newHostId });
      broadcastToRoom(roomId, { type: "host-changed", newHostId });
    }
    // se newHostId for null, a sala ficou vazia — nada a fazer,
    // o estado permanece no Redis até alguém entrar de novo
  }
}