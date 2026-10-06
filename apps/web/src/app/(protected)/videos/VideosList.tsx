"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Video {
    id: string;
    createdAt: Date;
    status: "pending" | "processing" | "ready" | "failed";
    posterId: string;
    videoName: string;
    rawKey: string;
    processedUrl: string | null;
}

interface VideosListProps {
  initialVideos: Video[];
}

export function VideosList({ initialVideos }: VideosListProps) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleRemove = async (id: string) => {
    setError('')
    setIsLoading(true)

    const response = await apiFetch<{ video: { id: string } }>(`/videos/${id}`, { 
        method: "DELETE"
    });

    setIsLoading(false)
    
    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsLoading(false)
      } else {
        setError((response.data as any)?.error ?? "Error deleting video");
        setIsLoading(false)
      }
      return;
    }

    router.refresh()
  }

  if (initialVideos.length === 0) {
    return <p className="text-muted-foreground">You haven't uploaded any videos</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
      {initialVideos.map((video) => (
          <Card key={video.id} className="hover:opacity-80 cursor-pointer transition-opacity">
            <CardHeader>
              <CardTitle>{video.videoName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                URL: {video.processedUrl}
              </p>
            </CardContent>
              <p className="text-xs text-muted-foreground">
                Created at {new Date(video.createdAt).toLocaleDateString("pt-BR")}
              </p>
            <CardFooter>
              <Button variant="destructive" size="sm" onClick={() => handleRemove(video.id)} disabled={isLoading}>
                Delete
              </Button>
              {error && <p className="text-red-500 font-bold">{error}</p>}
            </CardFooter>
          </Card>
      ))}
    </div>
  );
}

export default VideosList