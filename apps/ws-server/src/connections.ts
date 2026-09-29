import { WebSocket } from "ws";

// roomId -> Set de conexões daquela sala
const roomConnections = new Map<string, Set<WebSocket>>();

// referência inversa: socket -> dados do usuário conectado (pra saber quem desconectou)
const socketMeta = new Map<WebSocket, { userId: string; roomId: string }>();

export function joinRoom(roomId: string, socket: WebSocket, userId: string) {
  if (!roomConnections.has(roomId)) roomConnections.set(roomId, new Set());
  roomConnections.get(roomId)!.add(socket);
  socketMeta.set(socket, { userId, roomId });
}

export function leaveRoom(socket: WebSocket) {
  const meta = socketMeta.get(socket);
  if (!meta) return;
  roomConnections.get(meta.roomId)?.delete(socket);
  socketMeta.delete(socket);
  return meta;
}

export function broadcastToRoom(roomId: string, message: object, exclude?: WebSocket) {
  const sockets = roomConnections.get(roomId);
  if (!sockets) return;
  const payload = JSON.stringify(message);
  for (const socket of sockets) {
    if (socket !== exclude && socket.readyState === socket.OPEN) {
      socket.send(payload);
    }
  }
}

// lista os userIds atualmente conectados numa sala
export function getRoomParticipants(roomId: string): string[] {
  const sockets = roomConnections.get(roomId);
  if (!sockets) return [];

  const userIds: string[] = [];
  for (const socket of sockets) {
    const meta = socketMeta.get(socket);
    if (meta) userIds.push(meta.userId);
  }
  return userIds;
}

// pega um participante aleatório de uma sala, excluindo um userId específico
// (usado na transferência de host — o host que está saindo não pode virar o novo host)
export function pickRandomParticipant(roomId: string, excludeUserId: string): string | null {
  const participants = getRoomParticipants(roomId).filter((id) => id !== excludeUserId);
  if (participants.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * participants.length);
  return participants[randomIndex];
}