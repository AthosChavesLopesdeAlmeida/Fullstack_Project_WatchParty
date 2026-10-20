"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// GET /friends/pending -> { pendingRequests: FriendshipInvite[] }
type FriendshipInvite = {
  friendshipId: string;
  requesterUsername: string;
  createdAt?: string;
};

// GET /rooms/invites -> { invites: RoomInvitation[] }
interface RoomInvitation {
  roomId: string;
  roomName: string;
  hostUsername: string;
}

interface InboxProps {
  FriendshipInvitations: FriendshipInvite[];
  RoomInvitations: RoomInvitation[];
}

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("pt-BR");
}

const InboxList = ({ FriendshipInvitations, RoomInvitations }: InboxProps) => {
  // local copies, so a card can disappear as soon as the action succeeds
  const [friendInvites, setFriendInvites] = useState(FriendshipInvitations);
  const [roomInvites, setRoomInvites] = useState(RoomInvitations);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const runAction = async (
    id: string,
    path: string,
    method: "POST" | "DELETE",
    fallbackError: string,
    onSuccess: () => void,
  ) => {
    setError("");
    setBusyId(id);

    const response = await apiFetch(path, { method });

    setBusyId(null);

    if (!response.ok) {
      setError(
        response.errorType === "network"
          ? "Unable to connect to the server"
          : ((response.data as { error?: string } | null)?.error ?? fallbackError),
      );
      return;
    }

    onSuccess();
  };

  const removeFriendInvite = (id: string) =>
    setFriendInvites((prev) => prev.filter((invite) => invite.friendshipId !== id));

  const removeRoomInvite = (id: string) =>
    setRoomInvites((prev) => prev.filter((invite) => invite.roomId !== id));

  const acceptFriend = (id: string) =>
    runAction(id, `/friends/${id}/accept`, "POST", "Error accepting friendship request", () => removeFriendInvite(id));

  const rejectFriend = (id: string) =>
    runAction(id, `/friends/${id}/reject`, "POST", "Error rejecting friendship request", () => removeFriendInvite(id));

  const acceptRoomInvitation = (id: string) =>
    runAction(id, `/rooms/${id}/enter`, "POST", "Error accepting room invitation", () => removeRoomInvite(id));

  // declining a room invitation is the same endpoint used to leave a room
  const rejectRoomInvitation = (id: string) =>
    runAction(id, `/rooms/${id}/participants`, "DELETE", "Error rejecting room invitation", () => removeRoomInvite(id));

  if (friendInvites.length === 0 && roomInvites.length === 0) {
    return <p className="text-muted-foreground">Your inbox is empty</p>;
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      {error && <p className="font-bold text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {friendInvites.map((invite) => {
          const sentAt = formatDate(invite.createdAt);

          return (
            <Card key={invite.friendshipId}>
              <CardHeader>
                <CardTitle>{invite.requesterUsername}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Friend request</p>
                {sentAt && (
                  <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                    Sent at {sentAt}
                  </p>
                )}
              </CardContent>

              <CardFooter className="gap-2">
                <Button variant="destructive" size="sm" onClick={() => rejectFriend(invite.friendshipId)} disabled={busyId === invite.friendshipId}>
                  Reject
                </Button>
                <Button className="bg-green-600 text-white hover:bg-green-700" size="sm" onClick={() => acceptFriend(invite.friendshipId)} disabled={busyId === invite.friendshipId}>
                  Accept
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {roomInvites.map((invite) => (
          <Card key={invite.roomId}>
            <CardHeader>
              <CardTitle>{invite.roomName}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">Room invitation</p>
              <p className="text-xs text-muted-foreground">Invited by {invite.hostUsername}</p>
            </CardContent>

            <CardFooter className="gap-2">
              <Button variant="destructive" size="sm" onClick={() => rejectRoomInvitation(invite.roomId)} disabled={busyId === invite.roomId}>
                Reject
              </Button>
              <Button className="bg-green-600 text-white hover:bg-green-700" size="sm" onClick={() => acceptRoomInvitation(invite.roomId)} disabled={busyId === invite.roomId}>
                Accept
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InboxList;