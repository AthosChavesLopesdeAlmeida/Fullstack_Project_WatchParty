import { cookies } from "next/headers";
import {  
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'

import ProfileActions from "./ProfileActions";

const page = async () => {

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 gap-4">
        <header className='flex flex-row items-center justify-between text-white'>
            <h1 className='font-bold text-2xl'>Watch Party</h1>

            <div className='flex flex-row gap-4'>
                <a href="/rooms" className='opacity-40 hover:opacity-100 transition-all duration-300'>Rooms</a>
                <a href="/friends" className='opacity-40 hover:opacity-100 transition-all duration-300'>Friends</a>
                <a href="/videos" className='opacity-40 hover:opacity-100 transition-all duration-300'>Videos</a>
                <a href="/profile" className='border-b-1 hover:border-b-2 transition-all duration-300'>Profile</a>
            </div>
        </header>

        <Card className="dark flex-1 rounded-sm items-center justify-center">
            <CardContent>
                <ProfileActions/>
            </CardContent>
        </Card>
    </div>
  )
}

export default page