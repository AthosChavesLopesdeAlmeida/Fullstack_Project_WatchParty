// apps/web/src/components/RoomsList.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface Room {
  id: string;
  roomName: string;
  hostId: string;
  hostUsername?: string; // só existe se o backend fizer join com users — ver nota abaixo
  createdAt: string;
}

interface RoomsListProps {
  initialRooms: Room[];
}

export function RoomsList({ initialRooms }: RoomsListProps) {
  if (initialRooms.length === 0) {
    return <p className="text-muted-foreground">Você ainda não tem nenhuma sala.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {initialRooms.map((room) => (
        <Link key={room.id} href={`/room/${room.id}`}>
          <Card className="hover:opacity-80 cursor-pointer transition-opacity">
            <CardHeader>
              <CardTitle>{room.roomName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Host: {room.hostUsername ?? room.hostId}
              </p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Created at {new Date(room.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default RoomsList