"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export interface Friend {
  friendshipId: string;
  friendId: string;
  friendUsername: string;
  status: "pending" | "accepted";
}

export function getColumns(onRemove: (friendshipId: string) => void): ColumnDef<Friend>[] {
  return [
    {
      accessorKey: "friendUsername",
      header: "Username",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (row.original.status === "accepted" ? "Friend" : "Pending request"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="destructive" size="sm" onClick={() => onRemove(row.original.friendshipId)}>
          Remove
        </Button>
      ),
    },
  ];
}