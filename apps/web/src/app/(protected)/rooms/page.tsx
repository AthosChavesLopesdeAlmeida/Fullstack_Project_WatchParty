import type { ComponentProps } from "react";
import { serverFetch } from "@/lib/server-api";

import {  
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'

import CreateRoomForm  from './CreateRoomForm'
import RoomsList from './RoomsList'


type Rooms = ComponentProps<typeof RoomsList>["initialRooms"];


const Page = async () => {

  const res = await serverFetch<{ rooms: Rooms }>("/rooms");
  const rooms = res.data?.rooms ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 gap-4">
        <header className='flex flex-row items-center justify-between text-white'>
            <h1 className='font-bold text-2xl'>Watch Party</h1>

            <div className='flex flex-row gap-4'>
                <a href="/rooms" className='border-b-1 hover:border-b-2 transition-all duration-300'>Rooms</a>
                <a href="/friends" className='opacity-40 hover:opacity-100 transition-all duration-300'>Friends</a>
                <a href="/videos" className='opacity-40 hover:opacity-100 transition-all duration-300'>Videos</a>
                <a href="/profile" className='opacity-40 hover:opacity-100 transition-all duration-300'>Profile</a>
                <a href="/inbox" className='opacity-40 hover:opacity-100 transition-all duration-300'>Inbox</a>
            </div>
        </header>

        <Card className="dark flex-1 rounded-sm">
            <CardHeader>
                <CardTitle className='text-3xl flex flex-row justify-between'>
                    Rooms
                    <CreateRoomForm />
                </CardTitle>
                <CardDescription className='w-140'>
                    Here you can see all of the rooms that you created and all the rooms that you participate. 
                    You don't have a room but want to create one?
                    Use the button 'Create Room', invite your friends and have a good time!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RoomsList initialRooms={rooms}/>
            </CardContent>
        </Card>
    </div>
  )
}

export default Page