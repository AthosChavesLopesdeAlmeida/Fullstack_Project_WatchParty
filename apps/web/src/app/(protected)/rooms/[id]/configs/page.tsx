import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import { RoomMember } from "../ParticipantsSidebar";
import { Button } from "@/components/ui/button";
import ConfigControls from "./ConfigControls";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Room = {
  id: string;
  roomName: string;
  hostId: string;
  currentVideoId: string | null;
};

// Este componente é o que envelopa todo o RoomView
// Tem um cabeçalho com os links, como todas as outra páginas
function Shell({ id, title, children }: { id?: string, title?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 gap-4">
      <header className="flex flex-row items-center justify-between text-white">
        <h1 className="font-bold text-2xl">Watch Party</h1>

        <div className="flex flex-row gap-4">
          <a href="/rooms" className="opacity-40 hover:opacity-100 transition-all duration-300">Rooms</a>
          <a href="/friends" className="opacity-40 hover:opacity-100 transition-all duration-300">Friends</a>
          <a href="/videos" className="opacity-40 hover:opacity-100 transition-all duration-300">Videos</a>
          <a href="/profile" className="opacity-40 hover:opacity-100 transition-all duration-300">Profile</a>
          <a href="/inbox" className='opacity-40 hover:opacity-100 transition-all duration-300'>Inbox</a>
        </div>
      </header>

      <Card className="dark flex-1 rounded-sm">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle className="text-3xl flex flex-row justify-between">{title} - Configurations</CardTitle>
          <Button className="bg-blue-800 h-10 w-40 text-sm text-white flex flex-row items-center justify-center gap-4 rounded-sm cursor-pointer hover:bg-blue-900 hover:opacity-70">
            <a href={`/rooms/${id}`}>Return</a>
          </Button>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; // no Next 15+ params é uma Promise

  // as três chamadas não dependem uma da outra, então rodam juntas
  const [meRes, roomRes, membersRes] = await Promise.all([
    serverFetch<{ user: { id: string } }>("/auth/me"),
    serverFetch<{ room: Room }>(`/rooms/${id}`),
    serverFetch<{ members: RoomMember[] }>(`/rooms/${id}/participants`),
  ]);

  // Em caso de erro de autenticação ou autorização
  if (meRes.status === 401) redirect("/login");

  if (!meRes.data || !roomRes.data?.room) {
    return (
      <Shell>
        <p className="text-red-500">{roomRes.error ?? meRes.error ?? "Room not found"}</p>
      </Shell>
    );
  }

  const room = roomRes.data.room;

  // o endpoint de membros é quem confere se o usuário pertence à sala
  if (!membersRes.data) {
    return (
      <Shell title={room.roomName} id={room.id}>
        <p className="text-red-500">
          {membersRes.error ?? "You don't have access to this room"}
        </p>
      </Shell>
    );
  }

  // essa depende do resultado da sala (precisa do currentVideoId), então vem depois
  let streamUrl: string | null = null;
  if (room.currentVideoId) {
    const videoRes = await serverFetch<{ video: { streamUrl: string | null } }>(
      `/videos/${room.currentVideoId}`
    );
    streamUrl = videoRes.data?.video.streamUrl ?? null;
  }

  return (
    <Shell title={room.roomName} id={room.id}>
      <ConfigControls
        roomId={room.id}
        hostId={room.hostId}
        currentUserId={meRes.data.user.id}
        currentVideoId={room.currentVideoId}
        members={membersRes.data.members}
      />
    </Shell>
  );
};

export default Page;