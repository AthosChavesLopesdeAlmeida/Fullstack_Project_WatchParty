import { cookies } from "next/headers";
import {  
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'

import { FriendsList } from "./FriendsList";
import AddFriendForm from './AddFriendForm'

async function getFriends(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.friends ?? [];
}

const page = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const friends = token ? await getFriends(token) : [];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 gap-4">
        <header className='flex flex-row items-center justify-between text-white'>
            <h1 className='font-bold text-2xl'>Watch Party</h1>

            <div className='flex flex-row gap-4'>
                <a href="/rooms" className='opacity-40 hover:opacity-100 transition-all duration-300'>Rooms</a>
                <a href="/friends" className='border-b-1 hover:border-b-2 transition-all duration-300'>Friends</a>
                <a href="/videos" className='opacity-40 hover:opacity-100 transition-all duration-300'>Videos</a>
                <a href="/profile" className='opacity-40 hover:opacity-100 transition-all duration-300'>Profile</a>
            </div>
        </header>

        <Card className="dark flex-1 rounded-sm">
            <CardHeader>
                <CardTitle className='text-3xl flex flex-row justify-between'>
                    Friends
                    <AddFriendForm />
                </CardTitle>
                <CardDescription className='w-130'>
                    Here you can see all of your friends. 
                    You send someoene a friendship invitation?
                    Use the button 'Add friend' and use the person's email to send a invitation!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FriendsList initialFriends={friends} />
            </CardContent>
        </Card>
    </div>
  )
}

export default page