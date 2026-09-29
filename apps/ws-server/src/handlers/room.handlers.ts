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
import { roomRepository } from "@watch-party/db";

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
  let state = await getRoomState(roomId);

  // primeira pessoa a entrar na sala (ou Redis foi limpo/reiniciado) — inicializa o estado
  if (!state) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
      return;
    }

    state = {
      hostId: room.hostId,
      isPlaying: false,
      position: 0,
    };
    await setRoomState(roomId, state);
  }

  joinRoom(roomId, socket, userId);

  // avisa a sala que alguém entrou
  broadcastToRoom(roomId, { type: "user-joined", userId }, socket);

  // estado da sala + lista de quem já está presente, pro recém-chegado se situar
  socket.send(
    JSON.stringify({
      type: "room-state",
      state,
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
      const updatedState = { ...state, hostId: newHostId };
      await setRoomState(roomId, updatedState);
      broadcastToRoom(roomId, { type: "host-changed", newHostId });
    }
    // se newHostId for null, a sala ficou vazia — nada a fazer,
    // o estado permanece no Redis até alguém entrar de novo
  }
}