"use client"
import { useState } from "react";
import { apiFetch } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoomInvitation {
  id: string, 
  roomName: string,
  hostUsername: string
}

interface FriendshipInvitation {
  id: string,
  senderName: string,
  sentAt: Date
}

interface InboxProps {
  FriendshipInvitations: FriendshipInvitation[],
  RoomInvitations: RoomInvitation[]
}

const InboxList = ({ FriendshipInvitations, RoomInvitations }: InboxProps) => {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const rejectFriend = async (id: string) => {
    setError('')
    setIsLoading(true)

    const response = await apiFetch(`/friends/${id}/reject`, { 
        method: "POST"
    });

    setIsLoading(false)
    
    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsLoading(false)
      } else {
        setError((response.data as any)?.error ?? "Error rejecting friendship request");
        setIsLoading(false)
      }
      return;
    }
  }

  const acceptFriend  = async (id: string) => {
    setError('')
    setIsLoading(true)

    const response = await apiFetch(`/friends/${id}/accept`, { 
        method: "POST"
    });

    setIsLoading(false)
    
    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsLoading(false)
      } else {
        setError((response.data as any)?.error ?? "Error rejecting friendship request");
        setIsLoading(false)
      }
      return;
    }
  }

  const rejectRoomIvitation = async (id: string) => {
    setError('')
    setIsLoading(true)

    const response = await apiFetch(`/rooms/${id}/participants`, { 
      method: "DELETE"
    });

    setIsLoading(false)
    
    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsLoading(false)
      } else {
        setError((response.data as any)?.error ?? "Error rejecting room invitation");
        setIsLoading(false)
      }
      return;
    }   
  }

  const acceptRoomInvitation = async (id: string) => {
    setError('')
    setIsLoading(true)

    const response = await apiFetch(`/rooms/${id}/enter`, { 
      method: "POST"
    });

    setIsLoading(false)
    
    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsLoading(false)
      } else {
        setError((response.data as any)?.error ?? "Error accepting room invitation");
        setIsLoading(false)
      }
      return;
    }     
  }

  if (FriendshipInvitations.length === 0 && RoomInvitations.length === 0) {
    return <p className="text-muted-foreground">Your inbox is empty</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
      {FriendshipInvitations.map((fi) => (
          <Card key={fi.id} className="hover:opacity-80 cursor-pointer transition-opacity">
            <CardHeader>  
              <CardTitle>{fi.senderName}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              <p className="text-xs text-muted-foreground">
                Sent at {new Date(fi.sentAt).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>

            <CardFooter>
              <Button variant="destructive" size="sm" onClick={() => rejectFriend(fi.id)} disabled={isLoading}>
                Reject
              </Button>

              <Button className="bg-green-500 text-white-500" size="sm" onClick={() => acceptFriend(fi.id)} disabled={isLoading}>
                Accept
              </Button>

              {error && <p className="text-red-500 font-bold">{error}</p>}
            </CardFooter>
          </Card>
      ))}

      {RoomInvitations.map((ri) => (
          <Card key={ri.id} className="hover:opacity-80 cursor-pointer transition-opacity">
            <CardHeader>  
              <CardTitle>{ri.roomName}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              <p className="text-xs text-muted-foreground">
                Sent by {ri.hostUsername}
              </p>
            </CardContent>

            <CardFooter>
              <Button variant="destructive" size="sm" onClick={() => rejectRoomIvitation(ri.id)} disabled={isLoading}>
                Reject
              </Button>

              <Button className="bg-green-500 text-white-500" size="sm" onClick={() => acceptRoomInvitation(ri.id)} disabled={isLoading}>
                Accept
              </Button>

              {error && <p className="text-red-500 font-bold">{error}</p>}
            </CardFooter>
          </Card>
      ))}
    </div>
  )
}

export default InboxList