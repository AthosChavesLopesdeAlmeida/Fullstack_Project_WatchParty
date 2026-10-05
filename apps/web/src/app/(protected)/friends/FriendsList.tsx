"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { DataTable } from "./data-table";
import { getColumns, Friend } from "./columns";

interface FriendsListProps {
  initialFriends: Friend[];
}

export function FriendsList({ initialFriends }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(friendshipId: string) {
    setError(null);

    const response = await apiFetch(`/friends/${friendshipId}`, { method: "DELETE" });

    if (!response.ok) {
      setError(
        response.errorType === "network"
          ? "Unable to connect to the server"
          : "Error removing friendship"
      );
      return;
    }

    // atualização otimista — remove da lista local sem precisar refazer o fetch inteiro
    setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
  }

  const columns = getColumns(handleRemove);

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <DataTable columns={columns} data={friends} />
    </div>
  );
}