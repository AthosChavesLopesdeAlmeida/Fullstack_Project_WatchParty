import type { ComponentProps } from "react";
import { serverFetch } from "@/lib/server-api";

import {  
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'

import InboxList from "./InboxList";

type InboxProps = ComponentProps<typeof InboxList>;


const Page = async () => {
    const [friendsRes, roomsRes] = await Promise.all([
    serverFetch<{ pendingRequests: InboxProps["FriendshipInvitations"] }>("/friends/pending"),
    serverFetch<{ invites: InboxProps["RoomInvitations"] }>("/rooms/invites"),
    ]);

    const friendInvites = friendsRes.data?.pendingRequests ?? [];
    const roomInvites = roomsRes.data?.invites ?? [];


  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 gap-4">
        <header className='flex flex-row items-center justify-between text-white'>
            <h1 className='font-bold text-2xl'>Watch Party</h1>

            <div className='flex flex-row gap-4'>
                <a href="/rooms" className='opacity-40 hover:opacity-100 transition-all duration-300'>Rooms</a>
                <a href="/friends" className='opacity-40 hover:opacity-100 transition-all duration-300'>Friends</a>
                <a href="/videos" className='opacity-40 hover:opacity-100 transition-all duration-300'>Videos</a>
                <a href="/profile" className='opacity-40 hover:opacity-100 transition-all duration-300'>Profile</a>
                <a href="/inbox" className='border-b-1 hover:border-b-2 transition-all duration-300'>Inbox</a>
            </div>
        </header>

        <Card className="dark flex-1 rounded-sm">
            <CardHeader>
                <CardTitle className='text-3xl flex flex-row justify-between'>
                    Inbox
                </CardTitle>
                <CardDescription className='w-140'>
                    Here you can see all of the requests that you have received. 
                    You can either receive a friendhip request or a room invitation, 
                    accept it or decline it!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <InboxList FriendshipInvitations={friendInvites} RoomInvitations={roomInvites}/>
            </CardContent>
        </Card>
    </div>
  )
}

export default Page