import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

interface RoomState {
  hostId: string;
  isPlaying: boolean;
  position: number; // segundos do vídeo
  updatedAt: number; // timestamp (ms) da última atualização
}

export async function getRoomState(roomId: string): Promise<RoomState | null> {
  const raw = await redis.get(`room:${roomId}:state`);
  return raw ? JSON.parse(raw) : null;
}

export async function setRoomState(roomId: string, state: RoomState) {
  await redis.set(`room:${roomId}:state`, JSON.stringify(state));
}