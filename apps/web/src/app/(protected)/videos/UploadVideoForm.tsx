"use client"
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

import {  
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from '@/components/ui/dialog'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { UploadIcon } from '@phosphor-icons/react'

const UploadVideoForm = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false)  
  const [videoName, setVideoName] = useState("");

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError('')

    const file = fileInputRef.current?.files?.[0]
    if (!file) {
        setError('Select a video file')
        return
    }

    setIsLoading(true)

    try {
      // 1. pede a URL pré-assinada para o backend
      const createResponse = await apiFetch<{
        video: { id: string };
        uploadUrl: string;
      }>("/videos", {
        method: "POST",
        body: { videoName: videoName || file.name },
      });

      if (!createResponse.ok || !createResponse.data) {
        setError("Error starting upload");
        return;
      }

      const { video, uploadUrl } = createResponse.data;

      // 2. upload direto pro R2 — SEM apiFetch, SEM credentials, SEM Content-Type json
      console.log("create response:", createResponse.data);
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

      if (!uploadRes.ok) {
        setError("Error sending file");
        return;
      }

      // 3. confirma pro backend que o upload terminou
      const completeResponse = await apiFetch(`/videos/${video.id}/complete`, {
        method: "POST",
      });

      if (!completeResponse.ok) {
        setError("Error confirming upload");
        return;
      }


      setVideoName('')
      setIsFormOpen(false)
      if (fileInputRef.current) fileInputRef.current.value === ""

    } catch {
        setError('Unexpected error during the upload')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger className="bg-blue-800 h-10 w-40 text-sm flex flex-row items-center justify-center gap-4 rounded-sm cursor-pointer hover:bg-blue-900 hover:opacity-70">
            <UploadIcon/> Upload Video
        </DialogTrigger>

        <DialogContent className="dark">
            <DialogHeader>
                <DialogTitle>Upload Video</DialogTitle>
                <DialogDescription>To upload a video that you have locally, just give it a name, select its file and hit 'submit' ;&#41;</DialogDescription>
            </DialogHeader>

            <div>
                <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col gap-4'>
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="name">Video Name</Label>
                        <Input required id="name" name="name" onChange={(e) => setVideoName(e.target.value)} type="text"></Input>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="file">Video File</Label>
                        <Input required id='file' name='file' ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/x-matroska"/>
                    </div>

                    <div className="flex flex-col gap-3 text-center">
                        <Button type="submit" variant={"default"} className="cursor-pointer transition-all duration-300" disabled={isLoading}>Submit</Button>
                        {error && <p className="text-red-500 font-bold text-[15px]">{error}</p>}
                    </div>
                </form>
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default UploadVideoForm