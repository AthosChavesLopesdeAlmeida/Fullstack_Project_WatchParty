"use client"
import { useState } from 'react'
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

import { PlusCircleIcon } from '@phosphor-icons/react'

const CreateRoomForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)  
  const [roomName, setRoomName] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const response = await apiFetch<{ user: { id: string } }>("/rooms/", {
        method: "GET",
        body: { roomName }
    })

    setIsLoading(false)

    if (!response.ok) {
      if (response.errorType === "network") {
        setError("Unable to connect to the server");
        setIsLoading(false)
      } else {
        setError((response.data as any)?.error ?? "Error creating room");
        setIsLoading(false)
      }
      return;
    }

    setRoomName("")
    router.refresh()
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger className="bg-blue-800 h-10 w-40 text-sm flex flex-row items-center justify-center gap-4 rounded-sm cursor-pointer hover:bg-blue-900 hover:opacity-70">
            <PlusCircleIcon/> Create Room
        </DialogTrigger>

        <DialogContent className="dark">
            <DialogHeader>
                <DialogTitle>Create Room</DialogTitle>
                <DialogDescription>It's easy! To create a room, give it a name and it is done ;&#41;</DialogDescription>
            </DialogHeader>

            <div>
                <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col gap-4'>
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="roomname">Room name</Label>
                        <Input min={3} max={60} required id="roomname" name="roomname" onChange={(e) => setRoomName(e.target.value)} type="text"></Input>
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

export default CreateRoomForm