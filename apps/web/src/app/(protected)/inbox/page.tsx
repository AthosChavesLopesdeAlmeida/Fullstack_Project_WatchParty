import { cookies } from "next/headers";

import {  
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'

import InboxList from "./InboxList";


const Page = async () => {
    async function getFriendInvitations(token: string) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/pending`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store", // dados sempre atuais, nunca cacheados entre usuários diferentes
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.pendingRequests ?? data; 
    }

    async function getRoomInvitations(token: string) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/invites`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store", // dados sempre atuais, nunca cacheados entre usuários diferentes
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.invites ?? data; 
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const friendhipInvites = token ? await getFriendInvitations(token) : [];
    const roomInvites = token ? await getRoomInvitations(token) : [];


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
                <InboxList FriendshipInvitations={friendhipInvites} RoomInvitations={roomInvites}/>
            </CardContent>
        </Card>
    </div>
  )
}

export default Page